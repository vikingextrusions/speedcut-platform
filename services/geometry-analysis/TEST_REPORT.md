# TEST_REPORT.md — EP-001 Tasks 1.8 & 1.9

**Epic:** EP-001 — Geometry Analysis Engine  
**Sprint:** S01  
**Author:** @tester (`claude-sonnet-4-6`)  
**Report Date:** 2026-04-22  
**Handoff From:** @engineer  
**Subject:** Adversarial review of `services/geometry-analysis/main.py` — async refactor and STL/OBJ mesh parser extension (Tasks 1.8 & 1.9)

---

## Summary

Two P1 bugs and two P2 bugs were identified through **static analysis** of `main.py` and the accompanying adversarial test suite (`test_adversarial.py`). A further three P3 findings are documented below for engineering awareness. **This report blocks merge** pending resolution of the P1 findings.

| Severity | Count | Merge Impact |
|---|:---:|---|
| **P0** — Critical / data loss | 0 | — |
| **P1** — Major / functional regression | 2 | 🔴 Blocks merge |
| **P2** — Moderate / spec non-compliance | 2 | ⚠️ Required before DoD sign-off |
| **P3** — Cosmetic / defensive hygiene | 3 | ℹ️ At @engineer discretion |

---

## Findings

---

### [P1-01] Temp File Leak on Redis Non-ConnectionError Exceptions

**Severity:** P1 — Major  
**Epic ID:** EP-001 / Task 1.9  
**Test:** `test_adversarial.py::TestAsyncPollingStateMachine::test_B06_temp_file_leaked_on_redis_timeout_error`

#### Description

The `except` clause guarding Redis failures in the `queue_analysis` endpoint (line 368, `main.py`) catches **only** `redis.exceptions.ConnectionError`. Any other Redis exception subclass — including `TimeoutError`, `ResponseError`, `AuthenticationError`, and `BusyLoadingError` — propagates as an unhandled exception.

When this occurs:
1. The temp file has **already been written** to disk (line 352–355).
2. FastAPI catches the unhandled exception and returns a `500 Internal Server Error`.
3. The `os.unlink(tmp_path)` call inside the `except redis.exceptions.ConnectionError` block is **never reached**.
4. The temp file **remains on disk indefinitely**.

In a high-throughput environment processing 20+ concurrent uploads, each timed-out Redis connection (e.g. during a Redis restart, network blip, or auth failure) leaks a `.step`/`.stl`/`.obj` file into `tempfile.gettempdir()`. There is no background sweep process.

#### Reproduction Steps

```python
import redis
from unittest.mock import MagicMock, patch
import main as svc

broken = MagicMock()
broken.hset.side_effect = redis.exceptions.TimeoutError("Redis timeout")

with patch.object(svc, "redis_client", broken):
    # POST /analyse with any valid STL file
    # Observe: 500 response returned, temp file NOT cleaned up
```

#### Expected Behaviour (post-fix)

- All `redis.exceptions.RedisError` subclasses must be caught (base class covers all).
- `os.unlink(tmp_path)` must be called on **any** Redis write failure.
- The endpoint must return `503 Service Unavailable`, not `500`.

#### Fix

```python
# Line 368 in main.py — change:
except redis.exceptions.ConnectionError:
# To:
except redis.exceptions.RedisError:
```

Also change status code returned to match the existing pattern:
```python
raise HTTPException(status_code=503, detail="Redis error. Async processing unavailable.")
```

---

### [P1-02] No File Size Limit — OOM DoS Vector

**Severity:** P1 — Major  
**Epic ID:** EP-001 / Task 1.9  
**Test:** `test_adversarial.py::TestFileSizeLimit::test_D01_no_file_size_limit_enforced`

#### Description

The `/analyse` endpoint (line 353, `main.py`) calls:

```python
content = await file.read()
```

With no preceding size check. This reads the **entire file payload into memory** in a single call. A single malicious or misconfigured client can upload a multi-gigabyte file, causing:

