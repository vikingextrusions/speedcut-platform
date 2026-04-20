# Geometry Analysis Service

Local Python service that parses STEP files and extracts manufacturing-relevant geometry data (volume, surface area, bounding box, etc.) for instant quoting.

## Quick Start

### 1. Install dependencies

```bash
# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

> **Note:** CadQuery depends on OpenCascade. If `pip install` fails, use conda instead:
> ```bash
> conda create -n geometry python=3.11
> conda activate geometry
> conda install -c cadquery -c conda-forge cadquery
> pip install fastapi uvicorn python-multipart
> ```

### 2. Run the service

```bash
uvicorn main:app --reload --port 8100
```

### 3. Test it

```bash
curl -X POST http://localhost:8100/analyse \
  -F "file=@your-model.step"
```

## API

### `POST /analyse`

Upload a STEP file and receive geometry analysis.

**Request:** `multipart/form-data` with a `file` field containing the STEP file.

**Response:**
```json
{
  "success": true,
  "filename": "bracket.step",
  "analysis": {
    "volume_mm3": 12450.52,
    "surface_area_mm2": 8920.31,
    "bounding_box": {
      "x_mm": 80.0,
      "y_mm": 45.0,
      "z_mm": 25.0
    },
    "stock_volume_mm3": 90000.0,
    "material_removal_ratio": 0.862,
    "face_count": 42,
    "solid_count": 1,
    "is_watertight": true
  }
}
```

### `GET /health`

Health check endpoint.
