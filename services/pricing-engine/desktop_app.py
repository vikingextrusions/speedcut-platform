"""
Speedcut Desktop Test App
===========================
Tkinter desktop application for testing STEP file geometry
analysis and pricing logic before integration into the
Next.js platform.

Run with:  python desktop_app.py
Requires:  cadquery, OCP (pip install cadquery)
"""

import os
import sys
import math
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from dataclasses import dataclass
from typing import Optional

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geometry_analyzer import analyse_step_file, GeometryAnalysis


# ─── Theme Constants ───

COLORS = {
    "bg_primary": "#0f172a",
    "bg_surface": "#1e293b",
    "bg_elevated": "#334155",
    "bg_input": "#0d1321",
    "text_primary": "#f8fafc",
    "text_secondary": "#cbd5e1",
    "text_muted": "#94a3b8",
    "accent": "#00d9e1",
    "accent_hover": "#00f0f9",
    "accent_dim": "#006d72",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "border": "#2d3a4f",
    "border_accent": "#00d9e166",
}

FONT_FAMILY = "Segoe UI"
FONT = (FONT_FAMILY, 10)
FONT_SMALL = (FONT_FAMILY, 9)
FONT_TINY = (FONT_FAMILY, 8)
FONT_BOLD = (FONT_FAMILY, 10, "bold")
FONT_HEADING = (FONT_FAMILY, 12, "bold")
FONT_TITLE = (FONT_FAMILY, 16, "bold")
FONT_LARGE_VALUE = (FONT_FAMILY, 14, "bold")
FONT_MONO = ("Consolas", 10)
FONT_MONO_SMALL = ("Consolas", 9)


# ─── CNC Cost Estimation Defaults ───

@dataclass
class CNCEstimateConfig:
    """Rough CNC cost estimation parameters."""
    # Material densities (kg/mm³)
    densities = {
        "Aluminium 6082-T6": 2.71e-6,
        "Mild Steel": 7.85e-6,
        "Stainless Steel 316": 8.00e-6,
        "Tool Steel": 7.80e-6,
        "Brass": 8.50e-6,
        "Copper": 8.96e-6,
        "Titanium Grade 5": 4.43e-6,
        "Nylon / Delrin": 1.15e-6,
    }

    # Material cost (£/kg)
    material_prices = {
        "Aluminium 6082-T6": 8.50,
        "Mild Steel": 3.50,
        "Stainless Steel 316": 12.00,
        "Tool Steel": 15.00,
        "Brass": 10.00,
        "Copper": 14.00,
        "Titanium Grade 5": 45.00,
        "Nylon / Delrin": 18.00,
    }

    # Machining parameters
    removal_rate_per_mm3: float = 0.005  # £/mm³ removed (rough baseline)
    setup_cost: float = 25.0             # Fixed per-part setup
    finishing_rate: float = 0.002        # £/mm² for surface finishing


# ─── Helper Widgets ───

class MetricCard(tk.Frame):
    """A single metric display card."""

    def __init__(self, parent, label: str, value: str = "—",
                 unit: str = "", accent: bool = False, **kwargs):
        super().__init__(parent, bg=COLORS["bg_surface"],
                         highlightthickness=1,
                         highlightbackground=COLORS["border"],
                         **kwargs)

        self.configure(padx=12, pady=10)

        label_color = COLORS["accent"] if accent else COLORS["text_muted"]
        value_color = COLORS["accent"] if accent else COLORS["text_primary"]

        self._label = tk.Label(
            self, text=label.upper(), font=FONT_TINY,
            fg=label_color, bg=COLORS["bg_surface"],
            anchor="w"
        )
        self._label.pack(fill="x")

        value_frame = tk.Frame(self, bg=COLORS["bg_surface"])
        value_frame.pack(fill="x", pady=(2, 0))

        self._value = tk.Label(
            value_frame, text=value, font=FONT_LARGE_VALUE,
            fg=value_color, bg=COLORS["bg_surface"],
            anchor="w"
        )
        self._value.pack(side="left")

        if unit:
            self._unit = tk.Label(
                value_frame, text=unit, font=FONT_SMALL,
                fg=COLORS["text_muted"], bg=COLORS["bg_surface"],
                anchor="w"
            )
            self._unit.pack(side="left", padx=(4, 0))

    def set_value(self, value: str, color: Optional[str] = None):
        self._value.configure(text=value)
        if color:
            self._value.configure(fg=color)


