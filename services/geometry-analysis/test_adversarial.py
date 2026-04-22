"""
Speedcut Geometry Analysis — Adversarial Test Suite
=====================================================
Epic:    EP-001 (Tasks 1.8 & 1.9)
Author:  @tester (claude-sonnet-4-6)
Sprint:  S01

Covers:
  A. Malformed mesh inputs (STL/OBJ boundary conditions)
  B. Async polling state machine integrity
  C. Concurrent BackgroundTasks queue saturation
  D. Temp file cleanup verification
  E. Redis failure path coverage

Usage:
  # Requires: pip install pytest pytest-asyncio httpx
  # No live server needed — uses FastAPI TestClient + ASGITransport
  pytest test_adversarial.py -v

  # To run integration tests against live server (port 8100):
  pytest test_adversarial.py -v -m integration
"""

from __future__ import annotations

import io
import os
import struct
import sys
import tempfile
import threading
import time
import uuid
from typing import Generator
from unittest.mock import MagicMock, patch, PropertyMock

import pytest

# ---------------------------------------------------------------------------
# Conditional imports: TestClient / httpx
# ---------------------------------------------------------------------------
try:
    from starlette.testclient import TestClient
    from fastapi import status as http_status
    TESTCLIENT_AVAILABLE = True
except ImportError:
    TESTCLIENT_AVAILABLE = False

try:
    import httpx
    import anyio
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


# ---------------------------------------------------------------------------
# STL Fixture Factories
# ---------------------------------------------------------------------------

def _stl_binary_header(n_triangles: int) -> bytes:
    """Return the 84-byte header for a binary STL."""
    header = b"\x00" * 80          # 80-byte comment field (zeroed)
    count  = struct.pack("<I", n_triangles)
    return header + count


def _stl_triangle(
    nx: float, ny: float, nz: float,
    v1: tuple[float, float, float],
    v2: tuple[float, float, float],
    v3: tuple[float, float, float],
) -> bytes:
    """Return 50 bytes for a single STL triangle."""
    packed = struct.pack(
        "<fff fff fff fff H",
        nx, ny, nz,
        *v1, *v2, *v3,
        0,   # attribute byte count
    )
    assert len(packed) == 50
    return packed


def make_stl_empty() -> bytes:
    """Valid binary STL with ZERO triangles — a legal but degenerate mesh."""
    return _stl_binary_header(0)


def make_stl_single_triangle() -> bytes:
    """Minimal non-watertight STL: one triangle (open, hole in mesh)."""
    body = _stl_triangle(
        0.0, 0.0, 1.0,          # normal pointing up
        (0.0, 0.0, 0.0),
        (1.0, 0.0, 0.0),
        (0.0, 1.0, 0.0),
    )
    return _stl_binary_header(1) + body


def make_stl_inverted_normals() -> bytes:
    """
    Closed tetrahedron STL where ALL normals are inverted (pointing inward).
    trimesh.is_watertight will be True but trimesh.volume should be negative.
    """
    # Tetrahedron vertices
    v0 = (0.0, 0.0, 0.0)
    v1 = (10.0, 0.0, 0.0)
    v2 = (5.0, 10.0, 0.0)
    v3 = (5.0, 5.0, 10.0)

    # Faces with INVERTED normals (clockwise winding → inward normals)
    faces = [
        # normal, then vertices in CW order
        ((0.0, 0.0, -1.0),  v0, v2, v1),  # bottom (inverted)
        ((0.0, -1.0, 0.0),  v0, v1, v3),  # front  (inverted)
        ((-1.0, 0.0, 0.0),  v0, v3, v2),  # left   (inverted)
        ((1.0, 1.0, 1.0),   v1, v2, v3),  # right  (inverted — approx)
    ]
    body = b"".join(
        _stl_triangle(n[0], n[1], n[2], a, b, c)
        for (n, a, b, c) in faces
    )
    return _stl_binary_header(4) + body


def make_stl_truncated_midstream() -> bytes:
    """
    STL header claims 5 triangles but binary data is truncated after 1.5 triangles.
    Tests whether trimesh gracefully handles unexpected EOF.
    """
    body = _stl_triangle(0.0, 0.0, 1.0, (0, 0, 0), (1, 0, 0), (0, 1, 0))
    # Only 25 bytes of the second triangle (half a triangle)
    body += b"\xDE\xAD\xBE\xEF" * 6  # 24 bytes of garbage
    return _stl_binary_header(5) + body  # claims 5, only has ~1.5


