'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Plus, Cpu, Printer, Layers, Package, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import {
  QuoteLineItem,
  createEmptyPart,
  serviceConfig,
} from '@speedcut/ui/quote-line-item'
import type { QuotePartData, ServiceType } from '@speedcut/ui/quote-line-item'
import { submitQuoteRequest } from './actions'

export default function NewQuotePage() {
  const router = useRouter()
  const [parts, setParts] = useState<QuotePartData[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successQuoteId, setSuccessQuoteId] = useState<string | null>(null)

  const addPart = (service: ServiceType) => {
    setParts([...parts, createEmptyPart(service)])
    setShowAddMenu(false)
  }

  const updatePart = (id: string, updates: Partial<QuotePartData>) => {
    setParts(parts.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deletePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id))
  }

  // Count parts per service
  const serviceCounts = parts.reduce<Record<string, number>>((acc, p) => {
    acc[p.service] = (acc[p.service] || 0) + 1
    return acc
  }, {})

  const hasParts = parts.length > 0

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSubmitting(true)
    // Serialize parts data into the form
    formData.set('parts_data', JSON.stringify(parts))
    try {
      const result = await submitQuoteRequest(formData)
      // Show success state before navigating
      setSuccessQuoteId(result.quoteId)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit quote')
      setSubmitting(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (successQuoteId) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1.5rem',
          animation: 'fade-in 0.4s ease-out',
          textAlign: 'center',
        }}
      >
        {/* Animated tick circle */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            border: '2px solid rgba(34, 197, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <CheckCircle2 size={36} color="#22c55e" />
        </div>

        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Quote Request Submitted!
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.6 }}>
            Your request has been received. Our team will review your parts and
            get back to you with pricing as soon as possible.
          </p>
        </div>

        {/* Info banner */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            maxWidth: 420,
            width: '100%',
          }}
        >
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You'll receive a notification when your quote is ready. You can track
            the progress from your Quotes dashboard at any time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => router.push(`/quotes/${successQuoteId}`)}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.5rem',
            }}
          >
            View Quote <ArrowRight size={16} />
          </button>
          <Link
            href="/quotes"
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.5rem',
              textDecoration: 'none',
            }}
          >
            Back to Quotes
          </Link>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Back link */}
      <Link
        href="/quotes"
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
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>New Quote</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500 }}>
            Add parts across any combination of manufacturing services. Each part can use a different process.
          </p>
        </div>

        {/* Service count summary */}
        {hasParts && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(serviceCounts).map(([svc, count]) => {
              const cfg = serviceConfig[svc as ServiceType]
              return (
                <span
                  key={svc}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: `${cfg.color}15`,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}25`,
                  }}
                >
                  {cfg.icon}
                  {count} {cfg.label}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
        {/* Project Details */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Project Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="project_name" className="label">Project Name</label>
              <input id="project_name" name="project_name" className="input-field" placeholder="e.g. Assembly V2 Prototype" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="customer_reference" className="label">Your Reference</label>
              <input id="customer_reference" name="customer_reference" className="input-field" placeholder="e.g. PO-12345" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="lead_time" className="label">Lead Time</label>
              <select id="lead_time" name="lead_time" className="input-field">
                <option value="standard">Standard (10-15 days)</option>
                <option value="express">Express (5-7 days)</option>
                <option value="rush">Rush (3-5 days)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Parts List ── */}
        {!hasParts ? (
          /* Empty state — service selector cards */
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Add your first part
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Choose a manufacturing service to add your first part. You can mix services — each part is configured independently.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {(Object.entries(serviceConfig) as [ServiceType, typeof serviceConfig[ServiceType]][]).map(([id, cfg]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => addPart(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '1.25rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--glass-border)',
                    backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = cfg.color
                    e.currentTarget.style.boxShadow = `0 4px 20px ${cfg.color}15`
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${cfg.color}15`,
                      color: cfg.color,
                      flexShrink: 0,
                    }}
                  >
                    {id === 'cnc' && <Cpu size={22} />}
                    {id === '3d-printing' && <Printer size={22} />}
                    {id === 'sheet-metal' && <Layers size={22} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cfg.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {id === 'cnc' && 'Milling, turning & multi-axis'}
                      {id === '3d-printing' && 'FDM, SLA, SLS & MJF'}
                      {id === 'sheet-metal' && 'Laser cutting, bending & welding'}
                    </div>
                  </div>
                  <Plus size={18} style={{ marginLeft: 'auto', color: cfg.color, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Parts list */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>
                Parts
                <span style={{ fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.85rem' }}>
                  ({parts.length})
                </span>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {parts.map((part, idx) => (
                <QuoteLineItem
                  key={part.id}
                  part={part}
                  index={idx}
                  canDelete={true}
                  onChange={updatePart}
                  onDelete={deletePart}
                />
              ))}
            </div>

            {/* Add Part buttons */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  padding: '8px 14px',
                }}
              >
                <Plus size={14} /> Add Part
              </button>

              {/* Add Part dropdown */}
              {showAddMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 30 }}
                    onClick={() => setShowAddMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 4,
                      padding: 6,
                      borderRadius: 10,
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      zIndex: 40,
                      minWidth: 220,
                      animation: 'scale-in 0.15s ease-out',
                    }}
                  >
                    {(Object.entries(serviceConfig) as [ServiceType, typeof serviceConfig[ServiceType]][]).map(([id, cfg]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => addPart(id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          fontSize: '0.825rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-primary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <span style={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</span>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {hasParts && (
          <div className="card">
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Additional Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="notes" className="label">Notes / Special Requirements</label>
              <textarea
                id="notes"
                name="notes"
                className="input-field"
                rows={4}
                placeholder="Assembly instructions, certification requirements, delivery preferences..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        {hasParts && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {parts.length} part{parts.length !== 1 ? 's' : ''} across {Object.keys(serviceCounts).length} service{Object.keys(serviceCounts).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/quotes" className="btn-secondary" style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.5rem',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