- Process-level OOM (Out of Memory) kill.
- Host resource exhaustion if multiple concurrent oversized uploads occur.
- Denial of service for all concurrent analysis jobs.

The EPIC-001 DoD specifies "STEP files up to 100MB parsed without error" — but this implies a defined upper bound exists. Currently **no upper bound is enforced**.

#### Reproduction Steps

```python
# Upload a 60 MB .stl file
payload = b"\x00" * 80 + struct.pack("<I", 0) + b"\x00" * (60 * 1024 * 1024)
r = requests.post("http://localhost:8100/analyse",
    files={"file": ("large.stl", payload, "application/octet-stream")})
# Observe: 202 Accepted — file fully buffered in RAM
```

#### Expected Behaviour (post-fix)

- Return `413 Request Entity Too Large` for any upload exceeding `MAX_UPLOAD_BYTES` (recommended: 104,857,600 = 100 MB).
- The check must occur **before** `file.read()` to prevent buffering.

#### Fix

```python
MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB

# In queue_analysis, before file.read():
file_size = 0
content = await file.read(MAX_UPLOAD_BYTES + 1)
if len(content) > MAX_UPLOAD_BYTES:
    raise HTTPException(
        status_code=413,
        detail=f"File too large. Maximum allowed: {MAX_UPLOAD_BYTES // (1024*1024)} MB."
    )
```

---

### [P2-01] Inverted Normals Produce Negative Volume and MRR > 1.0

**Severity:** P2 — Moderate (spec non-compliance)  
**Epic ID:** EP-001 / Task 1.8  
**Test:** `test_adversarial.py::TestMeshParsingBoundary::test_A03_inverted_normals_volume_not_negative`

#### Description

`trimesh.volume` is a **signed** quantity derived from the mesh winding order. For a valid closed mesh with **inverted (clockwise) normals**, `mesh.is_volume` may return `True` while `mesh.volume` returns a **negative number**.

The guard in `analyse_mesh_file()` (line 171):

```python
volume = float(mesh.volume) if hasattr(mesh, 'volume') and mesh.is_volume else float(mesh.convex_hull.volume)
```

…does not apply `abs()`. A negative volume propagates directly into:

| Field | Value with inverted normals | Spec |
|---|---|---|
| `volume_mm3` | e.g. `-523.6` | Must be ≥ 0 |
| `material_removal_ratio` | e.g. `1.523` | Spec: 0.0–1.0 |
| `wall_thickness_min_mm` | e.g. `-2.14` | Must be ≥ 0 or null |

The `GeometryAnalysis` Pydantic model applies no range validators to any of these fields, so invalid data is serialised and returned to the client without error.

#### Expected Behaviour

- `volume_mm3` ≥ 0.0 at all times.
- `material_removal_ratio` clamped to [0.0, 1.0].
- `wall_thickness_min_mm` either null or ≥ 0.0.

#### Fix

```python
# In analyse_mesh_file(), line 171
raw_volume = float(mesh.volume) if hasattr(mesh, 'volume') and mesh.is_volume else float(mesh.convex_hull.volume)
volume = abs(raw_volume)  # Normalise signed volume from inverted-normal meshes

# Clamp removal_ratio post-calculation
removal_ratio = max(0.0, min(1.0, removal_ratio))
```

---

### [P2-02] Infinite Background Task — No Analysis Timeout

**Severity:** P2 — Moderate  
**Epic ID:** EP-001 / Task 1.9  
**Test:** `test_adversarial.py::TestConcurrentQueueSaturation::test_C02_concurrent_jobs_all_reach_terminal_state`  
*(timeout assertion covers this indirectly)*

#### Description

`run_analysis_task()` is a synchronous function with no timeout guard. If `trimesh.load()` or `cq.importers.importStep()` hangs on a pathological input (e.g. a carefully crafted near-infinite geometry or a file that triggers a native OCC deadlock), the background thread will run indefinitely.

FastAPI's `BackgroundTasks` are executed via `anyio`'s default thread pool. A hung background task permanently consumes one worker thread. With the default thread pool size, N concurrent hung tasks cause **complete service unavailability** for subsequent uploads.

