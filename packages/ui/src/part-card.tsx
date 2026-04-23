'use client'

import React, { lazy, Suspense, useState, useEffect } from 'react'
import { Trash2, Cpu, Printer, Layers, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, Sparkles, Maximize2 } from 'lucide-react'
import type { GeometryResult, UploadPhase } from './file-dropzone'
import { GeometryCard } from './geometry-card'

const ModelViewer = lazy(() => import('./model-viewer').then(m => ({ default: m.ModelViewer })))
const ModelViewerModal = lazy(() => import('./model-viewer').then(m => ({ default: m.ModelViewerModal })))

// ─── Types ───

export type ServiceType = 'cnc' | '3d-printing' | 'sheet-metal'

export interface PartData {
  id: string
  file: File
  filename: string
  service: ServiceType
  description: string
  quantity: number
  // Upload state
  uploadPhase: UploadPhase
  uploadProgress: number
  uploadError?: string
  // Result from backend
  fileId?: string
  geometryResultId?: string
  geometryResult?: GeometryResult
  // Config
  cncMaterial: string
  cncFinish: string
  cncTolerance: string
  printTechnology: string
  printMaterial: string
  printPurpose: string
  sheetMaterial: string
  sheetThickness: string
  sheetProcesses: string[]
  sheetFinish: string
  notes: string
}

export function createPartFromFile(file: File): PartData {
  const name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
  return {
    id: crypto.randomUUID(),
    file,
    filename: file.name,
    service: 'cnc',
    description: name,
    quantity: 1,
    uploadPhase: 'idle',
    uploadProgress: 0,
    cncMaterial: '', cncFinish: '', cncTolerance: '',
    printTechnology: '', printMaterial: '', printPurpose: '',
    sheetMaterial: '', sheetThickness: '', sheetProcesses: [], sheetFinish: '',
    notes: '',
  }
}

// ─── Service Config ───

export const serviceConfig: Record<ServiceType, { label: string; color: string; icon: React.ReactNode }> = {
  'cnc': { label: 'CNC Machining', color: '#00d9e1', icon: <Cpu size={14} /> },
  '3d-printing': { label: '3D Printing', color: '#a855f7', icon: <Printer size={14} /> },
  'sheet-metal': { label: 'Sheet Metal', color: '#f59e0b', icon: <Layers size={14} /> },
}

const PROCESS_MAP: Record<string, ServiceType> = {
  'CNC': 'cnc', 'SHEET_METAL': 'sheet-metal', '3DP': '3d-printing',
}

// ─── Material options ───
const cncMaterials = ['Aluminium 6082-T6','Aluminium 6061-T6','Aluminium 7075','Mild Steel','Stainless Steel 304','Stainless Steel 316','Brass','Copper','Titanium Grade 5','Acetal (Delrin)','Nylon 6','PEEK','PTFE','Polycarbonate']
const cncFinishes = ['As Machined','Anodised - Clear','Anodised - Black','Anodised - Colour','Bead Blasted','Brushed','Polished','Powder Coated','Zinc Plated','Nickel Plated','Chrome Plated','Passivated','Black Oxide','None / Raw']
const cncTolerances = ['Standard (ISO 2768-m)','Fine (ISO 2768-f)','Very Fine (ISO 2768-c)','Custom (specify in notes)']
const printTechnologies = ['FDM (Fused Deposition Modelling)','SLA (Stereolithography)','SLS (Selective Laser Sintering)','MJF (Multi Jet Fusion)','PolyJet','DMLS (Metal 3D Printing)','Not sure — recommend for me']
const printMaterialsByTech: Record<string, string[]> = {
  'FDM (Fused Deposition Modelling)': ['PLA','PETG','ABS','ASA','Nylon','TPU','PC (Polycarbonate)','Carbon Fibre Nylon'],
  'SLA (Stereolithography)': ['Standard Resin','Tough Resin','Flexible Resin','High Temp Resin','Castable Resin','Dental Resin'],
  'SLS (Selective Laser Sintering)': ['Nylon PA12','Nylon PA11','Glass-filled Nylon','TPU','Alumide'],
  'MJF (Multi Jet Fusion)': ['Nylon PA12','Nylon PA11','Glass-filled PA12','TPU'],
  'PolyJet': ['Rigid Opaque','Rigid Transparent','Rubber-like','Multi-material'],
  'DMLS (Metal 3D Printing)': ['Stainless Steel 316L','Aluminium AlSi10Mg','Titanium Ti64','Inconel 718','Maraging Steel'],
}
const printPurposes = ['Prototype / Concept Model','Functional Prototype','End-Use Part','Jig / Fixture / Tooling','Visual / Display Model']
const sheetMaterials = ['Mild Steel (S275)','Mild Steel (S355)','Stainless Steel 304','Stainless Steel 316','Aluminium 1050','Aluminium 5083','Aluminium 6082','Galvanised Steel','Zintec','Copper','Brass','Corten Steel']
const sheetThicknesses = ['0.5mm','0.7mm','0.8mm','1.0mm','1.2mm','1.5mm','2.0mm','2.5mm','3.0mm','4.0mm','5.0mm','6.0mm','8.0mm','10.0mm','12.0mm','15.0mm','20.0mm','25.0mm']
const sheetFinishes = ['None / Raw','Powder Coated','Galvanised','Zinc Plated','Anodised','Brushed / Linished','Polished','Painted','Passivated']
const sheetProcesses = ['Laser Cutting','CNC Bending / Folding','Punching','Welding (MIG)','Welding (TIG)','Spot Welding','Countersinking','Tapping','Hardware Insertion','Deburring']