def make_stl_zero_bytes() -> bytes:
    """Truly empty file uploaded with .stl extension."""
    return b""


def make_ascii_garbage_as_stl() -> bytes:
    """Completely non-STL content uploaded with .stl extension."""
    return b"Hello, I am not an STL file. Here is some SQL: DROP TABLE parts; --"


def make_obj_empty() -> bytes:
    """Minimal valid OBJ with no faces — just a comment."""
    return b"# Empty OBJ file\n# No vertices, no faces\n"


def make_obj_vertices_no_faces() -> bytes:
    """OBJ with vertices but zero face definitions."""
    return (
        b"# OBJ with vertices but no faces\n"
        b"v 0.0 0.0 0.0\n"
        b"v 1.0 0.0 0.0\n"
        b"v 0.0 1.0 0.0\n"
    )


def make_large_payload(size_mb: int = 60) -> bytes:
    """
    Simulated oversized upload (> any reasonable limit that should be enforced).
    We use a valid STL header so it is not rejected on extension grounds.
    Content is padded with zeros.
    """
    return _stl_binary_header(0) + b"\x00" * (size_mb * 1024 * 1024)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

BASE_URL = "http://localhost:8100"

def _upload_bytes(client, content: bytes, filename: str, content_type: str = "application/octet-stream"):
    """POST to /analyse with the given bytes payload."""
    return client.post(
        "/analyse",
        files={"file": (filename, io.BytesIO(content), content_type)},
    )


def _poll_until_terminal(client, job_id: str, timeout: float = 30.0, interval: float = 0.5) -> dict:
    """
    Poll GET /analyse/{job_id} until status is 'complete' or 'failed'.
    Returns the final JSON payload. Raises TimeoutError if deadline exceeded.
    """
    deadline = time.monotonic() + timeout
    last_status = None
    while time.monotonic() < deadline:
        r = client.get(f"/analyse/{job_id}")
        assert r.status_code == 200, f"Polling returned {r.status_code}: {r.text}"
        data = r.json()
        last_status = data.get("status")
        if last_status in ("complete", "failed"):
            return data
        time.sleep(interval)
    raise TimeoutError(
        f"Job {job_id} did not reach terminal state within {timeout}s. "
        f"Last status: {last_status}"
    )


# ===========================================================================
# SECTION A — Malformed Mesh Parsing (Task 1.8)
# ===========================================================================

