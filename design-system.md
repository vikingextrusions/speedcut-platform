# Speedcut Platform — Design System

> **Source**: Extracted from the Speedcut_App (`~/Desktop/Speedcut_App`)
> **Framework**: Tailwind CSS v4 (CSS-first config)
> **Fonts**: Geist Sans + Geist Mono (via `next/font/google`)
> **Theme Engine**: `next-themes` (class-based, defaults to dark)

---

## Color Tokens

All colors are defined as CSS custom properties in `packages/config/tailwind/globals.css`.

### Dark Mode (Default)

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0f172a` | Page backgrounds |
| `--bg-surface` | `#1e293b` | Sidebar, elevated panels |
| `--bg-elevated` | `#334155` | Hovered surfaces, dropdowns |
| `--text-primary` | `#f8fafc` | Headings, body text |
| `--text-secondary` | `#cbd5e1` | Secondary descriptions |
| `--text-muted` | `#94a3b8` | Labels, placeholders |
| `--accent` | `#00d9e1` | Primary brand color (Teal/Cyan) |
| `--accent-hover` | `#00f0f9` | Accent on hover |
| `--border` | `rgba(255,255,255,0.1)` | Subtle dividers |
| `--border-strong` | `rgba(255,255,255,0.2)` | Emphasized dividers |
| `--glass-bg` | `rgba(30,41,59,0.7)` | Card backgrounds |
| `--glass-border` | `rgba(255,255,255,0.1)` | Card borders |

### Light Mode

| Token | Value | Notes |
|---|---|---|
| `--bg-primary` | `#ffffff` | |
| `--bg-surface` | `#f8fafc` | |
| `--accent` | `#008fa0` | Darker teal for contrast |
| `--text-primary` | `#0f172a` | |
| `--text-muted` | `#64748b` | |

### Semantic Colors

| Token | Value | Usage |
|---|---|---|
| `--success` | `#10b981` | Accepted, complete |
| `--warning` | `#f59e0b` | Pending, requires action |
| `--error` | `#ef4444` | Rejected, deleted |

---

## Typography

| Style | Class | Properties |
|---|---|---|
| Page Title | `.page-title` | `text-3xl font-bold tracking-tight` |
| Section Title | `.section-title` | `text-lg font-bold` + bottom border |
| Micro Label | `.micro-label` | `text-[10px] font-bold uppercase tracking-widest` |
| Label | `.label` | `text-sm font-semibold uppercase tracking-wider` |

---

## Spacing

Follows Tailwind's default spacing scale. Key patterns from the existing app:

- **Page padding**: `p-8 lg:p-12`
- **Card padding**: `p-6` (default)
- **Section gaps**: `space-y-6` to `space-y-10`
- **Form field gaps**: `gap-6`
- **Max content width**: `max-w-[1600px]`

---

## Component Patterns

### Buttons

| Variant | Class | Description |
|---|---|---|
| Primary | `.btn-primary` | Accent bg, white text, glow shadow |
| Secondary | `.btn-secondary` | Surface bg, bordered |
| Outline | `.btn-outline` | Transparent bg, accent border → fills on hover |
| Destructive | `.btn-destructive` | Red tinted, fills red on hover |
| Ghost | `.btn-ghost` | Transparent, shows on hover |

### Cards

- `.card` — Glassmorphism: `backdrop-blur-md`, semi-transparent bg, subtle border, `rounded-2xl`
- `.card-hover` — Adds accent border + shadow on hover

### Inputs

- `.input-field` — Full-width, bg-primary bg, rounded-lg, accent ring on focus

### Badges

- `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`, `.badge-accent`
- Pattern: `bg-{color}/10 text-{color} border border-{color}/20`

---

## Layout

### SharedShell

The `SharedShell` component in `packages/ui` provides a consistent sidebar+content layout across all three portals:

- **Collapsible sidebar** with persisted state (localStorage)
- **Mobile responsive** with backdrop overlay
- **Per-portal accent colors**: web (teal), partner (purple), admin (amber)
- **Section-grouped navigation** with active state highlighting
- **Footer** with theme toggle, settings, and sign-out

---

## File Locations

- **Shared tokens**: `packages/config/tailwind/globals.css`
- **UI components**: `packages/ui/src/`
- **TypeScript configs**: `packages/config/tsconfig/`
- **Design preview**: `apps/web/src/app/design-system/page.tsx`
