'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2, Cpu, Printer, Layers, GripVertical } from 'lucide-react'
import { FileDropzone, type FileUploadResult, type GeometryResult } from './file-dropzone'
import { GeometryCard, GeometryCardSkeleton } from './geometry-card'

/* ─── Types ─── */

export type ServiceType = 'cnc' | '3d-printing' | 'sheet-metal'

export interface QuotePartData {
  id: string
  service: ServiceType
  description: string
  quantity: number
  // CNC fields
  cncMaterial: string
  cncFinish: string
  cncTolerance: string
  // 3D Printing fields
  printTechnology: string
  printMaterial: string
  printPurpose: string
  // Sheet Metal fields
  sheetMaterial: string
  sheetThickness: string
  sheetProcesses: string[]
  sheetFinish: string
  // Common
  notes: string
  files: File[]
  // Geometry analysis
  fileId?: string
  geometryResultId?: string
  geometryResult?: GeometryResult
}

export function createEmptyPart(service: ServiceType = 'cnc'): QuotePartData {
  return {
    id: crypto.randomUUID(),
    service,
    description: '',
    quantity: 1,
    cncMaterial: '',
    cncFinish: '',
    cncTolerance: '',
    printTechnology: '',
    printMaterial: '',
    printPurpose: '',
    sheetMaterial: '',
    sheetThickness: '',
    sheetProcesses: [],
    sheetFinish: '',
    notes: '',
    files: [],
  }
}

/* ─── Service Config ─── */

export const serviceConfig: Record<ServiceType, { label: string; color: string; icon: React.ReactNode }> = {
  'cnc': { label: 'CNC Machining', color: '#00d9e1', icon: <Cpu size={16} /> },
  '3d-printing': { label: '3D Printing', color: '#a855f7', icon: <Printer size={16} /> },
  'sheet-metal': { label: 'Sheet Metal', color: '#f59e0b', icon: <Layers size={16} /> },
}

/* ─── CNC Options ─── */

const cncMaterials = [
  'Aluminium 6082-T6', 'Aluminium 6061-T6', 'Aluminium 7075',
  'Mild Steel', 'Stainless Steel 304', 'Stainless Steel 316',
  'Brass', 'Copper', 'Titanium Grade 5',
  'Acetal (Delrin)', 'Nylon 6', 'PEEK', 'PTFE', 'Polycarbonate',
]

const cncFinishes = [
  'As Machined', 'Anodised - Clear', 'Anodised - Black', 'Anodised - Colour',
  'Bead Blasted', 'Brushed', 'Polished', 'Powder Coated',
  'Zinc Plated', 'Nickel Plated', 'Chrome Plated', 'Passivated', 'Black Oxide', 'None / Raw',
]

const cncTolerances = [
  'Standard (ISO 2768-m)', 'Fine (ISO 2768-f)', 'Very Fine (ISO 2768-c)', 'Custom (specify in notes)',
]

/* ─── 3D Printing Options ─── */

const printTechnologies = [
  'FDM (Fused Deposition Modelling)', 'SLA (Stereolithography)',
  'SLS (Selective Laser Sintering)', 'MJF (Multi Jet Fusion)',
  'PolyJet', 'DMLS (Metal 3D Printing)', 'Not sure — recommend for me',
]

const printMaterialsByTech: Record<string, string[]> = {
  'FDM (Fused Deposition Modelling)': ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'TPU', 'PC (Polycarbonate)', 'Carbon Fibre Nylon'],
  'SLA (Stereolithography)': ['Standard Resin', 'Tough Resin', 'Flexible Resin', 'High Temp Resin', 'Castable Resin', 'Dental Resin'],
  'SLS (Selective Laser Sintering)': ['Nylon PA12', 'Nylon PA11', 'Glass-filled Nylon', 'TPU', 'Alumide'],
  'MJF (Multi Jet Fusion)': ['Nylon PA12', 'Nylon PA11', 'Glass-filled PA12', 'TPU'],
  'PolyJet': ['Rigid Opaque', 'Rigid Transparent', 'Rubber-like', 'Multi-material'],
  'DMLS (Metal 3D Printing)': ['Stainless Steel 316L', 'Aluminium AlSi10Mg', 'Titanium Ti64', 'Inconel 718', 'Maraging Steel'],
}

const printPurposes = [
  'Prototype / Concept Model', 'Functional Prototype', 'End-Use Part',
  'Jig / Fixture / Tooling', 'Visual / Display Model',
]

/* ─── Sheet Metal Options ─── */