class SectionHeader(tk.Frame):
    """A section header with an icon and divider."""

    def __init__(self, parent, text: str, icon: str = "◆", **kwargs):
        super().__init__(parent, bg=COLORS["bg_primary"], **kwargs)

        header = tk.Frame(self, bg=COLORS["bg_primary"])
        header.pack(fill="x", pady=(16, 8))

        tk.Label(
            header, text=icon, font=FONT_SMALL,
            fg=COLORS["accent"], bg=COLORS["bg_primary"]
        ).pack(side="left", padx=(0, 6))

        tk.Label(
            header, text=text.upper(), font=(FONT_FAMILY, 9, "bold"),
            fg=COLORS["text_secondary"], bg=COLORS["bg_primary"],
            anchor="w"
        ).pack(side="left")

        # Divider line
        tk.Frame(
            header, bg=COLORS["border"], height=1
        ).pack(side="left", fill="x", expand=True, padx=(12, 0), pady=1)


class BreakdownRow(tk.Frame):
    """A key-value breakdown row."""

    def __init__(self, parent, label: str, value: str = "—",
                 bold: bool = False, accent: bool = False, **kwargs):
        super().__init__(parent, bg=COLORS["bg_surface"], **kwargs)

        font = FONT_BOLD if bold else FONT_SMALL
        color = COLORS["accent"] if accent else COLORS["text_primary"]
        label_color = COLORS["text_primary"] if bold else COLORS["text_muted"]

        self._label_widget = tk.Label(
            self, text=label, font=font,
            fg=label_color, bg=COLORS["bg_surface"],
            anchor="w"
        )
        self._label_widget.pack(side="left", fill="x", expand=True)

        self._value_widget = tk.Label(
            self, text=value, font=font,
            fg=color, bg=COLORS["bg_surface"],
            anchor="e"
        )
        self._value_widget.pack(side="right")

    def set_value(self, value: str, color: Optional[str] = None):
        self._value_widget.configure(text=value)
        if color:
            self._value_widget.configure(fg=color)


# ─── Main Application ───

