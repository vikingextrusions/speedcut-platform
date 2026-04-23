'use client'

import React, { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { HeroDropzone } from '@speedcut/ui/hero-dropzone'
import { PartCard, createPartFromFile, serviceConfig } from '@speedcut/ui/part-card'
import type { PartData, ServiceType } from '@speedcut/ui/part-card'
import type { GeometryResult } from '@speedcut/ui/file-dropzone'
import { submitQuoteRequest } from './actions'

// ─── Upload + Analysis Pipeline ───

async function uploadAndAnalyse(
  part: PartData,
  onUpdate: (updates: Partial<PartData>) => void,
) {
  try {
    onUpdate({ uploadPhase: 'uploading', uploadProgress: 10 })

    // Step 1: Get presigned upload URL
    const metaRes = await fetch('/api/geometry/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: part.file.name,
        fileSize: part.file.size,
        mimeType: part.file.type || 'application/octet-stream',
      }),
    })
    if (!metaRes.ok) {
      const errBody = await metaRes.json().catch(() => ({}))
      throw new Error(errBody.error || `Upload init failed (${metaRes.status})`)
    }
    const meta = await metaRes.json()
    onUpdate({ uploadProgress: 30 })

    // Step 2: Upload to storage
    const uploadRes = await fetch(meta.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': part.file.type || 'application/octet-stream' },
      body: part.file,
    })
    if (!uploadRes.ok) throw new Error('Upload failed')
    onUpdate({ uploadProgress: 60, uploadPhase: 'analysing' })

    // Step 3: Trigger analysis
    const analyseRes = await fetch('/api/geometry/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: meta.fileId,
        filePath: meta.filePath,
        geometryResultId: meta.geometryResultId,
      }),
    })
    if (!analyseRes.ok) {
      const errBody = await analyseRes.json().catch(() => ({}))
      throw new Error(errBody.error || `Analysis failed (${analyseRes.status})`)
    }
    const analyseData = await analyseRes.json()
    onUpdate({ uploadProgress: 70 })

    // Step 4: Poll for result
    const jobId = analyseData.jobId || analyseData.job_id
    let attempts = 0
    while (attempts < 30) {
      await new Promise(r => setTimeout(r, 2000))
      attempts++
      const statusRes = await fetch(`/api/geometry/status/${jobId}`)
      if (!statusRes.ok) continue
      const status = await statusRes.json()

      if (status.status === 'complete' && status.result) {
        const result: GeometryResult = status.result
        // Auto-detect service from AI recommendation
        const PROCESS_MAP: Record<string, ServiceType> = { CNC: 'cnc', SHEET_METAL: 'sheet-metal', '3DP': '3d-printing' }
        const aiService = result.recommended_process ? PROCESS_MAP[result.recommended_process] : undefined

        onUpdate({
          uploadPhase: 'complete',
          uploadProgress: 100,
          fileId: meta.fileId,
          geometryResultId: meta.geometryResultId,
          geometryResult: result,
          ...(aiService ? { service: aiService } : {}),
        })
        return
      }
      if (status.status === 'failed') {
        throw new Error(status.error || 'Analysis failed')
      }
      onUpdate({ uploadProgress: 70 + Math.min(25, attempts * 2) })
    }
    throw new Error('Analysis timed out')
  } catch (err: any) {
    onUpdate({ uploadPhase: 'error', uploadError: err?.message || 'Upload failed' })
  }
}

// ─── Page ───

