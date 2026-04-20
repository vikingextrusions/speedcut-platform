# Speedcut Pricing Engine

Desktop test application for STEP file geometry analysis and CNC cost estimation.

## Quick Start

```bash
# Option 1: Create a new virtual environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Option 2: Reuse the geometry-analysis venv (already has CadQuery)
..\geometry-analysis\venv\Scripts\activate
pip install python-dotenv

# Run the desktop app
python desktop_app.py
```

## Architecture

```
pricing-engine/
├── geometry_analyzer.py   # Pure logic — STEP parsing & geometry extraction
├── desktop_app.py         # Tkinter GUI for testing & iteration
├── requirements.txt       # Python dependencies
└── README.md
```

### `geometry_analyzer.py`
Core module extracted from the FastAPI geometry-analysis service. Zero web dependencies.
Can be imported by any Python application (desktop, FastAPI, CLI).

Features beyond the original FastAPI service:
- **Face type classification** — planar, cylindrical, conical, spherical, toroidal, BSpline
- **Edge type classification** — lines, arcs, BSplines
- **Total edge length estimation** — approximate perimeter calculation
- **Complexity scoring** — 0-100 score based on geometry features

### `desktop_app.py`
Tkinter desktop GUI with dark theme matching Speedcut design system.

Features:
- Browse for STEP files
- Full geometry analysis display with metric cards
- Topology breakdown (face/edge types)
- CNC cost estimation with material selection
- Editable rate parameters for rapid iteration
- Copy report to clipboard
