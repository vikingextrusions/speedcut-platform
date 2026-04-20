'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Trash2, Upload } from 'lucide-react'

interface LineItem {
  id: string
  description: string
  quantity: number
  material: string
  thickness: string
  processes: string[]
}

function createItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    material: '',
    thickness: '',
    processes: [],
  }
}

const materials = [
  'Mild Steel (S275)',
  'Mild Steel (S355)',
  'Stainless Steel 304',
  'Stainless Steel 316',
  'Aluminium 1050',
  'Aluminium 5083',
  'Aluminium 6082',
  'Galvanised Steel',
  'Zintec',
  'Copper',
  'Brass',
  'Corten Steel',
]

const thicknesses = [
  '0.5mm', '0.7mm', '0.8mm', '1.0mm', '1.2mm', '1.5mm',
  '2.0mm', '2.5mm', '3.0mm', '4.0mm', '5.0mm', '6.0mm',
  '8.0mm', '10.0mm', '12.0mm', '15.0mm', '20.0mm', '25.0mm',
]

const processOptions = [
  'Laser Cutting',
  'CNC Bending / Folding',
  'Punching',
  'Welding (MIG)',
  'Welding (TIG)',
  'Spot Welding',
  'Countersinking',
  'Tapping',
  'Hardware Insertion',
  'Deburring',
]

const finishes = [
  'None / Raw',
  'Powder Coated',
  'Galvanised',
  'Zinc Plated',
  'Anodised',
  'Brushed / Linished',
  'Polished',
  'Painted',
  'Passivated',
]

export default function SheetMetalQuotePage() {
  const [items, setItems] = useState<LineItem[]>([createItem()])
  const [dragOver, setDragOver] = useState(false)

  const addItem = () => setItems([...items, createItem()])
  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id))
  const updateItem = (id: string, field: keyof LineItem, value: string | number | string[]) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const toggleProcess = (id: string, process: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const next = item.processes.includes(process)
      ? item.processes.filter((p) => p !== process)
      : [...item.processes, process]
    updateItem(id, 'processes', next)
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

      <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Sheet Metal Quote</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Specify your sheet metal requirements including material, thickness, and fabrication processes
      </p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
        {/* Project Details */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Project Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="project_name" className="label">Project Name</label>
              <input id="project_name" name="project_name" className="input-field" placeholder="e.g. Control Panel Enclosure" />
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
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
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
                      placeholder="Part name, flat size, fold dimensions..."
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="label">Material</label>
                    <select
                      className="input-field"
                      value={item.material}
                      onChange={(e) => updateItem(item.id, 'material', e.target.value)}
                    >
                      <option value="">Select material...</option>
                      {materials.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="label">Thickness</label>
                    <select
                      className="input-field"
                      value={item.thickness}
                      onChange={(e) => updateItem(item.id, 'thickness', e.target.value)}
                    >
                      <option value="">Select thickness...</option>
                      {thicknesses.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Processes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="label">Required Processes</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {processOptions.map((process) => {
                      const isSelected = item.processes.includes(process)
                      return (
                        <button
                          key={process}
                          type="button"
                          onClick={() => toggleProcess(item.id, process)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.75rem',
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
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Drawings & Files</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
            style={{
              border: `2px dashed ${dragOver ? '#f59e0b' : 'var(--border)'}`,
              borderRadius: '0.75rem',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: dragOver ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
            }}
          >
            <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: 8, opacity: 0.5 }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Drag and drop files here, or click to browse
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)', opacity: 0.7 }}>
              DXF, DWG, STEP, PDF — up to 50MB per file
            </p>
          </div>
        </div>

        {/* Additional */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Finishing & Delivery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Surface Finish</label>
              <select className="input-field" name="finish">
                <option value="">Select finish...</option>
                {finishes.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Lead Time</label>
              <select className="input-field" name="lead_time">
                <option value="standard">Standard (10-15 working days)</option>
                <option value="express">Express (5-7 working days)</option>
                <option value="rush">Rush (3-5 working days)</option>
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
              placeholder="Weld specifications, assembly requirements, certification needs..."
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
            Submit Sheet Metal Quote
          </button>
        </div>
      </form>
    </div>
  )
}