class SpeedcutDesktopApp:
    """Main desktop application window."""

    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Speedcut — Geometry Analysis & Pricing")
        self.root.configure(bg=COLORS["bg_primary"])
        self.root.geometry("1100x820")
        self.root.minsize(900, 700)

        # State
        self.current_analysis: Optional[GeometryAnalysis] = None
        self.cnc_config = CNCEstimateConfig()

        # Configure ttk styles
        self._configure_styles()

        # Build UI
        self._build_ui()

    def _configure_styles(self):
        style = ttk.Style()
        style.theme_use("clam")

        style.configure("Dark.TCombobox",
                         fieldbackground=COLORS["bg_input"],
                         background=COLORS["bg_elevated"],
                         foreground=COLORS["text_primary"],
                         selectbackground=COLORS["accent_dim"],
                         selectforeground=COLORS["text_primary"],
                         arrowcolor=COLORS["accent"])

        style.map("Dark.TCombobox",
                   fieldbackground=[("readonly", COLORS["bg_input"])],
                   foreground=[("readonly", COLORS["text_primary"])])

        style.configure("Accent.TProgressbar",
                         troughcolor=COLORS["bg_elevated"],
                         background=COLORS["accent"],
                         thickness=6)

    def _build_ui(self):
        # ── Title Bar ──
        title_bar = tk.Frame(self.root, bg=COLORS["bg_surface"], height=56)
        title_bar.pack(fill="x")
        title_bar.pack_propagate(False)

        title_inner = tk.Frame(title_bar, bg=COLORS["bg_surface"])
        title_inner.pack(fill="both", expand=True, padx=20)

        tk.Label(
            title_inner, text="⚡", font=(FONT_FAMILY, 18),
            fg=COLORS["accent"], bg=COLORS["bg_surface"]
        ).pack(side="left", padx=(0, 8))

        tk.Label(
            title_inner, text="Speedcut", font=FONT_TITLE,
            fg=COLORS["text_primary"], bg=COLORS["bg_surface"]
        ).pack(side="left")

        tk.Label(
            title_inner, text="Geometry & Pricing Engine", font=FONT_SMALL,
            fg=COLORS["text_muted"], bg=COLORS["bg_surface"]
        ).pack(side="left", padx=(8, 0))

        # Version badge
        badge = tk.Label(
            title_inner, text=" v0.1.0 ", font=FONT_TINY,
            fg=COLORS["accent"], bg=COLORS["accent_dim"],
            padx=6, pady=1
        )
        badge.pack(side="right")

        # ── Main Content (two-column) ──
        main = tk.Frame(self.root, bg=COLORS["bg_primary"])
        main.pack(fill="both", expand=True, padx=16, pady=(12, 16))

        # Left column: File input & analysis results
        left_col = tk.Frame(main, bg=COLORS["bg_primary"])
        left_col.pack(side="left", fill="both", expand=True, padx=(0, 8))

        # Right column: Pricing & breakdown
        right_col = tk.Frame(main, bg=COLORS["bg_primary"])
        right_col.pack(side="right", fill="both", expand=True, padx=(8, 0))

        self._build_file_input(left_col)
        self._build_analysis_results(left_col)
        self._build_pricing_panel(right_col)

    def _build_file_input(self, parent):
        """Build the file selection / drop zone area."""
        SectionHeader(parent, "Step File Input", icon="📂").pack(fill="x")

        file_frame = tk.Frame(parent, bg=COLORS["bg_surface"],
                              highlightthickness=1,
                              highlightbackground=COLORS["border"])
        file_frame.pack(fill="x", pady=(0, 4))

        inner = tk.Frame(file_frame, bg=COLORS["bg_surface"], padx=16, pady=14)
        inner.pack(fill="x")

        # File path entry
        path_frame = tk.Frame(inner, bg=COLORS["bg_surface"])
        path_frame.pack(fill="x")

        self.file_path_var = tk.StringVar()
        self.file_entry = tk.Entry(
            path_frame, textvariable=self.file_path_var,
            font=FONT_MONO_SMALL, bg=COLORS["bg_input"],
            fg=COLORS["text_secondary"], insertbackground=COLORS["accent"],
            relief="flat", highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        self.file_entry.pack(side="left", fill="x", expand=True, ipady=6)

        browse_btn = tk.Button(
            path_frame, text="Browse", font=FONT_BOLD,
            bg=COLORS["bg_elevated"], fg=COLORS["text_primary"],
            activebackground=COLORS["accent_dim"],
            activeforeground=COLORS["text_primary"],
            relief="flat", padx=16, pady=4, cursor="hand2",
            command=self._browse_file
        )
        browse_btn.pack(side="right", padx=(8, 0))

        # Analyse button
        btn_frame = tk.Frame(inner, bg=COLORS["bg_surface"])
        btn_frame.pack(fill="x", pady=(10, 0))

        self.analyse_btn = tk.Button(
            btn_frame, text="⚡  Analyse STEP File", font=FONT_BOLD,
            bg=COLORS["accent"], fg=COLORS["bg_primary"],
            activebackground=COLORS["accent_hover"],
            activeforeground=COLORS["bg_primary"],
            relief="flat", padx=20, pady=8, cursor="hand2",
            command=self._run_analysis
        )
        self.analyse_btn.pack(side="left")

        self.status_label = tk.Label(
            btn_frame, text="No file loaded", font=FONT_SMALL,
            fg=COLORS["text_muted"], bg=COLORS["bg_surface"]
        )
        self.status_label.pack(side="left", padx=(12, 0))

    def _build_analysis_results(self, parent):
        """Build the geometry analysis results panel."""
        SectionHeader(parent, "Geometry Analysis", icon="📐").pack(fill="x")

        # Metrics grid (2×3)
        self.metrics_frame = tk.Frame(parent, bg=COLORS["bg_primary"])
        self.metrics_frame.pack(fill="x", pady=(0, 4))

        # Row 1
        row1 = tk.Frame(self.metrics_frame, bg=COLORS["bg_primary"])
        row1.pack(fill="x", pady=(0, 4))

        self.card_volume = MetricCard(row1, "Volume", unit="mm³")
        self.card_volume.pack(side="left", fill="x", expand=True, padx=(0, 4))

        self.card_surface = MetricCard(row1, "Surface Area", unit="mm²")
        self.card_surface.pack(side="left", fill="x", expand=True, padx=(0, 4))

        self.card_bbox = MetricCard(row1, "Bounding Box")
        self.card_bbox.pack(side="left", fill="x", expand=True)

        # Row 2
        row2 = tk.Frame(self.metrics_frame, bg=COLORS["bg_primary"])
        row2.pack(fill="x", pady=(0, 4))

        self.card_removal = MetricCard(row2, "Material Removal", accent=True)
        self.card_removal.pack(side="left", fill="x", expand=True, padx=(0, 4))

        self.card_complexity = MetricCard(row2, "Complexity Score", accent=True)
        self.card_complexity.pack(side="left", fill="x", expand=True, padx=(0, 4))

        self.card_watertight = MetricCard(row2, "Watertight")
        self.card_watertight.pack(side="left", fill="x", expand=True)

        # Topology breakdown
        SectionHeader(parent, "Topology Breakdown", icon="🔷").pack(fill="x")

        topo_frame = tk.Frame(parent, bg=COLORS["bg_surface"],
                              highlightthickness=1,
                              highlightbackground=COLORS["border"])
        topo_frame.pack(fill="x")

        topo_inner = tk.Frame(topo_frame, bg=COLORS["bg_surface"], padx=14, pady=10)
        topo_inner.pack(fill="x")

        # Face breakdown
        face_header = tk.Label(
            topo_inner, text="FACES", font=FONT_TINY,
            fg=COLORS["accent"], bg=COLORS["bg_surface"], anchor="w"
        )
        face_header.pack(fill="x")

        self.face_rows = {}
        for face_type in ["Planar", "Cylindrical", "Conical", "Spherical",
                          "Toroidal", "BSpline", "Other"]:
            row = BreakdownRow(topo_inner, f"  {face_type}", "—")
            row.pack(fill="x", pady=1)
            self.face_rows[face_type.lower()] = row

        # Separator
        tk.Frame(topo_inner, bg=COLORS["border"], height=1).pack(fill="x", pady=6)

        # Edge breakdown
        edge_header = tk.Label(
            topo_inner, text="EDGES", font=FONT_TINY,
            fg=COLORS["accent"], bg=COLORS["bg_surface"], anchor="w"
        )
        edge_header.pack(fill="x")

        self.edge_rows = {}
        for edge_type in ["Lines", "Arcs", "BSplines", "Other"]:
            row = BreakdownRow(topo_inner, f"  {edge_type}", "—")
            row.pack(fill="x", pady=1)
            self.edge_rows[edge_type.lower()] = row

        # Separator
        tk.Frame(topo_inner, bg=COLORS["border"], height=1).pack(fill="x", pady=6)

        # Summary row
        self.row_total_faces = BreakdownRow(topo_inner, "Total Faces", "—", bold=True)
        self.row_total_faces.pack(fill="x", pady=1)

        self.row_total_edges = BreakdownRow(topo_inner, "Total Edges", "—", bold=True)
        self.row_total_edges.pack(fill="x", pady=1)

        self.row_solids = BreakdownRow(topo_inner, "Solids", "—", bold=True)
        self.row_solids.pack(fill="x", pady=1)

        self.row_perimeter = BreakdownRow(topo_inner, "Est. Total Edge Length", "—", bold=True, accent=True)
        self.row_perimeter.pack(fill="x", pady=1)

    def _build_pricing_panel(self, parent):
        """Build the CNC pricing estimation panel."""
        SectionHeader(parent, "CNC Cost Estimate", icon="💰").pack(fill="x")

        pricing_frame = tk.Frame(parent, bg=COLORS["bg_surface"],
                                 highlightthickness=1,
                                 highlightbackground=COLORS["border"])
        pricing_frame.pack(fill="x")

        pricing_inner = tk.Frame(pricing_frame, bg=COLORS["bg_surface"],
                                  padx=14, pady=12)
        pricing_inner.pack(fill="x")

        # Material selector
        mat_label = tk.Label(
            pricing_inner, text="MATERIAL", font=FONT_TINY,
            fg=COLORS["text_muted"], bg=COLORS["bg_surface"], anchor="w"
        )
        mat_label.pack(fill="x")

        self.material_var = tk.StringVar(value="Aluminium 6082-T6")
        material_combo = ttk.Combobox(
            pricing_inner, textvariable=self.material_var,
            values=list(CNCEstimateConfig.densities.keys()),
            state="readonly", style="Dark.TCombobox",
            font=FONT_SMALL
        )
        material_combo.pack(fill="x", pady=(4, 8))
        material_combo.bind("<<ComboboxSelected>>", lambda e: self._update_pricing())

        # Quantity
        qty_label = tk.Label(
            pricing_inner, text="QUANTITY", font=FONT_TINY,
            fg=COLORS["text_muted"], bg=COLORS["bg_surface"], anchor="w"
        )
        qty_label.pack(fill="x")

        self.qty_var = tk.StringVar(value="1")
        qty_entry = tk.Entry(
            pricing_inner, textvariable=self.qty_var,
            font=FONT_MONO_SMALL, bg=COLORS["bg_input"],
            fg=COLORS["text_primary"], insertbackground=COLORS["accent"],
            relief="flat", highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        qty_entry.pack(fill="x", ipady=4, pady=(4, 8))
        qty_entry.bind("<KeyRelease>", lambda e: self._update_pricing())

        # Recalculate button
        recalc_btn = tk.Button(
            pricing_inner, text="🔄  Recalculate", font=FONT_BOLD,
            bg=COLORS["bg_elevated"], fg=COLORS["text_primary"],
            activebackground=COLORS["accent_dim"],
            relief="flat", padx=16, pady=6, cursor="hand2",
            command=self._update_pricing
        )
        recalc_btn.pack(fill="x", pady=(0, 8))

        # Separator
        tk.Frame(pricing_inner, bg=COLORS["border"], height=1).pack(fill="x", pady=6)

        # Cost breakdown
        cost_header = tk.Label(
            pricing_inner, text="COST BREAKDOWN", font=FONT_TINY,
            fg=COLORS["accent"], bg=COLORS["bg_surface"], anchor="w"
        )
        cost_header.pack(fill="x", pady=(0, 6))

        self.cost_rows = {}
        for cost_key, label in [
            ("part_mass", "Part Mass"),
            ("stock_mass", "Stock Mass"),
            ("material_cost", "Material Cost"),
            ("machining_cost", "Machining Cost"),
            ("finishing_cost", "Surface Finishing"),
            ("setup_cost", "Setup Cost"),
        ]:
            row = BreakdownRow(pricing_inner, label, "—")
            row.pack(fill="x", pady=1)
            self.cost_rows[cost_key] = row

        # Total divider
        tk.Frame(pricing_inner, bg=COLORS["accent_dim"], height=2).pack(fill="x", pady=(8, 4))

        self.row_unit_total = BreakdownRow(
            pricing_inner, "Unit Price", "—", bold=True, accent=True
        )
        self.row_unit_total.pack(fill="x", pady=2)

        self.row_batch_total = BreakdownRow(
            pricing_inner, "Batch Total", "—", bold=True, accent=True
        )
        self.row_batch_total.pack(fill="x", pady=2)

        # ─── Editable Rates Section ───
        SectionHeader(parent, "Rate Settings", icon="⚙").pack(fill="x")

        rates_frame = tk.Frame(parent, bg=COLORS["bg_surface"],
                               highlightthickness=1,
                               highlightbackground=COLORS["border"])
        rates_frame.pack(fill="x")

        rates_inner = tk.Frame(rates_frame, bg=COLORS["bg_surface"],
                                padx=14, pady=10)
        rates_inner.pack(fill="x")

        self.rate_vars = {}
        rate_fields = [
            ("removal_rate", "Removal Rate (£/mm³)", "0.005"),
            ("setup_cost", "Setup Cost (£)", "25.00"),
            ("finishing_rate", "Finishing Rate (£/mm²)", "0.002"),
        ]

        for key, label, default in rate_fields:
            row_frame = tk.Frame(rates_inner, bg=COLORS["bg_surface"])
            row_frame.pack(fill="x", pady=2)

            tk.Label(
                row_frame, text=label, font=FONT_SMALL,
                fg=COLORS["text_muted"], bg=COLORS["bg_surface"],
                anchor="w"
            ).pack(side="left")

            var = tk.StringVar(value=default)
            entry = tk.Entry(
                row_frame, textvariable=var, font=FONT_MONO_SMALL,
                bg=COLORS["bg_input"], fg=COLORS["text_primary"],
                insertbackground=COLORS["accent"],
                relief="flat", width=10, justify="right",
                highlightthickness=1,
                highlightbackground=COLORS["border"],
                highlightcolor=COLORS["accent"]
            )
            entry.pack(side="right", ipady=3)
            entry.bind("<KeyRelease>", lambda e: self._update_pricing())
            self.rate_vars[key] = var

        # ─── Export ───
        SectionHeader(parent, "Export", icon="📋").pack(fill="x")

        export_frame = tk.Frame(parent, bg=COLORS["bg_primary"])
        export_frame.pack(fill="x")

        copy_btn = tk.Button(
            export_frame, text="📋  Copy Report to Clipboard", font=FONT_BOLD,
            bg=COLORS["bg_elevated"], fg=COLORS["text_primary"],
            activebackground=COLORS["accent_dim"],
            relief="flat", padx=16, pady=8, cursor="hand2",
            command=self._copy_report
        )
        copy_btn.pack(fill="x")

    # ─── Actions ───

    def _browse_file(self):
        path = filedialog.askopenfilename(
            title="Select STEP File",
            filetypes=[
                ("STEP Files", "*.step *.stp"),
                ("All Files", "*.*"),
            ]
        )
        if path:
            self.file_path_var.set(path)

    def _run_analysis(self):
        filepath = self.file_path_var.get().strip()
        if not filepath:
            messagebox.showwarning("No File", "Please select a STEP file first.")
            return

        if not os.path.isfile(filepath):
            messagebox.showerror("File Not Found", f"Cannot find:\n{filepath}")
            return

        ext = os.path.splitext(filepath)[1].lower()
        if ext not in (".step", ".stp"):
            messagebox.showerror("Invalid File",
                                  "Only .step and .stp files are supported.")
            return

        # Disable button and show status
        self.analyse_btn.configure(state="disabled", text="⏳  Analysing...")
        self.status_label.configure(text="Processing...", fg=COLORS["warning"])
        self.root.update_idletasks()

        # Run analysis in a thread to keep UI responsive
        def do_analysis():
            analysis = analyse_step_file(filepath)
            self.root.after(0, lambda: self._display_results(analysis))

        thread = threading.Thread(target=do_analysis, daemon=True)
        thread.start()

    def _display_results(self, analysis: GeometryAnalysis):
        """Update all UI elements with analysis results."""
        self.current_analysis = analysis

        # Re-enable button
        self.analyse_btn.configure(state="normal", text="⚡  Analyse STEP File")

        if analysis.error:
            self.status_label.configure(
                text=f"Error: {analysis.error}", fg=COLORS["error"]
            )
            return

        # Status
        self.status_label.configure(
            text=f"✓ {analysis.filename} — {analysis.processing_time_ms:.0f}ms",
            fg=COLORS["success"]
        )

        # Metric cards
        self.card_volume.set_value(f"{analysis.volume_mm3:,.1f}")
        self.card_surface.set_value(f"{analysis.surface_area_mm2:,.1f}")

        bb = analysis.bounding_box
        self.card_bbox.set_value(
            f"{bb.x_mm:.1f} × {bb.y_mm:.1f} × {bb.z_mm:.1f}"
        )

        removal_pct = analysis.material_removal_ratio * 100
        removal_color = (COLORS["success"] if removal_pct < 50
                         else COLORS["warning"] if removal_pct < 75
                         else COLORS["error"])
        self.card_removal.set_value(f"{removal_pct:.1f}%", color=removal_color)

        complexity_color = (COLORS["success"] if analysis.complexity_score < 30
                            else COLORS["warning"] if analysis.complexity_score < 60
                            else COLORS["error"])
        self.card_complexity.set_value(
            f"{analysis.complexity_score:.0f}/100", color=complexity_color
        )

        watertight_text = "Yes ✓" if analysis.is_watertight else "No ✗"
        watertight_color = COLORS["success"] if analysis.is_watertight else COLORS["error"]
        self.card_watertight.set_value(watertight_text, color=watertight_color)

        # Face breakdown
        fb = analysis.face_breakdown
        face_map = {
            "planar": fb.planar, "cylindrical": fb.cylindrical,
            "conical": fb.conical, "spherical": fb.spherical,
            "toroidal": fb.toroidal, "bspline": fb.bspline,
            "other": fb.other,
        }
        for key, val in face_map.items():
            self.face_rows[key].set_value(str(val))

        # Edge breakdown
        eb = analysis.edge_breakdown
        edge_map = {
            "lines": eb.lines, "arcs": eb.arcs,
            "bsplines": eb.bsplines, "other": eb.other,
        }
        for key, val in edge_map.items():
            self.edge_rows[key].set_value(str(val))

        # Totals
        self.row_total_faces.set_value(str(fb.total))
        self.row_total_edges.set_value(str(eb.total))
        self.row_solids.set_value(str(analysis.solid_count))
        self.row_perimeter.set_value(f"{analysis.estimated_perimeter_mm:,.1f} mm")

        # Auto-update pricing
        self._update_pricing()

    def _update_pricing(self):
        """Recalculate CNC cost estimate from current analysis + settings."""
        analysis = self.current_analysis
        if not analysis or analysis.error:
            return

        material = self.material_var.get()
        try:
            qty = max(1, int(self.qty_var.get()))
        except (ValueError, TypeError):
            qty = 1

        # Get rates from editable fields
        try:
            removal_rate = float(self.rate_vars["removal_rate"].get())
        except (ValueError, TypeError):
            removal_rate = 0.005

        try:
            setup_cost = float(self.rate_vars["setup_cost"].get())
        except (ValueError, TypeError):
            setup_cost = 25.0

        try:
            finishing_rate = float(self.rate_vars["finishing_rate"].get())
        except (ValueError, TypeError):
            finishing_rate = 0.002

        config = self.cnc_config
        density = config.densities.get(material, 2.71e-6)
        mat_price = config.material_prices.get(material, 8.50)

        # Calculations
        part_mass_kg = analysis.volume_mm3 * density
        stock_mass_kg = analysis.stock_volume_mm3 * density
        material_cost = stock_mass_kg * mat_price
        removal_volume = analysis.stock_volume_mm3 - analysis.volume_mm3
        machining_cost = removal_volume * removal_rate
        finishing_cost = analysis.surface_area_mm2 * finishing_rate
        unit_total = material_cost + machining_cost + finishing_cost + setup_cost
        batch_total = unit_total * qty

        # Update UI
        self.cost_rows["part_mass"].set_value(f"{part_mass_kg * 1000:.1f} g")
        self.cost_rows["stock_mass"].set_value(f"{stock_mass_kg * 1000:.1f} g")
        self.cost_rows["material_cost"].set_value(f"£{material_cost:.2f}")
        self.cost_rows["machining_cost"].set_value(f"£{machining_cost:.2f}")
        self.cost_rows["finishing_cost"].set_value(f"£{finishing_cost:.2f}")
        self.cost_rows["setup_cost"].set_value(f"£{setup_cost:.2f}")
        self.row_unit_total.set_value(f"£{unit_total:.2f}")
        self.row_batch_total.set_value(f"£{batch_total:.2f}  (×{qty})")

    def _copy_report(self):
        """Copy a formatted text report to clipboard."""
        analysis = self.current_analysis
        if not analysis:
            messagebox.showinfo("No Data", "Run an analysis first.")
            return

        bb = analysis.bounding_box
        fb = analysis.face_breakdown
        eb = analysis.edge_breakdown

        lines = [
            f"SPEEDCUT GEOMETRY ANALYSIS REPORT",
            f"{'=' * 50}",
            f"File: {analysis.filename}",
            f"Processing Time: {analysis.processing_time_ms:.0f}ms",
            f"",
            f"CORE METRICS",
            f"{'─' * 30}",
            f"  Volume:            {analysis.volume_mm3:,.2f} mm³",
            f"  Surface Area:      {analysis.surface_area_mm2:,.2f} mm²",
            f"  Bounding Box:      {bb.x_mm:.1f} × {bb.y_mm:.1f} × {bb.z_mm:.1f} mm",
            f"  Stock Volume:      {analysis.stock_volume_mm3:,.2f} mm³",
            f"  Material Removal:  {analysis.material_removal_ratio * 100:.1f}%",
            f"  Complexity Score:  {analysis.complexity_score:.0f}/100",
            f"  Watertight:        {'Yes' if analysis.is_watertight else 'No'}",
            f"",
            f"TOPOLOGY",
            f"{'─' * 30}",
            f"  Faces: {fb.total} (Planar: {fb.planar}, Cylindrical: {fb.cylindrical}, "
            f"Conical: {fb.conical}, Spherical: {fb.spherical}, "
            f"Toroidal: {fb.toroidal}, BSpline: {fb.bspline}, Other: {fb.other})",
            f"  Edges: {eb.total} (Lines: {eb.lines}, Arcs: {eb.arcs}, "
            f"BSplines: {eb.bsplines}, Other: {eb.other})",
            f"  Solids: {analysis.solid_count}",
            f"  Est. Total Edge Length: {analysis.estimated_perimeter_mm:,.1f} mm",
        ]

        # Add pricing if available
        material = self.material_var.get()
        try:
            qty = max(1, int(self.qty_var.get()))
        except (ValueError, TypeError):
            qty = 1

        config = self.cnc_config
        density = config.densities.get(material, 2.71e-6)
        mat_price = config.material_prices.get(material, 8.50)

        try:
            removal_rate = float(self.rate_vars["removal_rate"].get())
            setup_cost = float(self.rate_vars["setup_cost"].get())
            finishing_rate = float(self.rate_vars["finishing_rate"].get())
        except (ValueError, TypeError):
            removal_rate, setup_cost, finishing_rate = 0.005, 25.0, 0.002

        part_mass_kg = analysis.volume_mm3 * density
        stock_mass_kg = analysis.stock_volume_mm3 * density
        material_cost = stock_mass_kg * mat_price
        removal_volume = analysis.stock_volume_mm3 - analysis.volume_mm3
        machining_cost = removal_volume * removal_rate
        finishing_cost = analysis.surface_area_mm2 * finishing_rate
        unit_total = material_cost + machining_cost + finishing_cost + setup_cost
        batch_total = unit_total * qty

        lines.extend([
            f"",
            f"CNC COST ESTIMATE ({material})",
            f"{'─' * 30}",
            f"  Part Mass:         {part_mass_kg * 1000:.1f} g",
            f"  Material Cost:     £{material_cost:.2f}",
            f"  Machining Cost:    £{machining_cost:.2f}",
            f"  Surface Finishing: £{finishing_cost:.2f}",
            f"  Setup Cost:        £{setup_cost:.2f}",
            f"  ────────────────────────",
            f"  Unit Price:        £{unit_total:.2f}",
            f"  Batch Total (×{qty}): £{batch_total:.2f}",
        ])

        report = "\n".join(lines)
        self.root.clipboard_clear()
        self.root.clipboard_append(report)
        self.status_label.configure(
            text="✓ Report copied to clipboard", fg=COLORS["success"]
        )

    def run(self):
        self.root.mainloop()


# ─── Entry Point ───

if __name__ == "__main__":
    app = SpeedcutDesktopApp()
    app.run()
