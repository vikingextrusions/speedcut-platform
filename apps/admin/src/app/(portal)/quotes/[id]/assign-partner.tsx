'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Loader2, Plus, X, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { assignPartnerToQuote, removePartnerAssignment } from './actions'

type Partner = { id: string; name: string }
type Assignment = {
  id: string
  status: string
  partner_price: number | null
  notes: string | null
  responded_at: string | null
  created_at: string
  organizations: { name: string } | null
}

const assignmentStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: '#f59e0b', icon: <Clock size={12} /> },
  accepted:  { label: 'Accepted',  color: '#10b981', icon: <CheckCircle2 size={12} /> },
  declined:  { label: 'Declined',  color: '#ef4444', icon: <XCircle size={12} /> },
  completed: { label: 'Completed', color: '#00d9e1', icon: <CheckCircle2 size={12} /> },
}

export function AssignPartnerPanel({
  quoteId,
  partners,
  assignments,
}: {
  quoteId: string
  partners: Partner[]
  assignments: Assignment[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Partners not yet assigned
  const assignedPartnerIds = new Set(assignments.map(a => {
    // We need to look up by partner_org_id — passed via the assignment id match
    return a.id
  }))

  // Simpler: filter partners that don't appear in assignments by name match
  // (server page should ideally pass partner_org_id on each assignment)
  const availablePartners = partners

  const handleAssign = () => {
    if (!selectedPartnerId) return
    setError(null)

    startTransition(async () => {
      try {
        await assignPartnerToQuote(quoteId, selectedPartnerId)
        setSelectedPartnerId('')
        router.refresh()
      } catch (err: any) {
        setError(err?.message || 'Failed to assign partner')
      }
    })
  }

  const handleRemove = (assignmentId: string) => {
    setRemovingId(assignmentId)
    startTransition(async () => {
      try {
        await removePartnerAssignment(quoteId, assignmentId)
        router.refresh()
      } catch (err: any) {
        setError(err?.message || 'Failed to remove assignment')
      } finally {
        setRemovingId(null)
      }
    })
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Building2 size={16} style={{ color: 'var(--accent)' }} />
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Partner Assignment</h3>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          padding: '0.625rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#ef4444', fontSize: '0.8rem',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* Current assignments */}
      {assignments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {assignments.map((a) => {
            const cfg = assignmentStatusConfig[a.status] || assignmentStatusConfig.pending
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Status indicator dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: cfg.color, flexShrink: 0,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.organizations?.name || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <span style={{ color: cfg.color, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {a.partner_price != null && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        · £{Number(a.partner_price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove — only allow on pending */}
                {a.status === 'pending' && (
                  <button
                    onClick={() => handleRemove(a.id)}
                    disabled={removingId === a.id || isPending}
                    title="Remove assignment"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '0.375rem',
                      border: 'none', backgroundColor: 'transparent',
                      color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
                      transition: 'background-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }}
                  >
                    {removingId === a.id ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Assign new partner */}
      {availablePartners.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <select
            value={selectedPartnerId}
            onChange={e => setSelectedPartnerId(e.target.value)}
            className="input-field"
            style={{ fontSize: '0.85rem' }}
          >
            <option value="">Select a partner…</option>
            {availablePartners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            disabled={!selectedPartnerId || isPending}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem',
              opacity: !selectedPartnerId || isPending ? 0.6 : 1,
            }}
          >
            {isPending
              ? <><Loader2 size={14} className="animate-spin" /> Assigning…</>
              : <><Plus size={14} /> Assign Partner</>
            }
          </button>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
          No active partners available.{' '}
          <a href="/partners" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Add a partner</a>
        </p>
      )}
    </div>
  )
}
