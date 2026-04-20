'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Trash2, Upload } from 'lucide-react'

interface LineItem {
  id: string
  description: string
  quantity: number
  technology: string
  material: string
}

function createItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    technology: '',
    material: '',
  }
}

const technologies = [
  'FDM (Fused Deposition Modelling)',
  'SLA (Stereolithography)',
  'SLS (Selective Laser Sintering)',
  'MJF (Multi Jet Fusion)',
  'PolyJet',
  'DMLS (Metal 3D Printing)',
  'Not sure — recommend for me',
]

const materialsByTech: Record<string, string[]> = {
  'FDM (Fused Deposition Modelling)': ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'TPU', 'PC (Polycarbonate)', 'Carbon Fibre Nylon'],
  'SLA (Stereolithography)': ['Standard Resin', 'Tough Resin', 'Flexible Resin', 'High Temp Resin', 'Castable Resin', 'Dental Resin'],
  'SLS (Selective Laser Sintering)': ['Nylon PA12', 'Nylon PA11', 'Glass-filled Nylon', 'TPU', 'Alumide'],
  'MJF (Multi Jet Fusion)': ['Nylon PA12', 'Nylon PA11', 'Glass-filled PA12', 'TPU'],
  'PolyJet': ['Rigid Opaque', 'Rigid Transparent', 'Rubber-like', 'Multi-material'],
  'DMLS (Metal 3D Printing)': ['Stainless Steel 316L', 'Aluminium AlSi10Mg', 'Titanium Ti64', 'Inconel 718', 'Maraging Steel'],
}

export default function PrintingQuotePage() {
  const [items, setItems] = useState<LineItem[]>([createItem()])
  const [dragOver, setDragOver] = useState(false)

  const addItem = () => setItems([...items, createItem()])
  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id))
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((i) => {
      if (i.id !== id) return i
      const updated = { ...i, [field]: value }
      // Reset material when technology changes
      if (field === 'technology') updated.material = ''
      return updated
    }))
  }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Back link */}
      <Link
        href="/quotes/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Services
      </Link>

      <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>3D Printing Quote</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Upload your 3D models, choose a printing technology, and specify material requirements
      </p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
        {/* Project Details */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Project Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="project_name" className="label">Project Name</label>
              <input id="project_name" name="project_name" className="input-field" placeholder="e.g. Enclosure Prototype" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="customer_reference" className="label">Your Reference</label>
              <input id="customer_reference" name="customer_reference" className="input-field" placeholder="e.g. PO-12345" />
            </div>
          </div>
        </div>

        {/* Parts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Parts</h2>
            <span className="micro-label">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      color: '#a855f7',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                    }}
                  >
                    Part {idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="btn-ghost"
                      style={{ padding: '4px 8px', color: 'var(--error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="label">Part Description *</label>
                    <input
                      className="input-field"
                      placeholder="Part name, approximate size..."
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="label">Qty *</label>
                    <input
                      type="number"
                      min={1}
                      className="input-field"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="label">Technology</label>
                    <select
                      className="input-field"
                      value={item.technology}
                      onChange={(e) => updateItem(item.id, 'technology', e.target.value)}
                    >
                      <option value="">Select technology...</option>
                      {technologies.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="label">Material</label>
                    <select
                      className="input-field"
                      value={item.material}
                      onChange={(e) => updateItem(item.id, 'material', e.target.value)}
                      disabled={!item.technology || item.technology.includes('Not sure')}
                    >
                      <option value="">
                        {item.technology && !item.technology.includes('Not sure')
                          ? 'Select material...'
                          : 'Select technology first'}
                      </option>
                      {(materialsByTech[item.technology] || []).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="btn-ghost"
            style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} /> Add Another Part
          </button>
        </div>

        {/* File Upload */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>3D Model Files</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
            style={{
              border: `2px dashed ${dragOver ? '#a855f7' : 'var(--border)'}`,
              borderRadius: '0.75rem',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: dragOver ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
            }}
          >
            <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: 8, opacity: 0.5 }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Drag and drop files here, or click to browse
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)', opacity: 0.7 }}>
              STL, OBJ, 3MF, STEP — up to 50MB per file
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Additional Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Purpose</label>
              <select className="input-field" name="purpose">
                <option value="">Select purpose...</option>
                <option value="prototype">Prototype / Concept Model</option>
                <option value="functional">Functional Prototype</option>
                <option value="end-use">End-Use Part</option>
                <option value="tooling">Jig / Fixture / Tooling</option>
                <option value="visual">Visual / Display Model</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Lead Time</label>
              <select className="input-field" name="lead_time">
                <option value="standard">Standard (5-7 working days)</option>
                <option value="express">Express (2-3 working days)</option>
                <option value="next-day">Next Day</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="notes" className="label">Notes / Special Requirements</label>
            <textarea
              id="notes"
              name="notes"
              className="input-field"
              rows={4}
              placeholder="Post-processing requirements, colour preferences, orientation preferences..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link href="/quotes" className="btn-secondary" style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}>
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem' }}
          >
            <Send size={16} />
            Submit 3D Print Quote
          </button>
        </div>
      </form>
    </div>
  )
}
