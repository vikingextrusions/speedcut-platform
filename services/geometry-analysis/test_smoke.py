"""Smoke test: verify STEP analysis + GLB mesh export pipeline."""
import httpx
import cadquery as cq
import tempfile, os, time

# 1. Generate test STEP file
print("Generating test STEP file...")
box = cq.Workplane("XY").box(50, 30, 10).edges("|Z").fillet(2)
tmp = tempfile.NamedTemporaryFile(suffix=".step", delete=False)
tmp_path = tmp.name
tmp.close()
cq.exporters.export(box, tmp_path)
print(f"  Created: {os.path.getsize(tmp_path):,} bytes")

# 2. Submit for analysis
print("\nSubmitting to /analyse...")
with open(tmp_path, "rb") as f:
    r = httpx.post("http://localhost:8100/analyse",
                   files={"file": ("test_box.step", f, "application/octet-stream")},
                   timeout=30)
job_id = r.json()["job_id"]
print(f"  Job ID: {job_id}")

# 3. Poll for result
print("\nPolling...")
for i in range(30):
    time.sleep(2)
    s = httpx.get(f"http://localhost:8100/analyse/{job_id}", timeout=10).json()
    print(f"  [{i*2}s] status={s['status']}")
    if s["status"] == "complete":
        result = s["result"]
        print(f"\n  Volume:     {result['volume_mm3']:,.1f} mm3")
        print(f"  Complexity: {result.get('complexity_score', 'N/A')}/100")
        print(f"  mesh_url:   {result.get('mesh_url', 'NONE')}")

        # 4. Test mesh endpoint
        mesh_url = result.get("mesh_url")
        if mesh_url:
            mesh_r = httpx.get(f"http://localhost:8100{mesh_url}", timeout=10)
            print(f"\n  Mesh HTTP:  {mesh_r.status_code}")
            print(f"  Mesh Size:  {len(mesh_r.content):,} bytes")
            print(f"  Mesh Type:  {mesh_r.headers.get('content-type')}")
        else:
            print("\n  [WARN] No mesh_url in result!")
        break
    elif s["status"] == "failed":
        print(f"  ERROR: {s.get('error')}")
        break

os.unlink(tmp_path)
print("\nDone.")
