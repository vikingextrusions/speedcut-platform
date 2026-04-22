"""
Speedcut Geometry Analysis Service
===================================
Local FastAPI service that parses STEP files and extracts
manufacturing-relevant geometry data for instant quoting.

Run with:  uvicorn main:app --reload --port 8100
"""

import os
import math
import tempfile
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import redis
import cadquery as cq
from OCP.BRep import BRep_Tool
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID, TopAbs_SHELL
from OCP.TopExp import TopExp_Explorer
from OCP.BRepCheck import BRepCheck_Analyzer


# ─── App Setup ───

app = FastAPI(
    title="Speedcut Geometry Analysis",
    description="STEP file analysis for instant manufacturing quotes",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)


# ─── Response Models ───

class BoundingBox(BaseModel):
    x_mm: float
    y_mm: float
    z_mm: float


class GeometryAnalysis(BaseModel):
    volume_mm3: float
    surface_area_mm2: float
    bounding_box: BoundingBox
    stock_volume_mm3: float
    material_removal_ratio: float
    face_count: int
    solid_count: int
    is_watertight: bool
    wall_thickness_min_mm: Optional[float] = None
    complexity_score: Optional[float] = None
    recommended_process: Optional[str] = None
    process_confidence: Optional[float] = None


class AnalysisJobResponse(BaseModel):
    job_id: str
    status: str
    estimated_seconds: int
    websocket_channel: str


class AnalysisStatusResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[GeometryAnalysis] = None
    error: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None


# ─── Analysis Logic ───

def count_topology(shape, topology_type) -> int:
    """Count the number of topological entities of a given type."""
    count = 0
    explorer = TopExp_Explorer(shape, topology_type)
    while explorer.More():
        count += 1
        explorer.Next()
    return count


def check_watertight(shape) -> bool:
    """Check if the shape is topologically valid (watertight/closed)."""
    try:
        analyzer = BRepCheck_Analyzer(shape, True)
        return analyzer.IsValid()
    except Exception:
        return False


def calculate_complexity(face_count: int, surface_area: float, volume: float, removal_ratio: float) -> float:
    """Calculate a 0.0-1.0 complexity score derived from topological traits."""
    if volume == 0:
        return 0.0
    sa_vol_ratio = surface_area / volume
    face_factor = min(face_count / 500.0, 1.0)
    score = (face_factor * 0.5) + (min(sa_vol_ratio / 5.0, 1.0) * 0.25) + (removal_ratio * 0.25)
    return min(max(round(score, 3), 0.0), 1.0)


def recommend_process(bb_dims: list[float], mrr: float, is_watertight: bool, face_count: int) -> tuple[str, float]:
    """
    Heuristic process recommendation based on geometry characteristics.
    Returns (process_name, confidence_score).
    """
    if face_count == 0 or sum(bb_dims) == 0:
        return "UNKNOWN", 0.0
        
    score_cnc = 0.0
    score_sheet = 0.0
    score_3dp = 0.0
    
    dims = sorted(bb_dims)
    flatness = dims[0] / dims[2] if dims[2] > 0 else 0
    
    if flatness < 0.15:
        score_sheet += 0.4
    
    if mrr > 0.3:
        score_cnc += 0.4
    if face_count > 20:
        score_cnc += 0.2
    
    if is_watertight and mrr < 0.2:
        score_3dp += 0.3
    if face_count > 50:
        score_3dp += 0.2
    
    scores = {"CNC": score_cnc, "SHEET_METAL": score_sheet, "3DP": score_3dp}
    best = max(scores, key=scores.get)
    total_score = sum(scores.values())
    confidence = scores[best] / total_score if total_score > 0 else 0.0
    
    return best, round(confidence, 3)


