"""
Speedcut Geometry Analyzer
===========================
Core module for parsing STEP files and extracting
manufacturing-relevant geometry data.

This is a pure logic module — no web or GUI dependencies.
Can be imported by desktop apps, FastAPI services, or CLI tools.
"""

import math
import time
from dataclasses import dataclass, field
from typing import Optional

import cadquery as cq
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID, TopAbs_EDGE, TopAbs_WIRE
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopLoc import TopLoc_Location
from OCP.BRep import BRep_Tool
from OCP.gp import gp_Pnt
from OCP.GeomAbs import (
    GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone,
    GeomAbs_Sphere, GeomAbs_Torus, GeomAbs_BSplineSurface,
    GeomAbs_Line, GeomAbs_Circle, GeomAbs_BSplineCurve,
)


# ─── Data Classes ───

@dataclass
class BoundingBox:
    x_mm: float
    y_mm: float
    z_mm: float

    @property
    def volume_mm3(self) -> float:
        return self.x_mm * self.y_mm * self.z_mm

    @property
    def max_dimension(self) -> float:
        return max(self.x_mm, self.y_mm, self.z_mm)

    @property
    def min_dimension(self) -> float:
        return min(self.x_mm, self.y_mm, self.z_mm)


@dataclass
class FaceBreakdown:
    """Count of faces by surface type."""
    planar: int = 0
    cylindrical: int = 0
    conical: int = 0
    spherical: int = 0
    toroidal: int = 0
    bspline: int = 0
    other: int = 0

    @property
    def total(self) -> int:
        return (self.planar + self.cylindrical + self.conical +
                self.spherical + self.toroidal + self.bspline + self.other)


@dataclass
class EdgeBreakdown:
    """Count of edges by curve type."""
    lines: int = 0
    arcs: int = 0
    bsplines: int = 0
    other: int = 0

    @property
    def total(self) -> int:
        return self.lines + self.arcs + self.bsplines + self.other


@dataclass
class MeshData:
    """Triangulated mesh data for 3D visualization."""
    vertices: list = field(default_factory=list)   # List of (x, y, z) tuples
    triangles: list = field(default_factory=list)   # List of (i0, i1, i2) index tuples

    @property
    def triangle_count(self) -> int:
        return len(self.triangles)


@dataclass
class GeometryAnalysis:
    """Complete geometry analysis result."""
    # Core metrics
    volume_mm3: float = 0.0
    surface_area_mm2: float = 0.0
    bounding_box: BoundingBox = field(default_factory=lambda: BoundingBox(0, 0, 0))

    # Material removal
    stock_volume_mm3: float = 0.0
    material_removal_ratio: float = 0.0

    # Topology
    face_count: int = 0
    solid_count: int = 0
    edge_count: int = 0
    wire_count: int = 0
    is_watertight: bool = False

    # Detailed breakdowns
    face_breakdown: FaceBreakdown = field(default_factory=FaceBreakdown)
    edge_breakdown: EdgeBreakdown = field(default_factory=EdgeBreakdown)

    # Derived complexity metrics
    complexity_score: float = 0.0  # 0-100 scale
    estimated_perimeter_mm: float = 0.0

    # Mesh for 3D viewing
    mesh: MeshData = field(default_factory=MeshData)

    # Metadata
    processing_time_ms: float = 0.0
    filename: str = ""
    error: Optional[str] = None


# ─── Analysis Functions ───

def _count_topology(shape, topology_type) -> int:
    """Count the number of topological entities of a given type."""
    count = 0
    explorer = TopExp_Explorer(shape, topology_type)
    while explorer.More():
        count += 1
        explorer.Next()
    return count


def _check_watertight(shape) -> bool:
    """Check if the shape is topologically valid (watertight/closed)."""
    try:
        analyzer = BRepCheck_Analyzer(shape, True)
        return analyzer.IsValid()
    except Exception:
        return False