export default function NewQuotePage() {
  const router = useRouter()
  const [parts, setParts] = useState<PartData[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successQuoteId, setSuccessQuoteId] = useState<string | null>(null)

  // Project details refs
  const projectNameRef = useRef<HTMLInputElement>(null)
  const customerReferenceRef = useRef<HTMLInputElement>(null)
  const leadTimeRef = useRef<HTMLSelectElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  const hasParts = parts.length > 0

  // ─── File handling ───

  const handleFilesSelected = useCallback((files: File[]) => {
    const newParts = files.map(f => createPartFromFile(f))
    setParts(prev => [...prev, ...newParts])

    // Start upload+analysis for each
    newParts.forEach(part => {
      uploadAndAnalyse(part, (updates) => {
        setParts(prev => prev.map(p => p.id === part.id ? { ...p, ...updates } : p))
      })
    })
  }, [])

  const updatePart = (id: string, updates: Partial<PartData>) => {
    setParts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deletePart = (id: string) => {
    setParts(prev => prev.filter(p => p.id !== id))
  }

  // ─── Submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (parts.length === 0) { setError('Please upload at least one CAD file.'); return }

    const incomplete = parts.find(p => p.uploadPhase !== 'complete')
    if (incomplete) { setError('Please wait for all files to finish processing.'); return }

    setSubmitting(true)
    try {
      const result = await submitQuoteRequest({
        projectName: projectNameRef.current?.value || '',
        customerReference: customerReferenceRef.current?.value || '',
        leadTime: leadTimeRef.current?.value || 'standard',
        notes: notesRef.current?.value || '',
        parts: parts.map(p => ({
          name: p.description,
          service: p.service,
          material: p.service === 'cnc' ? p.cncMaterial
            : p.service === '3d-printing' ? p.printMaterial : p.sheetMaterial,
          materialType: p.service === '3d-printing' ? p.printTechnology : undefined,
          quantity: p.quantity,
          finish: p.service === 'cnc' ? p.cncFinish
            : p.service === '3d-printing' ? p.printPurpose : p.sheetFinish,
          tolerance: p.service === 'cnc' ? p.cncTolerance : undefined,
          notes: p.notes,
          fileId: p.fileId,
          geometryResultId: p.geometryResultId,
        })),
      })
      setSuccessQuoteId(result.quoteId)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit')
      setSubmitting(false)
    }
  }

  // ─── Success screen ───

  if (successQuoteId) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: '1.5rem', animation: 'fade-in 0.4s ease-out', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.12)', border: '2px solid rgba(34, 197, 94, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <CheckCircle2 size={36} color="#22c55e" />
        </div>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Quote Request Submitted!</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.6 }}>
            Your request has been received. Our team will review your parts and get back to you with pricing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => router.push(`/quotes/${successQuoteId}`)} className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem' }}>
            View Quote <ArrowRight size={16} />
          </button>
          <Link href="/quotes" className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', textDecoration: 'none' }}>
            Back to Quotes
          </Link>
        </div>
      </div>
    )
  }

  // ─── Service summary counts ───
  const serviceCounts = parts.reduce<Record<string, number>>((a, p) => {
    a[p.service] = (a[p.service] || 0) + 1; return a
  }, {})

  // ─── Main form ───

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out', maxWidth: 1100, margin: '0 auto' }}>
      <Link href="/quotes" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem',
      }}>
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>New Quote</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Upload your CAD files to get started. Each file is analysed automatically.
          </p>
        </div>
        {hasParts && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(serviceCounts).map(([svc, count]) => {
              const cfg = serviceConfig[svc as ServiceType]
              return (
                <span key={svc} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                  backgroundColor: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25`,
                }}>
                  {cfg.icon} {count} {cfg.label}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '0.5rem',
          backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: '0.875rem',
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* ── Hero Upload Zone (only when no parts) ── */}
        {!hasParts && (
          <HeroDropzone onFilesSelected={handleFilesSelected} disabled={submitting} />
        )}

        {/* ── Two-Column Layout: Parts + Sidebar ── */}
        {hasParts && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem', alignItems: 'start' }}>
            {/* Left: Parts list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {parts.map((part, idx) => (
                <PartCard key={part.id} part={part} index={idx} onChange={updatePart} onDelete={deletePart} />
              ))}

              {/* Compact "add another part" strip */}
              <HeroDropzone onFilesSelected={handleFilesSelected} disabled={submitting} compact />
            </div>

            {/* Right: Project Details Sidebar */}
            <div style={{
              position: 'sticky', top: 16,
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.8rem', fontWeight: 700,
                color: 'var(--text-primary)',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}>
                Project Details
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="project_name" className="micro-label">Project Name</label>
                  <input ref={projectNameRef} id="project_name" className="input-field" placeholder="e.g. Assembly V2" style={{ fontSize: '0.78rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="customer_reference" className="micro-label">Your Reference</label>
                  <input ref={customerReferenceRef} id="customer_reference" className="input-field" placeholder="e.g. PO-12345" style={{ fontSize: '0.78rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="lead_time" className="micro-label">Lead Time</label>
                  <select ref={leadTimeRef} id="lead_time" className="input-field" style={{ fontSize: '0.78rem' }}>
                    <option value="standard">Standard (10-15 days)</option>
                    <option value="express">Express (5-7 days)</option>
                    <option value="rush">Rush (3-5 days)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="notes" className="micro-label">Notes</label>
                  <textarea ref={notesRef} id="notes" className="input-field" rows={3}
                    placeholder="Assembly instructions, certifications..."
                    style={{ resize: 'vertical', fontSize: '0.78rem' }} />
                </div>

                {/* Summary */}
                <div style={{
                  padding: '8px 10px', borderRadius: 6,
                  backgroundColor: 'var(--bg-primary)',
                  borderTop: '1px solid var(--border)',
                  marginTop: 4,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Parts</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{parts.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Qty</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{parts.reduce((s, p) => s + p.quantity, 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Total</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pending</span>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={submitting} className="btn-primary" style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', padding: '0.6rem 1rem', opacity: submitting ? 0.7 : 1,
                }}>
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {submitting ? 'Submitting...' : 'Submit Quote Request'}
                </button>

                <Link href="/quotes" style={{
                  display: 'block', textAlign: 'center', fontSize: '0.75rem',
                  color: 'var(--text-muted)', textDecoration: 'none',
                }}>
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