def analyse_mesh_file(file_path: str, ext: str) -> GeometryAnalysis:
    """
    Parse an STL or OBJ mesh file using trimesh as a fallback to CadQuery's STEP parser.
    Extracts volume, surface area, and bounding box.
    """
    try:
        import trimesh
    except ImportError:
        raise HTTPException(status_code=500, detail="trimesh library not installed for mesh parsing.")
        
    mesh = trimesh.load(file_path, force='mesh')
    
    try:
        volume = abs(float(mesh.volume)) if hasattr(mesh, 'volume') and mesh.is_volume else abs(float(mesh.convex_hull.volume))
    except Exception:
        volume = 0.0
        
    surface_area = float(mesh.area)
    
    try:
        extents = mesh.extents
        bb_x, bb_y, bb_z = float(extents[0]), float(extents[1]), float(extents[2])
    except Exception:
        bb_x, bb_y, bb_z = 0.0, 0.0, 0.0
    stock_volume = bb_x * bb_y * bb_z
    
    removal_ratio = 0.0
    if stock_volume > 0:
        removal_ratio = 1.0 - (volume / stock_volume)
        
    face_count = len(mesh.faces)
    solid_count = 1
    is_watertight = bool(mesh.is_watertight)
    
    wall_thickness_min = None
    if surface_area > 0:
        wall_thickness_min = round(volume / (surface_area * 0.5), 2)
        
    complexity = calculate_complexity(face_count, surface_area, volume, removal_ratio)
    rec_process, confidence = recommend_process([bb_x, bb_y, bb_z], removal_ratio, is_watertight, face_count)
    
    return GeometryAnalysis(
        volume_mm3=round(volume, 2),
        surface_area_mm2=round(surface_area, 2),
        bounding_box=BoundingBox(
            x_mm=round(bb_x, 2),
            y_mm=round(bb_y, 2),
            z_mm=round(bb_z, 2),
        ),
        stock_volume_mm3=round(stock_volume, 2),
        material_removal_ratio=round(removal_ratio, 4),
        face_count=face_count,
        solid_count=solid_count,
        is_watertight=is_watertight,
        wall_thickness_min_mm=wall_thickness_min,
        complexity_score=complexity,
        recommended_process=rec_process,
        process_confidence=confidence,
    )


def analyse_step_file(file_path: str) -> GeometryAnalysis:
    """
    Parse a STEP file and extract manufacturing-relevant geometry metrics.
    
    Returns volume, surface area, bounding box, face/solid counts,
    and material removal ratio for CNC quoting.
    """
    # Import the STEP file
    imported = cq.importers.importStep(file_path)
    
    # Get the underlying OpenCascade shape
    shape = imported.toOCC()
    
    # ── Volume ──
    vol_props = GProp_GProps()
    BRepGProp.VolumeProperties_s(shape, vol_props)
    volume = vol_props.Mass()
    
    # ── Surface Area ──
    surf_props = GProp_GProps()
    BRepGProp.SurfaceProperties_s(shape, surf_props)
    surface_area = surf_props.Mass()
    
    # ── Bounding Box ──
    bbox = Bnd_Box()
    BRepBndLib.Add_s(shape, bbox)
    x_min, y_min, z_min, x_max, y_max, z_max = bbox.Get()
    
    bb_x = abs(x_max - x_min)
    bb_y = abs(y_max - y_min)
    bb_z = abs(z_max - z_min)
    
    # Stock volume = bounding box volume (raw material block)
    stock_volume = bb_x * bb_y * bb_z
    
    # Material removal ratio (how much material is cut away)
    # Higher ratio = more machining = more expensive
    removal_ratio = 0.0
    if stock_volume > 0:
        removal_ratio = 1.0 - (volume / stock_volume)
    
    # ── Topology Counts ──
    face_count = count_topology(shape, TopAbs_FACE)
    solid_count = count_topology(shape, TopAbs_SOLID)
    
    # ── Watertight Check ──
    is_watertight = check_watertight(shape)
    
    # ── Phase 2: Advanced Metrics ──
    # Wall thickness calculation (Approximation for Phase 1)
    # V / (SA / 2) serves as a rough approximation for shell-like parts
    wall_thickness_min = None
    if surface_area > 0:
        wall_thickness_min = round(volume / (surface_area * 0.5), 2)
        
    complexity = calculate_complexity(face_count, surface_area, volume, removal_ratio)
    rec_process, confidence = recommend_process([bb_x, bb_y, bb_z], removal_ratio, is_watertight, face_count)
    
    return GeometryAnalysis(
        volume_mm3=round(volume, 2),
        surface_area_mm2=round(surface_area, 2),
        bounding_box=BoundingBox(
            x_mm=round(bb_x, 2),
            y_mm=round(bb_y, 2),
            z_mm=round(bb_z, 2),
        ),
        stock_volume_mm3=round(stock_volume, 2),
        material_removal_ratio=round(removal_ratio, 4),
        face_count=face_count,
        solid_count=solid_count,
        is_watertight=is_watertight,
        wall_thickness_min_mm=wall_thickness_min,
        complexity_score=complexity,
        recommended_process=rec_process,
        process_confidence=confidence,
    )