def _analyse_faces(shape) -> FaceBreakdown:
    """Categorize faces by surface type."""
    breakdown = FaceBreakdown()
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        try:
            face = TopoDS.Face_s(explorer.Current())  # Downcast to TopoDS_Face
            adaptor = BRepAdaptor_Surface(face)
            stype = adaptor.GetType()
            if stype == GeomAbs_Plane:
                breakdown.planar += 1
            elif stype == GeomAbs_Cylinder:
                breakdown.cylindrical += 1
            elif stype == GeomAbs_Cone:
                breakdown.conical += 1
            elif stype == GeomAbs_Sphere:
                breakdown.spherical += 1
            elif stype == GeomAbs_Torus:
                breakdown.toroidal += 1
            elif stype == GeomAbs_BSplineSurface:
                breakdown.bspline += 1
            else:
                breakdown.other += 1
        except Exception:
            breakdown.other += 1
        explorer.Next()
    return breakdown


def _analyse_edges(shape) -> EdgeBreakdown:
    """Categorize edges by curve type."""
    breakdown = EdgeBreakdown()
    explorer = TopExp_Explorer(shape, TopAbs_EDGE)
    while explorer.More():
        try:
            edge = TopoDS.Edge_s(explorer.Current())  # Downcast to TopoDS_Edge
            adaptor = BRepAdaptor_Curve(edge)
            ctype = adaptor.GetType()
            if ctype == GeomAbs_Line:
                breakdown.lines += 1
            elif ctype == GeomAbs_Circle:
                breakdown.arcs += 1
            elif ctype == GeomAbs_BSplineCurve:
                breakdown.bsplines += 1
            else:
                breakdown.other += 1
        except Exception:
            breakdown.other += 1
        explorer.Next()
    return breakdown


def _estimate_total_edge_length(shape) -> float:
    """Estimate total edge length (perimeter) of all edges in the shape."""
    total_length = 0.0
    explorer = TopExp_Explorer(shape, TopAbs_EDGE)
    while explorer.More():
        try:
            edge = TopoDS.Edge_s(explorer.Current())
            props = GProp_GProps()
            BRepGProp.LinearProperties_s(edge, props)
            total_length += props.Mass()
        except Exception:
            pass
        explorer.Next()
    return total_length


def _extract_mesh(shape, deflection: float = 0.1) -> MeshData:
    """
    Tessellate the shape into a triangle mesh for 3D visualization.
    
    Args:
        shape: OCC TopoDS_Shape
        deflection: Mesh quality (smaller = finer, default 0.1mm)
    
    Returns:
        MeshData with vertices and triangle indices.
    """
    mesh_data = MeshData()
    
    # Tessellate the shape
    BRepMesh_IncrementalMesh(shape, deflection, False, 0.5, True)
    
    vertices = []
    triangles = []
    vertex_offset = 0
    
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        try:
            face = TopoDS.Face_s(explorer.Current())
            loc = TopLoc_Location()
            tri = BRep_Tool.Triangulation_s(face, loc)
            
            if tri is not None:
                transform = loc.Transformation()
                
                # Extract vertices
                for i in range(1, tri.NbNodes() + 1):
                    pnt = tri.Node(i)
                    pnt.Transform(transform)
                    vertices.append((pnt.X(), pnt.Y(), pnt.Z()))
                
                # Extract triangles (1-indexed in OCC)
                for i in range(1, tri.NbTriangles() + 1):
                    t = tri.Triangle(i)
                    i1, i2, i3 = t.Get()
                    triangles.append((
                        i1 - 1 + vertex_offset,
                        i2 - 1 + vertex_offset,
                        i3 - 1 + vertex_offset,
                    ))
                
                vertex_offset += tri.NbNodes()
        except Exception:
            pass
        explorer.Next()
    
    mesh_data.vertices = vertices
    mesh_data.triangles = triangles
    return mesh_data


