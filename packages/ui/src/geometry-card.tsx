'use client'

import React, { useState, lazy, Suspense } from 'react'
import type { GeometryResult } from './file-dropzone'

// Lazy load the 3D viewer to avoid loading Three.js unless needed
const ModelViewer = lazy(() => import('./model-viewer').then(m => ({ default: m.ModelViewer })))
const ModelViewerModal = lazy(() => import('./model-viewer').then(m => ({ default: m.ModelViewerModal })))

// ─── Helpers ───

function fmt(n: number | null | undefined, decimals = 1) {
  if (n == null) return '—'
  return n.toLocaleString('en-GB', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
}

function fmtMm3(v: number) {
  if (v >= 1_000_000) return `${fmt(v / 1_000_000, 2)} cm³`
  return `${fmt(v, 0)} mm³`
}

function fmtMm2(v: number) {
  if (v >= 100) return `${fmt(v / 100, 1)} cm²`
  return `${fmt(v, 1)} mm²`
}

const PROCESS_LABEL: Record<string, string> = {
  CNC: 'CNC Machining',
  SHEET_METAL: 'Sheet Metal',
  '3DP': '3D Printing',
}

const PROCESS_COLOR: Record<string, string> = {
  CNC: '#00d9e1',
  SHEET_METAL: '#f59e0b',
  '3DP': '#a855f7',
}

// ─── Sub-components ───

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', opacity: 0.7 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  )
}

function MRRBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.round(value * 100))
  const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#10b981'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', opacity: 0.7 }}>
          Material Removal
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function ComplexityBar({ value }: { value: number }) {
  const color = value > 66 ? '#ef4444' : value > 33 ? '#f59e0b' : '#10b981'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', opacity: 0.7 }}>
          Complexity
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{fmt(value, 0)}/100</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

// ─── Loading Skeleton ───

export function GeometryCardSkeleton() {
  const pulse = {
    background: 'linear-gradient(90deg, var(--border) 25%, var(--glass-bg) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.5s infinite',
    borderRadius: 4,
  } as React.CSSProperties

  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        style={{
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--glass-bg)',
          padding: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Viewer skeleton */}
        <div style={{ ...pulse, height: 200, borderRadius: '0.375rem' }} />
        <div style={{ ...pulse, height: 12, width: '40%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div style={{ ...pulse, height: 8, width: '60%', marginBottom: 6 }} />
              <div style={{ ...pulse, height: 14, width: '80%' }} />
            </div>
          ))}
        </div>
        <div style={{ ...pulse, height: 4, borderRadius: 2 }} />
        <div style={{ ...pulse, height: 4, borderRadius: 2 }} />
      </div>
    </>
  )
}

// ─── Main Component ───

interface GeometryCardProps {
  result: GeometryResult
  compact?: boolean
  /** The base URL for the geometry service mesh endpoint. The mesh_url from the result is appended. */
  geometryServiceUrl?: string
  filename?: string
}

export function GeometryCard({
  result,
  compact = false,
  geometryServiceUrl = '',
  filename,
}: GeometryCardProps) {
  const [showFullscreen, setShowFullscreen] = useState(false)
  const bb = result.bounding_box
  const proc = result.recommended_process
  const procColor = proc ? PROCESS_COLOR[proc] ?? '#64748b' : '#64748b'
  const procLabel = proc ? PROCESS_LABEL[proc] ?? proc : null

  // Construct the full mesh URL: use /api/geometry/mesh/{jobId} proxy
  // The mesh_url from Python is "/mesh/{job_id}", we need to map that to the Next.js proxy
  const meshUrl = result.mesh_url
    ? `/api/geometry${result.mesh_url}`
    : null

  return (
    <>
      <div
        style={{
          borderRadius: '0.5rem',
          border: `1px solid ${proc ? procColor + '30' : 'var(--border)'}`,
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          padding: compact ? '0.75rem' : '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? '0.625rem' : '0.75rem',
          animation: 'fade-in 0.4s ease-out',
        }}
      >
        {/* 3D Viewer (inline preview) */}
        {meshUrl && (
          <Suspense fallback={
            <div style={{
              height: compact ? 180 : 240,
              borderRadius: '0.375rem',
              background: 'linear-gradient(180deg, #0f1724 0%, #0a0e17 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '0.7rem',
            }}>
              Loading 3D viewer...
            </div>
          }>
            <ModelViewer
              meshUrl={meshUrl}
              boundingBox={bb}
              height={compact ? 180 : 240}
              serviceColor={procColor}
              showToolbar
              onFullscreen={() => setShowFullscreen(true)}
            />
          </Suspense>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            Geometry Analysis
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {result.is_watertight !== undefined && (
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 6px',
                borderRadius: 4,
                border: `1px solid ${result.is_watertight ? '#10b98130' : '#f59e0b30'}`,
                color: result.is_watertight ? '#10b981' : '#f59e0b',
                backgroundColor: result.is_watertight ? '#10b98110' : '#f59e0b10',
              }}>
                {result.is_watertight ? '✓ Watertight' : '⚠ Open Mesh'}
              </span>
            )}
            {procLabel && (
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 6px',
                borderRadius: 4,
                border: `1px solid ${procColor}30`,
                color: procColor,
                backgroundColor: `${procColor}10`,
              }}>
                {procLabel}
                {result.process_confidence != null && ` ${Math.round(result.process_confidence * 100)}%`}
              </span>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : '1fr 1fr 1fr', gap: compact ? '0.625rem' : '0.75rem' }}>
          <MetricRow label="Volume" value={fmtMm3(result.volume_mm3)} />
          <MetricRow label="Surface Area" value={fmtMm2(result.surface_area_mm2)} />
          <MetricRow
            label="Bounding Box"
            value={`${fmt(bb.x_mm, 1)} × ${fmt(bb.y_mm, 1)} × ${fmt(bb.z_mm, 1)}`}
            sub="mm"
          />
          <MetricRow label="Faces" value={result.face_count.toString()} sub={`${result.solid_count} solid${result.solid_count !== 1 ? 's' : ''}`} />
          {result.wall_thickness_min_mm != null && (
            <MetricRow label="Min Wall" value={`${fmt(result.wall_thickness_min_mm, 2)} mm`} />
          )}
          {result.processing_time_ms != null && (
            <MetricRow label="Analysed In" value={`${fmt(result.processing_time_ms / 1000, 1)}s`} />
          )}
        </div>

        {/* Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <MRRBar value={result.material_removal_ratio} />
          {result.complexity_score != null && (
            <ComplexityBar value={result.complexity_score} />
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && meshUrl && (
        <Suspense fallback={null}>
          <ModelViewerModal
            meshUrl={meshUrl}
            boundingBox={bb}
            serviceColor={procColor}
            onClose={() => setShowFullscreen(false)}
            filename={filename}
            geometryResult={result}
          />
        </Suspense>
      )}
    </>
  )
}