import concurrent.futures

def run_analysis_sync(tmp_path: str, ext: str) -> GeometryAnalysis:
    if ext in (".stl", ".obj"):
        return analyse_mesh_file(tmp_path, ext)
    else:
        return analyse_step_file(tmp_path)


def run_analysis_task(job_id: str, tmp_path: str, ext: str, original_filename: str):
    start_time = time.time()
    try:
        redis_client.hset(f"job:{job_id}", mapping={"status": "processing"})
        
        with concurrent.futures.ProcessPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_analysis_sync, tmp_path, ext)
            analysis = future.result(timeout=120)
            
        processing_time = (time.time() - start_time) * 1000
        
        redis_payload = {
            "status": "complete",
            "result": analysis.model_dump_json(),
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "processing_time_ms": str(round(processing_time, 1))
        }
        redis_client.hset(f"job:{job_id}", mapping=redis_payload)
        
    except concurrent.futures.TimeoutError:
        redis_client.hset(f"job:{job_id}", mapping={
            "status": "failed",
            "error": "Analysis timed out after 120 seconds. Model may be too complex.",
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        redis_client.hset(f"job:{job_id}", mapping={
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "geometry-analysis"}


@app.post("/analyse", response_model=AnalysisJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def queue_analysis(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Queue a CAD file for asynchronous geometry analysis.
    """
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in (".step", ".stp", ".stl", ".obj"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported formats: .step, .stp, .stl, .obj.",
        )
    
    job_id = str(uuid.uuid4())
    
    MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB
    
    try:
        content = await file.read(MAX_UPLOAD_BYTES + 1)
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (exceeds 50MB).")
            
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    now = datetime.now(timezone.utc).isoformat()
    try:
        redis_client.hset(f"job:{job_id}", mapping={
            "job_id": job_id,
            "status": "queued",
            "created_at": now,
            "filename": filename
        })
        redis_client.expire(f"job:{job_id}", 86400)
    except redis.exceptions.RedisError as e:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        raise HTTPException(status_code=503, detail=f"Redis error: {str(e)}")
        
    background_tasks.add_task(run_analysis_task, job_id, tmp_path, ext, filename)
    
    return AnalysisJobResponse(
        job_id=job_id,
        status="queued",
        estimated_seconds=15,
        websocket_channel=f"analysis:{job_id}"
    )


@app.get("/analyse/{job_id}", response_model=AnalysisStatusResponse)
async def get_analysis_status(job_id: str):
    """
    Poll the status of an active analysis job.
    """
    try:
        job_data = redis_client.hgetall(f"job:{job_id}")
    except redis.exceptions.RedisError as e:
        raise HTTPException(status_code=503, detail=f"Redis error: {str(e)}")
        
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
        
    result_obj = None
    if job_data.get("result"):
        result_obj = GeometryAnalysis.model_validate_json(job_data["result"])
        
    return AnalysisStatusResponse(
        job_id=job_data["job_id"],
        status=job_data["status"],
        result=result_obj,
        error=job_data.get("error"),
        created_at=job_data["created_at"],
        completed_at=job_data.get("completed_at")
    )