def _calculate_complexity(analysis: GeometryAnalysis) -> float:
    """
    Calculate a complexity score (0-100) based on geometry features.
    
    Factors:
    - Face count (more faces = more complex)
    - Material removal ratio (more removal = harder)
    - Non-planar face ratio (curved surfaces = harder)
    - BSpline surfaces (freeform = much harder)
    """
    score = 0.0

    # Face count factor (0-25 points)
    face_score = min(25, analysis.face_count / 4.0)
    score += face_score

    # Material removal factor (0-25 points)
    score += analysis.material_removal_ratio * 25.0

    # Non-planar ratio (0-25 points)
    fb = analysis.face_breakdown
    if fb.total > 0:
        non_planar = fb.total - fb.planar
        non_planar_ratio = non_planar / fb.total
        score += non_planar_ratio * 25.0

    # Freeform surfaces penalty (0-25 points)
    if fb.total > 0:
        freeform_ratio = fb.bspline / fb.total
        score += freeform_ratio * 25.0

    return min(100.0, round(score, 1))


def analyse_step_file(file_path: str) -> GeometryAnalysis:
    """
    Parse a STEP file and extract comprehensive manufacturing-relevant
    geometry metrics.

    Args:
        file_path: Path to a .step or .stp file.

    Returns:
        GeometryAnalysis with all extracted data.
    """
    import os
    filename = os.path.basename(file_path)
    start_time = time.time()

    analysis = GeometryAnalysis(filename=filename)

    try:
        # Import the STEP file
        imported = cq.importers.importStep(file_path)
        shape = imported.toOCC()

        # ── Volume ──
        vol_props = GProp_GProps()
        BRepGProp.VolumeProperties_s(shape, vol_props)
        analysis.volume_mm3 = round(vol_props.Mass(), 2)

        # ── Surface Area ──
        surf_props = GProp_GProps()
        BRepGProp.SurfaceProperties_s(shape, surf_props)
        analysis.surface_area_mm2 = round(surf_props.Mass(), 2)

        # ── Bounding Box ──
        bbox = Bnd_Box()
        BRepBndLib.Add_s(shape, bbox)
        x_min, y_min, z_min, x_max, y_max, z_max = bbox.Get()

        bb_x = abs(x_max - x_min)
        bb_y = abs(y_max - y_min)
        bb_z = abs(z_max - z_min)

        analysis.bounding_box = BoundingBox(
            x_mm=round(bb_x, 2),
            y_mm=round(bb_y, 2),
            z_mm=round(bb_z, 2),
        )

        # Stock volume = bounding box volume (raw material block)
        analysis.stock_volume_mm3 = round(bb_x * bb_y * bb_z, 2)

        # Material removal ratio
        if analysis.stock_volume_mm3 > 0:
            analysis.material_removal_ratio = round(
                1.0 - (analysis.volume_mm3 / analysis.stock_volume_mm3), 4
            )

        # ── Topology Counts ──
        analysis.face_count = _count_topology(shape, TopAbs_FACE)
        analysis.solid_count = _count_topology(shape, TopAbs_SOLID)
        analysis.edge_count = _count_topology(shape, TopAbs_EDGE)
        analysis.wire_count = _count_topology(shape, TopAbs_WIRE)

        # ── Watertight Check ──
        analysis.is_watertight = _check_watertight(shape)

        # ── Detailed Breakdowns ──
        analysis.face_breakdown = _analyse_faces(shape)
        analysis.edge_breakdown = _analyse_edges(shape)

        # ── Edge Length (Perimeter) ──
        analysis.estimated_perimeter_mm = round(
            _estimate_total_edge_length(shape), 2
        )

        # ── Mesh for 3D Viewer ──
        # Use adaptive deflection based on bounding box size
        max_dim = max(bb_x, bb_y, bb_z)
        deflection = max(0.05, max_dim / 500.0)
        analysis.mesh = _extract_mesh(shape, deflection)

        # ── Complexity Score ──
        analysis.complexity_score = _calculate_complexity(analysis)

    except Exception as e:
        analysis.error = str(e)

    analysis.processing_time_ms = round((time.time() - start_time) * 1000, 1)
    return analysis