const sheetMaterials = [
  'Mild Steel (S275)', 'Mild Steel (S355)', 'Stainless Steel 304', 'Stainless Steel 316',
  'Aluminium 1050', 'Aluminium 5083', 'Aluminium 6082',
  'Galvanised Steel', 'Zintec', 'Copper', 'Brass', 'Corten Steel',
]

const sheetThicknesses = [
  '0.5mm', '0.7mm', '0.8mm', '1.0mm', '1.2mm', '1.5mm',
  '2.0mm', '2.5mm', '3.0mm', '4.0mm', '5.0mm', '6.0mm',
  '8.0mm', '10.0mm', '12.0mm', '15.0mm', '20.0mm', '25.0mm',
]

const sheetProcesses = [
  'Laser Cutting', 'CNC Bending / Folding', 'Punching',
  'Welding (MIG)', 'Welding (TIG)', 'Spot Welding',
  'Countersinking', 'Tapping', 'Hardware Insertion', 'Deburring',
]

const sheetFinishes = [
  'None / Raw', 'Powder Coated', 'Galvanised', 'Zinc Plated',
  'Anodised', 'Brushed / Linished', 'Polished', 'Painted', 'Passivated',
]



/* ─── QuoteLineItem Component ─── */

interface QuoteLineItemProps {
  part: QuotePartData
  index: number
  canDelete: boolean
  onChange: (id: string, updates: Partial<QuotePartData>) => void
  onDelete: (id: string) => void
}