// ─── Helpers ───

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label className="micro-label">{label}</label>
      <select className="input-field" value={value} onChange={e => onChange(e.target.value)} style={{ fontSize: '0.78rem' }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ─── Viewer Wrapper (handles mount timing) ───

function ViewerPanel({ meshUrl, boundingBox, serviceColor, onFullscreen }: {
  meshUrl: string
  boundingBox?: { x_mm: number; y_mm: number; z_mm: number }
  serviceColor: string
  onFullscreen: () => void
}) {
  // Delay mount slightly to ensure DOM is ready after state transition
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!mounted) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.7rem' }}>
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.7rem' }}>
        Loading viewer...
      </div>
    }>
      <ModelViewer
        meshUrl={meshUrl}
        boundingBox={boundingBox}
        height={220}
        serviceColor={serviceColor}
        showToolbar
        onFullscreen={onFullscreen}
      />
    </Suspense>
  )
}

// ─── Part Card Component ───

interface PartCardProps {
  part: PartData
  index: number
  onChange: (id: string, updates: Partial<PartData>) => void
  onDelete: (id: string) => void
}

export function PartCard({ part, index, onChange, onDelete }: PartCardProps) {
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const svc = serviceConfig[part.service]
  const update = (u: Partial<PartData>) => onChange(part.id, u)
  const gr = part.geometryResult
  const meshUrl = gr?.mesh_url ? `/api/geometry${gr.mesh_url}` : null
  const isReady = part.uploadPhase === 'complete' && !!gr
  const isProcessing = part.uploadPhase === 'uploading' || part.uploadPhase === 'analysing'
  const hasRecommendation = gr?.recommended_process && gr.process_confidence

  const aiService = gr?.recommended_process ? PROCESS_MAP[gr.recommended_process] : null
  const aiConfidence = gr?.process_confidence ? Math.round(gr.process_confidence * 100) : 0

  const toggleSheetProcess = (process: string) => {
    const next = part.sheetProcesses.includes(process)
      ? part.sheetProcesses.filter(p => p !== process)
      : [...part.sheetProcesses, process]
    update({ sheetProcesses: next })
  }

  return (
    <>
      <div style={{
        borderRadius: '0.75rem',
        border: `1px solid ${svc.color}30`,
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        animation: 'fade-in 0.4s ease-out',
      }}>
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: `${svc.color}06`,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 5,
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            backgroundColor: `${svc.color}15`, color: svc.color, border: `1px solid ${svc.color}25`,
          }}>
            {svc.icon} {svc.label}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Part {index + 1}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            — {part.filename}
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {isProcessing && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: '#f59e0b' }}>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                {part.uploadPhase === 'uploading' ? 'Uploading...' : 'Analysing...'}
              </span>
            )}
            {isReady && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: '#10b981' }}>
                <CheckCircle2 size={12} /> Ready
              </span>
            )}
            {part.uploadPhase === 'error' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: '#ef4444' }}>
                <AlertCircle size={12} /> {part.uploadError || 'Error'}
              </span>
            )}
            <button type="button" onClick={() => onDelete(part.id)} style={{
              background: 'none', border: 'none', padding: 4, cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', transition: 'color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isReady && meshUrl ? '280px 1fr' : '1fr',
          minHeight: isProcessing ? 120 : 0,
        }}>
          {/* Left: 3D Viewer (compact, fixed width) */}
          {isReady && meshUrl && (
            <div style={{ borderRight: '1px solid var(--border)', position: 'relative', minHeight: 220 }}>
              <ViewerPanel
                key={meshUrl}
                meshUrl={meshUrl}
                boundingBox={gr?.bounding_box}
                serviceColor={svc.color}
                onFullscreen={() => setShowFullscreen(true)}
              />
            </div>
          )}

          {/* Right: Configuration */}
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {/* Upload progress */}
            {isProcessing && (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: svc.color, margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {part.uploadPhase === 'uploading' ? 'Uploading file...' : 'Analysing geometry...'}
                </p>
                {part.uploadProgress > 0 && (
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, maxWidth: 180, margin: '8px auto 0' }}>
                    <div style={{ height: '100%', width: `${part.uploadProgress}%`, background: svc.color, borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                )}
              </div>
            )}

            {/* AI Recommendation */}
            {isReady && hasRecommendation && aiService && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px', borderRadius: 6,
                backgroundColor: `${serviceConfig[aiService].color}10`,
                border: `1px solid ${serviceConfig[aiService].color}20`,
                fontSize: '0.68rem',
              }}>
                <Sparkles size={11} color={serviceConfig[aiService].color} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  AI: <strong style={{ color: serviceConfig[aiService].color }}>{serviceConfig[aiService].label}</strong>
                  <span style={{ opacity: 0.6, marginLeft: 4 }}>({aiConfidence}%)</span>
                </span>
                {part.service !== aiService && (
                  <button type="button" onClick={() => update({ service: aiService })} style={{
                    marginLeft: 'auto', padding: '2px 8px', borderRadius: 4,
                    border: `1px solid ${serviceConfig[aiService].color}30`,
                    background: 'none', color: serviceConfig[aiService].color,
                    fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer',
                  }}>Apply</button>
                )}
              </div>
            )}

            {/* Config fields */}
            {(isReady || part.uploadPhase === 'idle') && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px', gap: '0.5rem' }}>
                  <SelectField label="Process" value={part.service} onChange={v => update({ service: v as ServiceType })}
                    options={['cnc', '3d-printing', 'sheet-metal']} placeholder="" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label className="micro-label">Description</label>
                    <input className="input-field" value={part.description} onChange={e => update({ description: e.target.value })}
                      style={{ fontSize: '0.78rem' }} placeholder="Part name..." />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label className="micro-label">Qty</label>
                    <input type="number" min={1} className="input-field" value={part.quantity}
                      onChange={e => update({ quantity: parseInt(e.target.value) || 1 })} style={{ fontSize: '0.78rem' }} />
                  </div>
                </div>

                {/* Service-specific fields */}
                {part.service === 'cnc' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <SelectField label="Material" value={part.cncMaterial} onChange={v => update({ cncMaterial: v })} options={cncMaterials} placeholder="Select..." />
                    <SelectField label="Finish" value={part.cncFinish} onChange={v => update({ cncFinish: v })} options={cncFinishes} placeholder="Select..." />
                    <SelectField label="Tolerance" value={part.cncTolerance} onChange={v => update({ cncTolerance: v })} options={cncTolerances} />
                  </div>
                )}
                {part.service === '3d-printing' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <SelectField label="Technology" value={part.printTechnology} onChange={v => update({ printTechnology: v, printMaterial: '' })} options={printTechnologies} placeholder="Select..." />
                    <SelectField label="Material" value={part.printMaterial} onChange={v => update({ printMaterial: v })}
                      options={printMaterialsByTech[part.printTechnology] || []} placeholder={part.printTechnology ? 'Select...' : 'Choose tech first'} />
                    <SelectField label="Purpose" value={part.printPurpose} onChange={v => update({ printPurpose: v })} options={printPurposes} placeholder="Select..." />
                  </div>
                )}
                {part.service === 'sheet-metal' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <SelectField label="Material" value={part.sheetMaterial} onChange={v => update({ sheetMaterial: v })} options={sheetMaterials} placeholder="Select..." />
                      <SelectField label="Thickness" value={part.sheetThickness} onChange={v => update({ sheetThickness: v })} options={sheetThicknesses} placeholder="Select..." />
                      <SelectField label="Finish" value={part.sheetFinish} onChange={v => update({ sheetFinish: v })} options={sheetFinishes} placeholder="Select..." />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label className="micro-label">Processes</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {sheetProcesses.map(p => {
                          const sel = part.sheetProcesses.includes(p)
                          return (
                            <button key={p} type="button" onClick={() => toggleSheetProcess(p)} style={{
                              padding: '4px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600,
                              border: `1px solid ${sel ? '#f59e0b' : 'var(--border)'}`,
                              backgroundColor: sel ? 'rgba(245,158,11,0.1)' : 'transparent',
                              color: sel ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer',
                            }}>{p}</button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label className="micro-label">Notes</label>
                  <input className="input-field" value={part.notes} onChange={e => update({ notes: e.target.value })}
                    placeholder="Tolerances, special requirements..." style={{ fontSize: '0.78rem' }} />
                </div>

                {/* Analysis toggle */}
                {isReady && gr && (
                  <button type="button" onClick={() => setShowAnalysis(!showAnalysis)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', padding: '2px 0',
                    color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                    {showAnalysis ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    Geometry Analysis
                  </button>
                )}
                {showAnalysis && gr && (
                  <GeometryCard result={gr} compact />
                )}
              </>
            )}

            {/* Price placeholder */}
            {isReady && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', borderRadius: 6,
                backgroundColor: 'var(--bg-primary)',
                marginTop: 'auto',
              }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Est. Price</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pending Review</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {showFullscreen && meshUrl && (
        <Suspense fallback={null}>
          <ModelViewerModal meshUrl={meshUrl} boundingBox={gr?.bounding_box}
            serviceColor={svc.color} onClose={() => setShowFullscreen(false)} filename={part.filename}
            geometryResult={gr} />
        </Suspense>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