This was not triggered in current tests (trimesh handles most edge cases), but the risk is non-zero for malicious STEP inputs exercising OCC edge cases.

#### Expected Behaviour

- Each analysis background task should have a configurable timeout (default: 120s).
- On timeout: `status` set to `"failed"`, `error` set to `"Analysis timed out"`, temp file cleaned up.

#### Fix (recommended approach — subprocess with timeout)

The EPIC-001 risk register already notes:  
> *"OCC/CadQuery memory leak on large files — Run analysis in subprocess with timeout; kill on exceed"*

For Phase 1, a simpler fix using `concurrent.futures`:

```python
import concurrent.futures

ANALYSIS_TIMEOUT_SECONDS = int(os.getenv("ANALYSIS_TIMEOUT_SECONDS", 120))

def run_analysis_task(job_id: str, tmp_path: str, ext: str, original_filename: str):
    try:
        redis_client.hset(f"job:{job_id}", mapping={"status": "processing"})
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_do_analysis, tmp_path, ext)
            analysis = future.result(timeout=ANALYSIS_TIMEOUT_SECONDS)
        # ... rest of success path
    except concurrent.futures.TimeoutError:
        redis_client.hset(f"job:{job_id}", mapping={
            "status": "failed",
            "error": f"Analysis timed out after {ANALYSIS_TIMEOUT_SECONDS}s",
            ...
        })
    except Exception as e:
        # ... existing error path
    finally:
        try: os.unlink(tmp_path)
        except: pass
```

---

### [P3-01] Uncaught Exception Produces Cryptic Client Error on Degenerate Mesh Extents

**Severity:** P3 — Cosmetic / UX  
**Epic ID:** EP-001 / Task 1.8  

If `mesh.extents` raises on a zero-vertex mesh, the exception propagates from `analyse_mesh_file()` to `run_analysis_task()`'s except block, which calls `str(e)`. Depending on the trimesh exception, `str(e)` may be an empty string or an OCC-level C++ exception message not meaningful to a client. The `error` field in the Redis hash should always contain a sanitised, human-readable message.

**Suggested fix:** Wrap `analyse_mesh_file()` with a helper that catches all exceptions and raises `ValueError("Mesh could not be parsed: {safe_summary}")`.

---

### [P3-02] `recommended_process` Returns "CNC" When All Scores Are Zero

**Severity:** P3 — Cosmetic  
**Epic ID:** EP-001 / Task 1.7  

For degenerate inputs (zero-face mesh: `face_count=0`, `mrr=0.0`, `is_watertight=False`), all process scores are `0.0`. Python's `max()` on a dict with equal values returns the first key in insertion order, which is `"CNC"`. The returned `process_confidence` is `0.0`, correctly signalling uncertainty, but returning a process name at all when confidence is zero may mislead downstream quoting logic.

**Suggested fix:** Return `recommended_process=None` and `process_confidence=None` when `max(scores.values()) == 0.0`.

---

### [P3-03] `redis.exceptions.ConnectionError` Not Caught on GET `/analyse/{job_id}`

**Severity:** P3 — Defensive hygiene  
**Epic ID:** EP-001 / Task 1.9  

The GET endpoint (line 391–393) correctly catches `redis.exceptions.ConnectionError` and returns 503. However, like P1-01, it does not catch `TimeoutError`, `ResponseError`, or other `RedisError` subclasses — these would result in a 500. Consistent with the P1-01 fix, this should be broadened to `redis.exceptions.RedisError`.

---

## Attack Vectors Cleared (No Blocking Issue)