export function QuoteLineItem({
  part,
  index,
  canDelete,
  onChange,
  onDelete,
}: QuoteLineItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const svc = serviceConfig[part.service]

  const update = (updates: Partial<QuotePartData>) => onChange(part.id, updates)

  const handleServiceChange = (service: ServiceType) => {
    update({ service })
  }

  const toggleProcess = (process: string) => {
    const next = part.sheetProcesses.includes(process)
      ? part.sheetProcesses.filter((p) => p !== process)
      : [...part.sheetProcesses, process]
    update({ sheetProcesses: next })
  }

  return (
    <div
      style={{
        borderRadius: '0.75rem',
        border: `1px solid ${isExpanded ? svc.color + '40' : 'var(--border)'}`,
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isExpanded ? `0 0 0 1px ${svc.color}15` : 'none',
      }}
    >
      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-primary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <GripVertical size={14} style={{ color: 'var(--text-muted)', opacity: 0.4, flexShrink: 0 }} />
        
        {isExpanded
          ? <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          : <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        }

        {/* Service badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            backgroundColor: `${svc.color}18`,
            color: svc.color,
            border: `1px solid ${svc.color}30`,
            flexShrink: 0,
          }}
        >
          {svc.icon}
          {svc.label}
        </span>

        {/* Part label */}
        <span style={{ fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
          Part {index + 1}
        </span>

        {/* Description preview when collapsed */}
        {!isExpanded && part.description && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            — {part.description}
          </span>
        )}

        {/* Qty when collapsed */}
        {!isExpanded && (
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            Qty: {part.quantity}
          </span>
        )}

        {/* Delete */}
        {canDelete && (
          <span
            onClick={(e) => { e.stopPropagation(); onDelete(part.id) }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onDelete(part.id) } }}
            style={{
              marginLeft: isExpanded ? 'auto' : 8,
              padding: 6,
              borderRadius: 6,
              color: 'var(--text-muted)',
              display: 'flex',
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Trash2 size={14} />
          </span>
        )}
      </button>

      {/* ── Expanded Body ── */}
      {isExpanded && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Row 1: Service + Description + Qty */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 100px', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="micro-label">Service</label>
              <select
                className="input-field"
                value={part.service}
                onChange={(e) => handleServiceChange(e.target.value as ServiceType)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="cnc">CNC Machining</option>
                <option value="3d-printing">3D Printing</option>
                <option value="sheet-metal">Sheet Metal</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="micro-label">Description *</label>
              <input
                className="input-field"
                placeholder="Part name, key dimensions..."
                value={part.description}
                onChange={(e) => update({ description: e.target.value })}
                style={{ fontSize: '0.8rem' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="micro-label">Qty *</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={part.quantity}
                onChange={(e) => update({ quantity: parseInt(e.target.value) || 1 })}
                style={{ fontSize: '0.8rem' }}
                required
              />
            </div>
          </div>

          {/* Service-specific fields */}
          {part.service === 'cnc' && (
            <CNCFields part={part} update={update} />
          )}
          {part.service === '3d-printing' && (
            <PrintFields part={part} update={update} />
          )}
          {part.service === 'sheet-metal' && (
            <SheetMetalFields part={part} update={update} toggleProcess={toggleProcess} />
          )}

          {/* File Upload + Geometry Analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <label className="micro-label" style={{ display: 'block' }}>CAD File &amp; Geometry</label>
            {!part.geometryResult && (
              <FileDropzone
                serviceColor={svc.color}
                serviceType={part.service}
                onComplete={(uploadResult: FileUploadResult) => {
                  update({
                    fileId: uploadResult.fileId,
                    geometryResultId: uploadResult.geometryResultId,
                    geometryResult: uploadResult.result,
                    // Auto-suggest service from geometry recommendation
                  })
                }}
                onError={(error: string) => {
                  console.error('File upload error:', error)
                }}
              />
            )}
            {part.geometryResult && (
              <GeometryCard result={part.geometryResult} compact />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── CNC Fields ─── */

function CNCFields({ part, update }: { part: QuotePartData; update: (u: Partial<QuotePartData>) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label className="micro-label">Material</label>
        <select
          className="input-field"
          value={part.cncMaterial}
          onChange={(e) => update({ cncMaterial: e.target.value })}
          style={{ fontSize: '0.8rem' }}
        >
          <option value="">Select material...</option>
          {cncMaterials.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label className="micro-label">Surface Finish</label>
        <select
          className="input-field"
          value={part.cncFinish}
          onChange={(e) => update({ cncFinish: e.target.value })}
          style={{ fontSize: '0.8rem' }}
        >
          <option value="">Select finish...</option>
          {cncFinishes.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label className="micro-label">Tolerance</label>
        <select
          className="input-field"
          value={part.cncTolerance}
          onChange={(e) => update({ cncTolerance: e.target.value })}
          style={{ fontSize: '0.8rem' }}
        >
          {cncTolerances.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  )
}

/* ─── 3D Printing Fields ─── */

function PrintFields({ part, update }: { part: QuotePartData; update: (u: Partial<QuotePartData>) => void }) {
  const availableMaterials = printMaterialsByTech[part.printTechnology] || []
  const showMaterial = part.printTechnology && !part.printTechnology.includes('Not sure')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label className="micro-label">Technology</label>
        <select
          className="input-field"
          value={part.printTechnology}
          onChange={(e) => update({ printTechnology: e.target.value, printMaterial: '' })}
          style={{ fontSize: '0.8rem' }}
        >
          <option value="">Select technology...</option>
          {printTechnologies.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label className="micro-label">Material</label>
        <select
          className="input-field"
          value={part.printMaterial}
          onChange={(e) => update({ printMaterial: e.target.value })}
          disabled={!showMaterial}
          style={{ fontSize: '0.8rem', opacity: showMaterial ? 1 : 0.5 }}
        >
          <option value="">{showMaterial ? 'Select material...' : 'Select technology first'}</option>
          {availableMaterials.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label className="micro-label">Purpose</label>
        <select
          className="input-field"
          value={part.printPurpose}
          onChange={(e) => update({ printPurpose: e.target.value })}
          style={{ fontSize: '0.8rem' }}
        >
          <option value="">Select purpose...</option>
          {printPurposes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  )
}

/* ─── Sheet Metal Fields ─── */

function SheetMetalFields({ part, update, toggleProcess }: {
  part: QuotePartData
  update: (u: Partial<QuotePartData>) => void
  toggleProcess: (process: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="micro-label">Material</label>
          <select
            className="input-field"
            value={part.sheetMaterial}
            onChange={(e) => update({ sheetMaterial: e.target.value })}
            style={{ fontSize: '0.8rem' }}
          >
            <option value="">Select material...</option>
            {sheetMaterials.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="micro-label">Thickness</label>
          <select
            className="input-field"
            value={part.sheetThickness}
            onChange={(e) => update({ sheetThickness: e.target.value })}
            style={{ fontSize: '0.8rem' }}
          >
            <option value="">Select thickness...</option>
            {sheetThicknesses.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="micro-label">Finish</label>
          <select
            className="input-field"
            value={part.sheetFinish}
            onChange={(e) => update({ sheetFinish: e.target.value })}
            style={{ fontSize: '0.8rem' }}
          >
            <option value="">Select finish...</option>
            {sheetFinishes.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* Process chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label className="micro-label">Processes Required</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {sheetProcesses.map((process) => {
            const isSelected = part.sheetProcesses.includes(process)
            return (
              <button
                key={process}
                type="button"
                onClick={() => toggleProcess(process)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  border: `1px solid ${isSelected ? '#f59e0b' : 'var(--border)'}`,
                  backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  color: isSelected ? '#f59e0b' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {process}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