@pytest.mark.skipif(not TESTCLIENT_AVAILABLE, reason="starlette not installed")
class TestMeshParsingBoundary:
    """
    Adversarial tests for analyse_mesh_file() via the /analyse endpoint.

    Every test verifies that the service DEGRADES GRACEFULLY — either returning
    a semantically valid (possibly zero-valued) result or a caught error status —
    without crashing the server process or leaving unhandled exceptions.
    """

    @pytest.fixture(autouse=True)
    def client(self):
        """
        Spin up an in-process TestClient pointing at the FastAPI app.
        We mock Redis so tests are self-contained.
        """
        # Import here to avoid module-level ImportError if cadquery unavailable
        try:
            import main as svc
        except Exception as e:
            pytest.skip(f"Cannot import main.py: {e}")

        fake_redis = _build_fake_redis()
        with patch.object(svc, "redis_client", fake_redis):
            with TestClient(svc.app, raise_server_exceptions=False) as c:
                self._fake_redis = fake_redis
                self._svc = svc
                yield c

    # ── A-01 ───────────────────────────────────────────────────────────────

    def test_A01_empty_stl_zero_triangles(self, client):
        """
        [A-01] Upload a valid binary STL claiming 0 triangles.
        Expected: 202 accepted; job eventually reaches 'complete' OR 'failed'
        with NO unhandled server exception (no 5xx from the endpoint itself).
        The result volume_mm3 MUST be 0.0 or null — not a nonsensical positive number.
        """
        r = _upload_bytes(client, make_stl_empty(), "empty.stl")
        assert r.status_code == 202, f"Expected 202, got {r.status_code}: {r.text}"
        job_id = r.json()["job_id"]

        result = _poll_until_terminal(client, job_id)
        # Either complete with zero volume OR graceful failure — both acceptable
        if result["status"] == "complete":
            assert result["result"]["volume_mm3"] == 0.0, (
                "Empty mesh should report 0.0 volume, "
                f"got {result['result']['volume_mm3']}"
            )
        else:
            # 'failed' is acceptable; 'error' field MUST be populated
            assert result.get("error"), "Failed job must have an error message"

    # ── A-02 ───────────────────────────────────────────────────────────────

    def test_A02_single_triangle_open_mesh(self, client):
        """
        [A-02] Upload a single-triangle STL — topologically open (non-watertight hole).
        Expected: is_watertight == False in the result.
        The service must NOT report this as watertight.
        """
        r = _upload_bytes(client, make_stl_single_triangle(), "open.stl")
        assert r.status_code == 202
        job_id = r.json()["job_id"]

        result = _poll_until_terminal(client, job_id)
        if result["status"] == "complete":
            assert result["result"]["is_watertight"] is False, (
                "Single open triangle cannot be watertight"
            )

    # ── A-03 ───────────────────────────────────────────────────────────────

    def test_A03_inverted_normals_volume_not_negative(self, client):
        """
        [A-03] Upload a closed tetrahedron with all-inverted normals.

        KNOWN BUG PROBE: trimesh.volume is signed — inverted winding gives
        negative volume. If mesh.is_volume is True but volume is negative,
        analyse_mesh_file() reports:
          - volume_mm3 < 0           (physically impossible)
          - material_removal_ratio > 1.0  (spec says 0.0–1.0)
          - wall_thickness_min_mm < 0  (physically impossible)

        Expected post-fix: volume_mm3 >= 0.0 and material_removal_ratio in [0.0, 1.0].
        """
        r = _upload_bytes(client, make_stl_inverted_normals(), "inverted.stl")
        assert r.status_code == 202
        job_id = r.json()["job_id"]

        result = _poll_until_terminal(client, job_id)
        if result["status"] == "complete":
            res = result["result"]

            # ──── PRIMARY ASSERTION ────
            assert res["volume_mm3"] >= 0.0, (
                f"[P2 BUG] volume_mm3 is NEGATIVE ({res['volume_mm3']}) "
                f"for inverted-normal mesh. analyse_mesh_file() must call "
                f"abs(mesh.volume) or use convex_hull.volume unconditionally."
            )

            # ──── SECONDARY ASSERTION ────
            assert 0.0 <= res["material_removal_ratio"] <= 1.0, (
                f"[P2 BUG] material_removal_ratio out of range: "
                f"{res['material_removal_ratio']}. MRR > 1.0 implies negative volume."
            )

            # ──── TERTIARY ASSERTION ────
            if res.get("wall_thickness_min_mm") is not None:
                assert res["wall_thickness_min_mm"] >= 0.0, (
                    f"[P2 BUG] wall_thickness_min_mm is negative: "
                    f"{res['wall_thickness_min_mm']}"
                )

    # ── A-04 ───────────────────────────────────────────────────────────────

    def test_A04_truncated_stl_does_not_crash_server(self, client):
        """
        [A-04] Upload a binary STL truncated mid-triangle (corrupt EOF).
        The server MUST NOT return 5xx from the endpoint itself.
        The job MUST reach 'failed' status (not hang indefinitely).
        """
        r = _upload_bytes(client, make_stl_truncated_midstream(), "truncated.stl")
        assert r.status_code == 202, (
            f"Endpoint returned {r.status_code} — should always 202 on valid extension"
        )
        job_id = r.json()["job_id"]

        # Must terminate within 30s
        result = _poll_until_terminal(client, job_id, timeout=30.0)
        # Both 'complete' (trimesh partial-load) and 'failed' (graceful error) are acceptable
        assert result["status"] in ("complete", "failed"), (
            f"Unexpected terminal status: {result['status']}"
        )

    # ── A-05 ───────────────────────────────────────────────────────────────

    def test_A05_zero_byte_file_rejected_gracefully(self, client):
        """
        [A-05] Upload a completely empty file (0 bytes) with .stl extension.
        Expected: either 400 (if validated client-side) or job reaches 'failed'
        with an informative error. MUST NOT return 500 from the endpoint.
        """
        r = _upload_bytes(client, make_stl_zero_bytes(), "empty.stl")
        if r.status_code == 202:
            job_id = r.json()["job_id"]
            result = _poll_until_terminal(client, job_id)
            assert result["status"] == "failed", (
                "Zero-byte file should fail analysis gracefully"
            )
            assert result.get("error"), "Failure must have error message populated"
        else:
            # 400 is also acceptable if validation rejects it
            assert r.status_code == 400, (
                f"Zero-byte file should be 202 (queued) or 400 (rejected), "
                f"not {r.status_code}"
            )

    # ── A-06 ───────────────────────────────────────────────────────────────

    def test_A06_ascii_garbage_as_stl_does_not_crash(self, client):
        """
        [A-06] Upload SQL-injection-style garbage content with .stl extension.
        Verifies that the mesh parser does not eval/exec content and fails safely.
        """
        r = _upload_bytes(client, make_ascii_garbage_as_stl(), "garbage.stl")
        assert r.status_code == 202
        job_id = r.json()["job_id"]

        result = _poll_until_terminal(client, job_id, timeout=30.0)
        assert result["status"] in ("complete", "failed")
        # Server must still be alive
        health = client.get("/health")
        assert health.status_code == 200, "Server crashed after garbage STL input!"

    # ── A-07 ───────────────────────────────────────────────────────────────

    def test_A07_obj_with_vertices_but_no_faces(self, client):
        """
        [A-07] Upload an OBJ with vertices but zero face definitions.
        Expected: face_count == 0; volume_mm3 == 0.0; no crash.
        """
        r = _upload_bytes(client, make_obj_vertices_no_faces(), "nofaces.obj")
        assert r.status_code == 202
        job_id = r.json()["job_id"]

        result = _poll_until_terminal(client, job_id)
        if result["status"] == "complete":
            assert result["result"]["face_count"] == 0
            assert result["result"]["volume_mm3"] == 0.0

    # ── A-08 ───────────────────────────────────────────────────────────────

    def test_A08_unsupported_extension_rejected(self, client):
        """
        [A-08] Upload a .ply file (unsupported) — must return 400, not 500.
        Also tests: .exe, .py (injection vectors).
        """
        for bad_ext, content in [
            ("model.ply",  b"ply format ascii 1.0\n"),
            ("attack.exe", b"MZ\x90\x00"),
            ("evil.py",    b"import os; os.system('rm -rf /')"),
        ]:
            r = _upload_bytes(client, content, bad_ext)
            assert r.status_code == 400, (
                f"Expected 400 for {bad_ext}, got {r.status_code}"
            )

    # ── A-09 ───────────────────────────────────────────────────────────────

    def test_A09_no_file_field_in_multipart(self, client):
        """
        [A-09] POST /analyse with no 'file' field — must return 422 (Unprocessable Entity).
        """
        r = client.post("/analyse", data={"not_a_file": "oops"})
        assert r.status_code == 422, (
            f"Missing file field should be 422, got {r.status_code}"
        )