| Vector | Result |
|---|---|
| SQL injection via `job_id` path parameter | URL routing prevents execution; returns 404 ✓ |
| Path traversal via `job_id` (`../etc/passwd`) | Redis key lookup is harmless; returns 404 ✓ |
| Unsupported file extension (`.ply`, `.exe`, `.py`) | Correctly rejected with 400 ✓ |
| Missing `file` field in multipart | FastAPI returns 422 Unprocessable Entity ✓ |
| Redis connection failure on POST | Returns 503 (ConnectionError case only) ✓ |
| `recommend_process` divide-by-zero (zero total score) | Guarded with `if total_score > 0` ✓ |
| `wall_thickness_min` divide-by-zero (zero surface area) | Guarded with `if surface_area > 0` ✓ |
| Concurrent UUID collision | UUID4 collision probability negligible; confirmed unique per test ✓ |
| Redis race condition (background task vs. POST hset ordering) | BackgroundTasks execute post-response; no race possible ✓ |

---

## Test Suite Inventory

| Test ID | Class | Description | Type |
|---|---|---|---|
| A-01 | `TestMeshParsingBoundary` | Empty STL (zero triangles) | Unit |
| A-02 | `TestMeshParsingBoundary` | Single open triangle (non-watertight) | Unit |
| A-03 | `TestMeshParsingBoundary` | Inverted normals → negative volume **[P2-01]** | Unit |
| A-04 | `TestMeshParsingBoundary` | Truncated binary STL (corrupt EOF) | Unit |
| A-05 | `TestMeshParsingBoundary` | Zero-byte file with .stl extension | Unit |
| A-06 | `TestMeshParsingBoundary` | Garbage content with .stl extension | Unit |
| A-07 | `TestMeshParsingBoundary` | OBJ with vertices, no faces | Unit |
| A-08 | `TestMeshParsingBoundary` | Unsupported extension rejection (.ply, .exe, .py) | Unit |
| A-09 | `TestMeshParsingBoundary` | No `file` field in multipart | Unit |
| B-01 | `TestAsyncPollingStateMachine` | Full job lifecycle queued → complete | Unit |
| B-02 | `TestAsyncPollingStateMachine` | Unknown job_id → 404 | Unit |
| B-03 | `TestAsyncPollingStateMachine` | Path traversal / injection via job_id | Unit |
| B-04 | `TestAsyncPollingStateMachine` | Redis ConnectionError → 503 | Unit |
| B-05 | `TestAsyncPollingStateMachine` | Temp file cleanup after completion | Unit |
| B-06 | `TestAsyncPollingStateMachine` | Temp file leak on Redis TimeoutError **[P1-01]** | Unit |
| C-01 | `TestConcurrentQueueSaturation` | 10 concurrent uploads → 10 unique job_ids | Unit |
| C-02 | `TestConcurrentQueueSaturation` | 5 concurrent jobs → all reach terminal state | Unit |
| C-03 | `TestConcurrentQueueSaturation` | 20 concurrent GET polls → no corrupt status | Unit |
| D-01 | `TestFileSizeLimit` | 60 MB upload → should 413 **[P1-02]** | Unit |
| E-01 | `TestIntegrationLiveServer` | Health check | Integration |
| E-02 | `TestIntegrationLiveServer` | 10 concurrent live uploads → terminal state | Integration |
| E-03 | `TestIntegrationLiveServer` | Temp file cleanup on live server | Integration |

---

## Handoff Decision

**Status: 🔴 BLOCKED — Do not merge to main.**

| Condition | Status |
|---|---|
| Zero P0 findings | ✅ Met |
| Zero P1 findings | ❌ **Not met** (P1-01, P1-02 open) |
| P2 findings documented | ✅ Documented (P2-01, P2-02) |
| TEST_REPORT.md complete | ✅ This document |

@engineer must resolve **P1-01** (temp file leak on RedisError subtypes) and **P1-02** (no file size limit) before @manager can approve the merge. P2 findings are required for DoD completion per the Definition of Done in EPIC-001-geometry-analysis.md.

---

```yaml
from: "@tester"
to: "@engineer"
type: "TEST_REPORT"
epic_id: "EP-001"
sprint: "S01"
priority: "HIGH"
payload_path: "services/geometry-analysis/TEST_REPORT.md"
blocker_count: 2
p0_count: 0
p1_count: 2
p2_count: 2
p3_count: 3
requires_response: true
```
