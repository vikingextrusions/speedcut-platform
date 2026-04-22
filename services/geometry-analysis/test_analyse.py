"""
Quick test script for the geometry analysis service.

Usage:
  1. Start the service: uvicorn main:app --reload --port 8100
  2. Run this script:   python test_analyse.py path/to/your/file.step
"""

import sys
import json
import requests


def test_health():
    """Test the health endpoint."""
    try:
        r = requests.get("http://localhost:8100/health")
        print(f"✓ Health check: {r.json()}")
        return True
    except requests.ConnectionError:
        print("✗ Service is not running. Start it with: uvicorn main:app --reload --port 8100")
        return False


def test_analyse(file_path: str):
    """Upload a STEP file and display the analysis."""
    print(f"\nAnalysing: {file_path}")
    print("─" * 50)
    
    with open(file_path, "rb") as f:
        r = requests.post(
            "http://localhost:8100/analyse",
            files={"file": (file_path.split("\\")[-1].split("/")[-1], f, "application/octet-stream")},
        )
    
    data = r.json()
    
    if not data["success"]:
        print(f"✗ Analysis failed: {data.get('error', 'Unknown error')}")
        return
    
    a = data["analysis"]
    bb = a["bounding_box"]
    
    print(f"✓ Analysis complete in {data['processing_time_ms']:.0f}ms\n")
    print(f"  Volume:            {a['volume_mm3']:,.2f} mm³")
    print(f"  Surface Area:      {a['surface_area_mm2']:,.2f} mm²")
    print(f"  Bounding Box:      {bb['x_mm']:.1f} × {bb['y_mm']:.1f} × {bb['z_mm']:.1f} mm")
    print(f"  Stock Volume:      {a['stock_volume_mm3']:,.2f} mm³")
    print(f"  Material Removal:  {a['material_removal_ratio'] * 100:.1f}%")
    print(f"  Faces:             {a['face_count']}")
    print(f"  Solids:            {a['solid_count']}")
    print(f"  Watertight:        {'Yes ✓' if a['is_watertight'] else 'No ✗'}")
    
    print(f"\n  [Phase 2 Metrics]")
    print(f"  Wall Thickness:    ~{a.get('wall_thickness_min_mm', 'N/A')} mm")
    print(f"  Complexity Score:  {a.get('complexity_score', 0):.2f}/1.0")
    print(f"  Process Rec:       {a.get('recommended_process', 'Unknown')} ({a.get('process_confidence', 0)*100:.1f}%)")
    
    # Rough CNC cost estimate (for demonstration)
    print(f"\n{'─' * 50}")
    print("  ROUGH CNC ESTIMATE (aluminium 6082-T6)")
    print(f"{'─' * 50}")
    
    density_kg_per_mm3 = 2.71e-6  # Aluminium
    price_per_kg = 8.50  # £/kg approximate
    removal_rate = 0.005  # £/mm³ removed (rough)
    setup_cost = 25.0  # Fixed per-part
    
    mass_kg = a["volume_mm3"] * density_kg_per_mm3
    material_cost = (a["stock_volume_mm3"] * density_kg_per_mm3) * price_per_kg
    removal_volume = a["stock_volume_mm3"] - a["volume_mm3"]
    machining_cost = removal_volume * removal_rate
    
    total = material_cost + machining_cost + setup_cost
    
    print(f"  Part Mass:         {mass_kg * 1000:.1f} g")
    print(f"  Material Cost:     £{material_cost:.2f}")
    print(f"  Machining Cost:    £{machining_cost:.2f}")
    print(f"  Setup Cost:        £{setup_cost:.2f}")
    print(f"  ─────────────────────────")
    print(f"  TOTAL (1 off):     £{total:.2f}")


if __name__ == "__main__":
    if not test_health():
        sys.exit(1)
    
    if len(sys.argv) < 2:
        print("\nUsage: python test_analyse.py <path-to-step-file>")
        print("\nNo STEP file provided. You can test with any .step or .stp file.")
        sys.exit(0)
    
    test_analyse(sys.argv[1])