# ===========================================================================
# SECTION B — Async Polling State Machine (Task 1.9)
# ===========================================================================

@pytest.mark.skipif(not TESTCLIENT_AVAILABLE, reason="starlette not installed")
class TestAsyncPollingStateMachine:
    """
    Adversarial tests for the async job lifecycle:
    queued → processing → complete | failed
    """

    @pytest.fixture(autouse=True)
    def client(self):
        try:
            import main as svc
        except Exception as e:
            pytest.skip(f"Cannot import main.py: {e}")

        self._fake_redis = _build_fake_redis()
        with patch.object(svc, "redis_client", self._fake_redis):
            with TestClient(svc.app, raise_server_exceptions=False) as c:
                self._svc = svc
                yield c

    # ── B-01 ───────────────────────────────────────────────────────────────

    def test_B01_job_lifecycle_queued_to_complete(self, client):
        """
        [B-01] Upload a valid minimal STL; poll until complete.
        Assert state transitions:
          POST /analyse → 202 with status='queued'
          GET /analyse/{id} → eventually status='complete'
          result dict must be non-null and schema-valid.
        """
        r = _upload_bytes(client, make_stl_single_triangle(), "triangle.stl")
        assert r.status_code == 202
        payload = r.json()
        assert payload["status"] == "queued"
        assert "job_id" in payload
        assert "websocket_channel" in payload

        job_id = payload["job_id"]
        result = _poll_until_terminal(client, job_id)

        # Validate schema completeness
        if result["status"] == "complete":
            res = result["result"]
            required_fields = [
                "volume_mm3", "surface_area_mm2", "bounding_box",
                "stock_volume_mm3", "material_removal_ratio",
                "face_count", "solid_count", "is_watertight"
            ]
            for field in required_fields:
                assert field in res, f"Missing required field: {field}"
            assert isinstance(res["bounding_box"], dict)
            assert {"x_mm", "y_mm", "z_mm"}.issubset(res["bounding_box"].keys())

    # ── B-02 ───────────────────────────────────────────────────────────────

    def test_B02_unknown_job_id_returns_404(self, client):
        """
        [B-02] Poll a job_id that was never created — must return 404, not 500.
        """
        fake_id = str(uuid.uuid4())
        r = client.get(f"/analyse/{fake_id}")
        assert r.status_code == 404, (
            f"Unknown job should be 404, got {r.status_code}: {r.text}"
        )

    # ── B-03 ───────────────────────────────────────────────────────────────

    def test_B03_malicious_job_id_path_traversal(self, client):
        """
        [B-03] Attempt path traversal via job_id — must return 404, not expose filesystem.
        Attack strings: '../../../etc/passwd', '%2F..%2F..', null bytes.
        """
        attack_ids = [
            "../../../etc/passwd",
            "..\\..\\windows\\system32",
            "'; DROP TABLE jobs; --",
            "\x00malicious",
            "a" * 1000,  # extremely long ID
        ]
        for attack_id in attack_ids:
            r = client.get(f"/analyse/{attack_id}")
            assert r.status_code in (404, 422), (
                f"Attack probe '{attack_id[:30]}...' returned {r.status_code}, "
                f"expected 404 or 422"
            )

    # ── B-04 ───────────────────────────────────────────────────────────────

    def test_B04_redis_unavailable_returns_503(self, client):
        """
        [B-04] Simulate Redis being down during job submission.
        Expected: 503 Service Unavailable (not 500 Internal Server Error).
        """
        try:
            import main as svc
            import redis
        except ImportError:
            pytest.skip("Cannot import required modules")

        # Make Redis connection raise ConnectionError on hset
        broken_redis = MagicMock()
        broken_redis.hset.side_effect = redis.exceptions.ConnectionError("refused")

        with patch.object(svc, "redis_client", broken_redis):
            with TestClient(svc.app, raise_server_exceptions=False) as c:
                r = _upload_bytes(c, make_stl_single_triangle(), "test.stl")
                assert r.status_code == 503, (
                    f"Redis down should return 503, got {r.status_code}: {r.text}"
                )

    # ── B-05 ───────────────────────────────────────────────────────────────

    def test_B05_temp_file_cleaned_up_after_completion(self, client):
        """
        [B-05] Verify that the temporary file is deleted after job completion.
        We capture the tmp_path via a side-effect on tempfile.NamedTemporaryFile.
        """
        captured_paths = []
        real_ntf = tempfile.NamedTemporaryFile

        def spy_ntf(*args, **kwargs):
            ctx = real_ntf(*args, **kwargs)
            captured_paths.append(ctx.name)
            return ctx

        with patch("tempfile.NamedTemporaryFile", side_effect=spy_ntf):
            r = _upload_bytes(client, make_stl_single_triangle(), "cleanup.stl")

        if r.status_code != 202:
            pytest.skip("Upload failed — cannot test cleanup")

        job_id = r.json()["job_id"]
        _poll_until_terminal(client, job_id, timeout=30.0)

        # Allow OS a moment to flush
        time.sleep(0.2)

        for path in captured_paths:
            assert not os.path.exists(path), (
                f"[P1 BUG] Temp file NOT cleaned up: {path} still exists after job completion."
            )

    # ── B-06 ───────────────────────────────────────────────────────────────

    def test_B06_temp_file_leaked_on_redis_timeout_error(self):
        """
        [B-06] Simulate a redis.TimeoutError (NOT ConnectionError) during hset.

        KNOWN BUG PROBE: The except clause on line 368 of main.py only catches
        redis.exceptions.ConnectionError. A TimeoutError or ResponseError will:
          1. Propagate unhandled → FastAPI returns 500
          2. The write to tmp_path has ALREADY occurred
          3. os.unlink(tmp_path) is NEVER called → temp file leak

        Expected post-fix: All redis.exceptions.RedisError subclasses must be
        caught, and tmp_path cleaned up on any Redis failure.
        """
        try:
            import main as svc
            import redis
        except ImportError:
            pytest.skip("Cannot import required modules")

        written_paths = []
        leaked_paths  = []

        # Intercept NamedTemporaryFile to track which paths were written
        real_ntf = tempfile.NamedTemporaryFile
        def tracking_ntf(*args, **kwargs):
            ctx = real_ntf(*args, **kwargs)
            written_paths.append(ctx.name)
            return ctx

        # Make Redis raise TimeoutError on hset
        broken_redis = MagicMock()
        broken_redis.hset.side_effect = redis.exceptions.TimeoutError("Redis timeout")

        with patch("tempfile.NamedTemporaryFile", side_effect=tracking_ntf):
            with patch.object(svc, "redis_client", broken_redis):
                with TestClient(svc.app, raise_server_exceptions=False) as c:
                    r = _upload_bytes(c, make_stl_single_triangle(), "leaktest.stl")

        # The endpoint should return a non-2xx error
        assert r.status_code != 202, (
            "A Redis TimeoutError during hset should NOT result in 202 Accepted"
        )

        # Check for leaked temp files
        time.sleep(0.1)
        for path in written_paths:
            if os.path.exists(path):
                leaked_paths.append(path)
                try:
                    os.unlink(path)  # Clean up after ourselves
                except Exception:
                    pass

        assert len(leaked_paths) == 0, (
            f"[P1 BUG] Temp file(s) LEAKED on Redis TimeoutError: {leaked_paths}. "
            f"Fix: catch redis.exceptions.RedisError (base class) instead of "
            f"redis.exceptions.ConnectionError only."
        )


