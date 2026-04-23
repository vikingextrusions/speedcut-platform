"""
Speedcut Geometry Analysis Service
===================================
FastAPI service that parses STEP/STL/OBJ files and extracts
manufacturing-relevant geometry data for instant quoting.

Run with:  uvicorn main:app --reload --port 8100
"""

import hashlib
import math
import os
import tempfile
import time
import uuid
import concurrent.futures
from datetime import datetime, timezone
from typing import Optional

import httpx
import threading
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import cadquery as cq
from OCP.BRep import BRep_Tool
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopLoc import TopLoc_Location
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID, TopAbs_EDGE, TopAbs_WIRE
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GeomAbs import (
    GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone,
    GeomAbs_Sphere, GeomAbs_Torus, GeomAbs_BSplineSurface,
    GeomAbs_Line, GeomAbs_Circle, GeomAbs_BSplineCurve,
)

# ─── App Setup ───

app = FastAPI(
    title="Speedcut Geometry Analysis",
    description="STEP/STL/OBJ file analysis for instant manufacturing quotes",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ANALYSIS_TIMEOUT_SECONDS = int(os.getenv("ANALYSIS_TIMEOUT_SECONDS", 120))
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
MESH_TOLERANCE = float(os.getenv("MESH_TOLERANCE", "0.1"))
MESH_DIR = os.path.join(tempfile.gettempdir(), "speedcut_meshes")
os.makedirs(MESH_DIR, exist_ok=True)


# ─── Job Store (in-memory, thread-safe — no Redis required) ───

class InMemoryJobStore:
    """Thread-safe dict that mimics the Redis hset/hgetall interface used by this service."""

    def __init__(self):
        self._lock = threading.Lock()
        self._data: dict[str, dict[str, str]] = {}

    def hset(self, key: str, mapping: dict[str, str]) -> None:
        with self._lock:
            if key not in self._data:
                self._data[key] = {}
            self._data[key].update({k: str(v) for k, v in mapping.items()})

    def hgetall(self, key: str) -> dict[str, str]:
        with self._lock:
            return dict(self._data.get(key, {}))

    def expire(self, key: str, seconds: int) -> None:
        pass  # No-op for dev — jobs live until process restarts


# Try Redis first, fall back to in-memory
def _create_job_store():
    redis_host = os.getenv("REDIS_HOST", "")
    if redis_host:
        try:
            import redis
            client = redis.Redis(host=redis_host, port=int(os.getenv("REDIS_PORT", 6379)), decode_responses=True)
            client.ping()
            print("[OK] Connected to Redis at", redis_host)
            return client
        except Exception as e:
            print(f"[WARN] Redis unavailable ({e}), using in-memory job store")
    else:
        print("[INFO] REDIS_HOST not set, using in-memory job store (fine for local dev)")
    return InMemoryJobStore()


job_store = _create_job_store()


# ─── Response Models ───

class BoundingBox(BaseModel):
    x_mm: float
    y_mm: float
    z_mm: float


class FaceBreakdown(BaseModel):
    planar: int = 0
    cylindrical: int = 0
    conical: int = 0
    spherical: int = 0
    toroidal: int = 0
    bspline: int = 0
    other: int = 0


class EdgeBreakdown(BaseModel):
    lines: int = 0
    arcs: int = 0
    bsplines: int = 0
    other: int = 0


class GeometryAnalysis(BaseModel):
    # Core
    volume_mm3: float
    surface_area_mm2: float
    bounding_box: BoundingBox
    stock_volume_mm3: float
    material_removal_ratio: float
    # Topology
    face_count: int
    solid_count: int
    edge_count: int = 0
    is_watertight: bool
    # Breakdowns
    face_breakdown: Optional[FaceBreakdown] = None
    edge_breakdown: Optional[EdgeBreakdown] = None
    estimated_perimeter_mm: Optional[float] = None
    # Derived
    wall_thickness_min_mm: Optional[float] = None
    complexity_score: Optional[float] = None   # 0–100
    recommended_process: Optional[str] = None
    process_confidence: Optional[float] = None
    # Meta
    file_hash: Optional[str] = None
    processing_time_ms: Optional[float] = None
    mesh_url: Optional[str] = None  # URL to the GLB mesh file for 3D viewing


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


class AnalyseStorageRequest(BaseModel):
    storage_path: str       # e.g. "user-id/filename.step"
    file_id: str            # UUID of the files table row
    geometry_result_id: str # UUID pre-created by Next.js for the geometry_results row


# ─── Topology Helpers ───

def _count_topology(shape, topology_type) -> int:
    count = 0
    explorer = TopExp_Explorer(shape, topology_type)
    while explorer.More():
        count += 1
        explorer.Next()
    return count


def _check_watertight(shape) -> bool:
    try:
        return BRepCheck_Analyzer(shape, True).IsValid()
    except Exception:
        return False


def _analyse_faces(shape) -> FaceBreakdown:
    fb = FaceBreakdown()
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        try:
            face = TopoDS.Face_s(explorer.Current())
            stype = BRepAdaptor_Surface(face).GetType()
            if stype == GeomAbs_Plane:          fb.planar += 1
            elif stype == GeomAbs_Cylinder:     fb.cylindrical += 1
            elif stype == GeomAbs_Cone:         fb.conical += 1
            elif stype == GeomAbs_Sphere:       fb.spherical += 1
            elif stype == GeomAbs_Torus:        fb.toroidal += 1
            elif stype == GeomAbs_BSplineSurface: fb.bspline += 1
            else:                               fb.other += 1
        except Exception:
            fb.other += 1
        explorer.Next()
    return fb


def _analyse_edges(shape) -> EdgeBreakdown:
    eb = EdgeBreakdown()
    explorer = TopExp_Explorer(shape, TopAbs_EDGE)
    while explorer.More():
        try:
            edge = TopoDS.Edge_s(explorer.Current())
            ctype = BRepAdaptor_Curve(edge).GetType()
            if ctype == GeomAbs_Line:           eb.lines += 1
            elif ctype == GeomAbs_Circle:       eb.arcs += 1
            elif ctype == GeomAbs_BSplineCurve: eb.bsplines += 1
            else:                               eb.other += 1
        except Exception:
            eb.other += 1
        explorer.Next()
    return eb


def _estimate_edge_length(shape) -> float:
    total = 0.0
    explorer = TopExp_Explorer(shape, TopAbs_EDGE)
    while explorer.More():
        try:
            edge = TopoDS.Edge_s(explorer.Current())
            props = GProp_GProps()
            BRepGProp.LinearProperties_s(edge, props)
            total += props.Mass()
        except Exception:
            pass
        explorer.Next()
    return total


def _calculate_complexity(face_count: int, mrr: float, fb: FaceBreakdown) -> float:
    """0–100 complexity score based on topology."""
    score = 0.0
    score += min(25.0, face_count / 4.0)
    score += mrr * 25.0
    total = fb.planar + fb.cylindrical + fb.conical + fb.spherical + fb.toroidal + fb.bspline + fb.other
    if total > 0:
        non_planar_ratio = (total - fb.planar) / total
        score += non_planar_ratio * 25.0
        freeform_ratio = fb.bspline / total
        score += freeform_ratio * 25.0
    return min(100.0, round(score, 1))


def _recommend_process(bb_dims: list, mrr: float, is_watertight: bool, face_count: int) -> tuple:
    if face_count == 0 or sum(bb_dims) == 0:
        return None, None
    dims = sorted(bb_dims)
    flatness = dims[0] / dims[2] if dims[2] > 0 else 0
    score_cnc, score_sheet, score_3dp = 0.0, 0.0, 0.0
    if flatness < 0.15:    score_sheet += 0.4
    if mrr > 0.3:          score_cnc += 0.4
    if face_count > 20:    score_cnc += 0.2
    if is_watertight and mrr < 0.2: score_3dp += 0.3
    if face_count > 50:    score_3dp += 0.2
    scores = {"CNC": score_cnc, "SHEET_METAL": score_sheet, "3DP": score_3dp}
    best = max(scores, key=scores.get)
    total_score = sum(scores.values())
    if total_score == 0 or scores[best] == 0:
        return None, None
    confidence = round(scores[best] / total_score, 3)
    return best, confidence


# ─── Core Analysis Functions ───

def analyse_step_file(file_path: str, file_hash: str = None) -> GeometryAnalysis:
    start = time.time()
    imported = cq.importers.importStep(file_path)
    shape = imported.toOCC()

    vol_props = GProp_GProps()
    BRepGProp.VolumeProperties_s(shape, vol_props)
    volume = vol_props.Mass()

    surf_props = GProp_GProps()
    BRepGProp.SurfaceProperties_s(shape, surf_props)
    surface_area = surf_props.Mass()

    bbox = Bnd_Box()
    BRepBndLib.Add_s(shape, bbox)
    x_min, y_min, z_min, x_max, y_max, z_max = bbox.Get()
    bb_x = abs(x_max - x_min)
    bb_y = abs(y_max - y_min)
    bb_z = abs(z_max - z_min)
    stock_volume = bb_x * bb_y * bb_z
    mrr = round(max(0.0, min(1.0, 1.0 - (volume / stock_volume))), 4) if stock_volume > 0 else 0.0

    face_count = _count_topology(shape, TopAbs_FACE)
    solid_count = _count_topology(shape, TopAbs_SOLID)
    edge_count = _count_topology(shape, TopAbs_EDGE)
    is_watertight = _check_watertight(shape)
    fb = _analyse_faces(shape)
    eb = _analyse_edges(shape)
    perimeter = round(_estimate_edge_length(shape), 2)
    complexity = _calculate_complexity(face_count, mrr, fb)
    rec_process, confidence = _recommend_process([bb_x, bb_y, bb_z], mrr, is_watertight, face_count)
    wall_thickness = round(volume / (surface_area * 0.5), 2) if surface_area > 0 else None

    return GeometryAnalysis(
        volume_mm3=round(volume, 2),
        surface_area_mm2=round(surface_area, 2),
        bounding_box=BoundingBox(x_mm=round(bb_x, 2), y_mm=round(bb_y, 2), z_mm=round(bb_z, 2)),
        stock_volume_mm3=round(stock_volume, 2),
        material_removal_ratio=mrr,
        face_count=face_count,
        solid_count=solid_count,
        edge_count=edge_count,
        is_watertight=is_watertight,
        face_breakdown=fb,
        edge_breakdown=eb,
        estimated_perimeter_mm=perimeter,
        wall_thickness_min_mm=wall_thickness,
        complexity_score=complexity,
        recommended_process=rec_process,
        process_confidence=confidence,
        file_hash=file_hash,
        processing_time_ms=round((time.time() - start) * 1000, 1),
    )


def analyse_mesh_file(file_path: str, ext: str, file_hash: str = None) -> GeometryAnalysis:
    start = time.time()
    try:
        import trimesh
    except ImportError:
        raise ValueError("trimesh library not installed")

    mesh = trimesh.load(file_path, force='mesh')
    raw_volume = float(mesh.volume) if hasattr(mesh, 'volume') and mesh.is_volume else float(mesh.convex_hull.volume)
    volume = abs(raw_volume)
    surface_area = float(mesh.area)
    try:
        extents = mesh.extents
        bb_x, bb_y, bb_z = float(extents[0]), float(extents[1]), float(extents[2])
    except Exception:
        bb_x, bb_y, bb_z = 0.0, 0.0, 0.0

    stock_volume = bb_x * bb_y * bb_z
    mrr = round(max(0.0, min(1.0, 1.0 - (volume / stock_volume))), 4) if stock_volume > 0 else 0.0
    face_count = len(mesh.faces)
    is_watertight = bool(mesh.is_watertight)
    fb = FaceBreakdown(other=face_count)
    complexity = _calculate_complexity(face_count, mrr, fb)
    rec_process, confidence = _recommend_process([bb_x, bb_y, bb_z], mrr, is_watertight, face_count)
    wall_thickness = round(volume / (surface_area * 0.5), 2) if surface_area > 0 else None

    return GeometryAnalysis(
        volume_mm3=round(volume, 2),
        surface_area_mm2=round(surface_area, 2),
        bounding_box=BoundingBox(x_mm=round(bb_x, 2), y_mm=round(bb_y, 2), z_mm=round(bb_z, 2)),
        stock_volume_mm3=round(stock_volume, 2),
        material_removal_ratio=mrr,
        face_count=face_count,
        solid_count=1,
        edge_count=0,
        is_watertight=is_watertight,
        face_breakdown=fb,
        wall_thickness_min_mm=wall_thickness,
        complexity_score=complexity,
        recommended_process=rec_process,
        process_confidence=confidence,
        file_hash=file_hash,
        processing_time_ms=round((time.time() - start) * 1000, 1),
    )


def run_analysis_sync(tmp_path: str, ext: str, file_hash: str = None) -> GeometryAnalysis:
    if ext in (".stl", ".obj"):
        return analyse_mesh_file(tmp_path, ext, file_hash)
    return analyse_step_file(tmp_path, file_hash)


# ─── Supabase Persistence ───

def _persist_result(geometry_result_id: str, file_id: str, job_id: str, analysis: GeometryAnalysis):
    """Write completed geometry results to Supabase geometry_results table."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return  # Skip persistence if not configured (local dev without Supabase creds)

    url = f"{SUPABASE_URL}/rest/v1/geometry_results?id=eq.{geometry_result_id}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    bb = analysis.bounding_box
    payload = {
        "status": "complete",
        "file_id": file_id,
        "job_id": job_id,
        "file_hash": analysis.file_hash,
        "volume_mm3": analysis.volume_mm3,
        "surface_area_mm2": analysis.surface_area_mm2,
        "bounding_box_x_mm": bb.x_mm,
        "bounding_box_y_mm": bb.y_mm,
        "bounding_box_z_mm": bb.z_mm,
        "stock_volume_mm3": analysis.stock_volume_mm3,
        "material_removal_ratio": analysis.material_removal_ratio,
        "face_count": analysis.face_count,
        "solid_count": analysis.solid_count,
        "is_watertight": analysis.is_watertight,
        "wall_thickness_min_mm": analysis.wall_thickness_min_mm,
        "complexity_score": analysis.complexity_score,
        "recommended_process": analysis.recommended_process,
        "process_confidence": analysis.process_confidence,
        "processing_time_ms": analysis.processing_time_ms,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        with httpx.Client(timeout=10) as client:
            client.patch(url, json=payload, headers=headers)
    except Exception:
        pass  # Non-fatal — result is still in Redis


def _persist_failure(geometry_result_id: str, error_message: str):
    """Mark a geometry_results row as failed."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return
    url = f"{SUPABASE_URL}/rest/v1/geometry_results?id=eq.{geometry_result_id}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    try:
        with httpx.Client(timeout=10) as client:
            client.patch(url, json={
                "status": "failed",
                "error_message": error_message[:1000],
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }, headers=headers)
    except Exception:
        pass


def _export_mesh(tmp_path: str, ext: str, job_id: str) -> Optional[str]:
    """Export the CAD shape to a GLB mesh file for 3D viewing."""
    try:
        if ext in (".stl", ".obj"):
            # STL/OBJ are already meshes — convert to GLB via trimesh
            import trimesh
            mesh = trimesh.load(tmp_path, force='mesh')
            glb_path = os.path.join(MESH_DIR, f"{job_id}.glb")
            mesh.export(glb_path, file_type='glb')
        else:
            # STEP files — use CadQuery for higher quality tessellation
            shape = cq.importers.importStep(tmp_path)
            assy = cq.Assembly()
            assy.add(shape, color=cq.Color(0.7, 0.75, 0.8))  # neutral aluminium
            glb_path = os.path.join(MESH_DIR, f"{job_id}.glb")
            assy.export(glb_path, tolerance=MESH_TOLERANCE)
        return glb_path
    except Exception as e:
        import traceback
        print(f"[WARN] Mesh export failed: {e}")
        traceback.print_exc()
        return None


# ─── Background Task ───

def run_analysis_task(
    job_id: str,
    tmp_path: str,
    ext: str,
    original_filename: str,
    file_hash: str = None,
    file_id: str = None,
    geometry_result_id: str = None,
):
    start_time = time.time()
    try:
        job_store.hset(f"job:{job_id}", mapping={"status": "processing"})

        with concurrent.futures.ProcessPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_analysis_sync, tmp_path, ext, file_hash)
            analysis = future.result(timeout=ANALYSIS_TIMEOUT_SECONDS)

        processing_time = (time.time() - start_time) * 1000

        # Export mesh for 3D viewer (non-blocking, best-effort)
        glb_path = _export_mesh(tmp_path, ext, job_id)
        if glb_path:
            analysis.mesh_url = f"/mesh/{job_id}"

        job_store.hset(f"job:{job_id}", mapping={
            "status": "complete",
            "result": analysis.model_dump_json(),
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "processing_time_ms": str(round(processing_time, 1)),
        })

        # Persist to Supabase if geometry_result_id was provided
        if geometry_result_id and file_id:
            _persist_result(geometry_result_id, file_id, job_id, analysis)

    except concurrent.futures.TimeoutError:
        error_msg = f"Analysis timed out after {ANALYSIS_TIMEOUT_SECONDS}s"
        job_store.hset(f"job:{job_id}", mapping={
            "status": "failed",
            "error": error_msg,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
        if geometry_result_id:
            _persist_failure(geometry_result_id, error_msg)
    except Exception as e:
        error_msg = str(e)
        job_store.hset(f"job:{job_id}", mapping={
            "status": "failed",
            "error": error_msg,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
        if geometry_result_id:
            _persist_failure(geometry_result_id, error_msg)
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


# ─── Endpoints ───

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "geometry-analysis", "version": "0.2.0"}


@app.post("/analyse", response_model=AnalysisJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def queue_analysis(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Upload a CAD file directly for async geometry analysis.
    Used by test-ui.html and standalone tooling.
    """
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in (".step", ".stp", ".stl", ".obj"):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 50MB limit.")

    file_hash = hashlib.sha256(content).hexdigest()
    job_id = str(uuid.uuid4())

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    now = datetime.now(timezone.utc).isoformat()
    try:
        job_store.hset(f"job:{job_id}", mapping={
            "job_id": job_id,
            "status": "queued",
            "created_at": now,
            "filename": filename,
        })
        job_store.expire(f"job:{job_id}", 86400)
    except Exception as e:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        raise HTTPException(status_code=503, detail=f"Redis unavailable: {str(e)}")

    background_tasks.add_task(run_analysis_task, job_id, tmp_path, ext, filename, file_hash)

    return AnalysisJobResponse(
        job_id=job_id,
        status="queued",
        estimated_seconds=15,
        websocket_channel=f"analysis:{job_id}",
    )


@app.post("/analyse-storage", response_model=AnalysisJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def queue_analysis_from_storage(
    background_tasks: BackgroundTasks,
    request: AnalyseStorageRequest,
):
    """
    Trigger geometry analysis on a file already uploaded to Supabase Storage.
    Called by the Next.js API route after the browser uploads directly to Storage.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=503, detail="Supabase credentials not configured on Python service.")

    storage_path = request.storage_path
    ext = os.path.splitext(storage_path)[1].lower()

    if ext not in (".step", ".stp", ".stl", ".obj"):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    # Download file from Supabase Storage
    download_url = f"{SUPABASE_URL}/storage/v1/object/{storage_path}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(download_url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Could not download file from Storage: {response.status_code}")
            content = response.content
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timed out downloading file from Storage.")

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 50MB limit.")

    file_hash = hashlib.sha256(content).hexdigest()
    job_id = str(uuid.uuid4())
    filename = os.path.basename(storage_path)

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    now = datetime.now(timezone.utc).isoformat()
    try:
        job_store.hset(f"job:{job_id}", mapping={
            "job_id": job_id,
            "status": "queued",
            "created_at": now,
            "filename": filename,
            "file_id": request.file_id,
            "geometry_result_id": request.geometry_result_id,
        })
        job_store.expire(f"job:{job_id}", 86400)
    except Exception as e:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        raise HTTPException(status_code=503, detail=f"Redis unavailable: {str(e)}")

    background_tasks.add_task(
        run_analysis_task,
        job_id, tmp_path, ext, filename, file_hash,
        request.file_id, request.geometry_result_id,
    )

    return AnalysisJobResponse(
        job_id=job_id,
        status="queued",
        estimated_seconds=15,
        websocket_channel=f"analysis:{job_id}",
    )


@app.get("/analyse/{job_id}", response_model=AnalysisStatusResponse)
async def get_analysis_status(job_id: str):
    """Poll the status of an analysis job."""
    try:
        job_data = job_store.hgetall(f"job:{job_id}")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Redis unavailable: {str(e)}")

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
        completed_at=job_data.get("completed_at"),
    )


@app.get("/mesh/{job_id}")
async def get_mesh(job_id: str):
    """Serve the GLB mesh file for 3D viewing in the browser."""
    # Sanitise job_id to prevent path traversal
    safe_id = os.path.basename(job_id)
    glb_path = os.path.join(MESH_DIR, f"{safe_id}.glb")

    if not os.path.isfile(glb_path):
        raise HTTPException(status_code=404, detail="Mesh not found")

    from fastapi.responses import FileResponse
    return FileResponse(
        glb_path,
        media_type="model/gltf-binary",
        headers={
            "Cache-Control": "private, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        },
    )
