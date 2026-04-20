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
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


class AnalysisResponse(BaseModel):
    success: bool
    filename: str
    analysis: Optional[GeometryAnalysis] = None
    error: Optional[str] = None
    processing_time_ms: float


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
    )


# ─── Endpoints ───

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "geometry-analysis"}


@app.post("/analyse", response_model=AnalysisResponse)
async def analyse(file: UploadFile = File(...)):
    """
    Upload a STEP file and receive geometry analysis.
    
    Accepts .step and .stp files. Returns volume, surface area,
    bounding box dimensions, and manufacturability metrics.
    """
    # Validate file extension
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in (".step", ".stp"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Only .step and .stp files are supported.",
        )
    
    start_time = time.time()
    
    # Save to temp file (CadQuery needs a file path)
    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Run the analysis
        analysis = analyse_step_file(tmp_path)
        
        processing_time = (time.time() - start_time) * 1000
        
        return AnalysisResponse(
            success=True,
            filename=filename,
            analysis=analysis,
            processing_time_ms=round(processing_time, 1),
        )
    
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        return AnalysisResponse(
            success=False,
            filename=filename,
            error=str(e),
            processing_time_ms=round(processing_time, 1),
        )
    
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


@app.post("/analyse/batch", response_model=list[AnalysisResponse])
async def analyse_batch(files: list[UploadFile] = File(...)):
    """
    Upload multiple STEP files and receive analysis for each.
    """
    results = []
    for file in files:
        result = await analyse(file)
        results.append(result)
    return results