# ===========================================================================
# SECTION C — Concurrent Queue Saturation (Task 1.9)
# ===========================================================================

@pytest.mark.skipif(not TESTCLIENT_AVAILABLE, reason="starlette not installed")
class TestConcurrentQueueSaturation:
    """
    Fire N parallel requests at /analyse to stress-test BackgroundTasks queue.
    Uses threading to simulate concurrent HTTP clients.
    """

    @pytest.fixture(autouse=True)
    def client(self):
        try:
            import main as svc
        except Exception as e:
            pytest.skip(f"Cannot import main.py: {e}")

        self._fake_redis = _build_fake_redis()
        with patch.object(svc, "redis_client", self._fake_redis):
            # TestClient needs to be created once (thread-safe for reads)
            with TestClient(svc.app, raise_server_exceptions=False) as c:
                self._svc = svc
                yield c

    # ── C-01 ───────────────────────────────────────────────────────────────

    def test_C01_ten_concurrent_stl_uploads_all_accepted(self, client):
        """
        [C-01] Fire 10 simultaneous STL uploads.
        All must receive 202 Accepted with unique job_ids.
        No two jobs may share the same job_id (UUID collision check).
        """
        N = 10
        results: list[tuple[int, dict | None]] = []
        lock = threading.Lock()

        def upload_one():
            r = _upload_bytes(client, make_stl_single_triangle(), "concurrent.stl")
            with lock:
                results.append((r.status_code, r.json() if r.status_code == 202 else None))

        threads = [threading.Thread(target=upload_one) for _ in range(N)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=60.0)

        accepted = [r for (code, r) in results if code == 202 and r is not None]
        assert len(accepted) == N, (
            f"Only {len(accepted)}/{N} requests returned 202. "
            f"BackgroundTasks queue may be dropping jobs."
        )

        # UUID collision check
        job_ids = [r["job_id"] for r in accepted]
        assert len(set(job_ids)) == N, (
            f"[P0 BUG] Duplicate job_ids detected in concurrent uploads: "
            f"{[jid for jid in job_ids if job_ids.count(jid) > 1]}"
        )

    # ── C-02 ───────────────────────────────────────────────────────────────

    def test_C02_concurrent_jobs_all_reach_terminal_state(self, client):
        """
        [C-02] Fire 5 simultaneous uploads; poll all until terminal.
        All must reach 'complete' or 'failed' — none may be stuck in 'queued'
        or 'processing' indefinitely (timeout 60s).
        """
        N = 5
        job_ids: list[str] = []

        for _ in range(N):
            r = _upload_bytes(client, make_stl_single_triangle(), "batch.stl")
            if r.status_code == 202:
                job_ids.append(r.json()["job_id"])

        assert len(job_ids) == N, f"Only {len(job_ids)}/{N} jobs accepted"

        stuck_jobs = []
        for jid in job_ids:
            try:
                _poll_until_terminal(client, jid, timeout=60.0)
            except TimeoutError:
                stuck_jobs.append(jid)

        assert len(stuck_jobs) == 0, (
            f"[P1 BUG] {len(stuck_jobs)} job(s) stuck in non-terminal state "
            f"after 60s: {stuck_jobs}. "
            f"BackgroundTasks may be blocking on CadQuery/trimesh concurrency."
        )

    # ── C-03 ───────────────────────────────────────────────────────────────

    def test_C03_concurrent_polling_does_not_corrupt_state(self, client):
        """
        [C-03] After submitting one job, fire 20 concurrent GET /analyse/{job_id}
        requests simultaneously while the job is processing.
        Assert that no concurrent reader observes a corrupt/empty status string.
        """
        r = _upload_bytes(client, make_stl_single_triangle(), "pollstorm.stl")
        if r.status_code != 202:
            pytest.skip("Upload failed")
        job_id = r.json()["job_id"]

        valid_statuses = {"queued", "processing", "complete", "failed"}
        bad_statuses: list = []
        lock = threading.Lock()

        def poll_one():
            resp = client.get(f"/analyse/{job_id}")
            if resp.status_code == 200:
                s = resp.json().get("status")
                if s not in valid_statuses:
                    with lock:
                        bad_statuses.append(s)

        threads = [threading.Thread(target=poll_one) for _ in range(20)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=10.0)

        assert len(bad_statuses) == 0, (
            f"[P1 BUG] Concurrent polling returned invalid status values: {bad_statuses}. "
            f"Redis read may have a race condition producing partial hash reads."
        )


# ===========================================================================
# SECTION D — File Size Limit (DoS Vector)
# ===========================================================================

@pytest.mark.skipif(not TESTCLIENT_AVAILABLE, reason="starlette not installed")
class TestFileSizeLimit:
    """
    No file size limit is enforced — a single large upload can OOM the service.
    These tests probe the absence of the limit.
    """

    @pytest.fixture(autouse=True)
    def client(self):
        try:
            import main as svc
        except Exception as e:
            pytest.skip(f"Cannot import main.py: {e}")

        fake_redis = _build_fake_redis()
        with patch.object(svc, "redis_client", fake_redis):
            with TestClient(svc.app, raise_server_exceptions=False) as c:
                yield c

    # ── D-01 ───────────────────────────────────────────────────────────────

    def test_D01_no_file_size_limit_enforced(self, client):
        """
        [D-01] Upload a 60 MB payload with .stl extension.

        KNOWN BUG PROBE: main.py line 353 — `content = await file.read()` —
        reads the ENTIRE file into memory with no size check.
        A 60 MB upload should be REJECTED (413 Entity Too Large) before
        it is buffered in RAM, but currently it is accepted.

        Expected post-fix: Add a MAX_UPLOAD_BYTES guard (e.g. 100 MB) that
        returns 413 before calling file.read().

        Note: This test passes if the server returns 413. It FAILS if the
        server returns 202 (no limit enforced) — which is the current behaviour.
        """
        payload = make_large_payload(size_mb=60)
        r = _upload_bytes(client, payload, "oversized.stl")

        assert r.status_code == 413, (
            f"[P1 BUG] No file size limit enforced. "
            f"60 MB upload returned {r.status_code} (expected 413). "
            f"The entire file is buffered in RAM with no limit check. "
            f"Fix: check content-length header or read in chunks, and reject "
            f"files > MAX_UPLOAD_BYTES before buffering."
        )


# ===========================================================================
# SECTION E — Integration Tests (require live server on :8100)
# ===========================================================================

@pytest.mark.integration
class TestIntegrationLiveServer:
    """
    Integration tests that require `uvicorn main:app --port 8100` to be running.
    Run with: pytest -m integration test_adversarial.py
    """

    BASE = "http://localhost:8100"

    @pytest.fixture(autouse=True)
    def check_server(self):
        if not REQUESTS_AVAILABLE:
            pytest.skip("requests not installed")
        try:
            requests.get(f"{self.BASE}/health", timeout=2)
        except Exception:
            pytest.skip("Live server not running on :8100")

    def test_E01_health_check(self):
        r = requests.get(f"{self.BASE}/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_E02_live_concurrent_uploads(self):
        """
        [E-02] Fire 10 real concurrent uploads against the live server.
        Each should return 202 with a unique job_id.
        All should reach terminal state within 120s.
        """
        N = 10
        accepted_jobs = []
        lock = threading.Lock()

        def fire():
            r = requests.post(
                f"{self.BASE}/analyse",
                files={"file": ("test.stl", io.BytesIO(make_stl_single_triangle()), "application/octet-stream")},
                timeout=30,
            )
            if r.status_code == 202:
                with lock:
                    accepted_jobs.append(r.json()["job_id"])

        threads = [threading.Thread(target=fire) for _ in range(N)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=60)

        assert len(accepted_jobs) == N

        stuck = []
        for jid in accepted_jobs:
            deadline = time.monotonic() + 120
            while time.monotonic() < deadline:
                r = requests.get(f"{self.BASE}/analyse/{jid}", timeout=5)
                if r.json().get("status") in ("complete", "failed"):
                    break
                time.sleep(1)
            else:
                stuck.append(jid)

        assert not stuck, f"Jobs stuck: {stuck}"

    def test_E03_temp_file_not_present_after_completion(self):
        """
        [E-03] After a job completes on the live server, verify no .stl/.step
        temp files remain in the system temp directory.
        NOTE: This is a best-effort check — we look for recent files.
        """
        import glob

        tmp_dir = tempfile.gettempdir()
        before = set(glob.glob(os.path.join(tmp_dir, "tmp*.stl")))

        r = requests.post(
            f"{self.BASE}/analyse",
            files={"file": ("cleanup_check.stl", io.BytesIO(make_stl_single_triangle()), "application/octet-stream")},
            timeout=30,
        )
        if r.status_code != 202:
            pytest.skip("Upload failed")

        job_id = r.json()["job_id"]
        deadline = time.monotonic() + 60
        while time.monotonic() < deadline:
            resp = requests.get(f"{self.BASE}/analyse/{job_id}", timeout=5).json()
            if resp["status"] in ("complete", "failed"):
                break
            time.sleep(1)

        time.sleep(0.5)  # OS flush
        after = set(glob.glob(os.path.join(tmp_dir, "tmp*.stl")))
        leaked = after - before

        assert not leaked, (
            f"[P1 BUG] Temp STL file(s) not cleaned up after job completion: {leaked}"
        )


# ===========================================================================
# Helpers
# ===========================================================================

def _build_fake_redis() -> MagicMock:
    """
    Build an in-memory fake Redis backed by a plain dict.
    Supports: hset, hgetall, expire.
    Thread-safe for concurrent test use.
    """
    store: dict[str, dict] = {}
    _lock = threading.Lock()

    mock = MagicMock()

    def fake_hset(key, mapping=None, **kwargs):
        with _lock:
            if key not in store:
                store[key] = {}
            if mapping:
                store[key].update(mapping)

    def fake_hgetall(key):
        with _lock:
            return dict(store.get(key, {}))

    def fake_expire(key, seconds):
        pass  # No-op — no TTL logic needed in tests

    mock.hset.side_effect = fake_hset
    mock.hgetall.side_effect = fake_hgetall
    mock.expire.side_effect = fake_expire

    return mock
