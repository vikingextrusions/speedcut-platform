'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const STATUS_FLOW = ['draft', 'submitted', 'reviewing', 'priced', 'sent', 'accepted', 'rejected'] as const

const statusActions: Record<string, { label: string; next: string; color: string }[]> = {
  draft: [{ label: 'Submit for Review', next: 'submitted', color: '#3b82f6' }],
  submitted: [{ label: 'Start Review', next: 'reviewing', color: '#f59e0b' }],
  reviewing: [{ label: 'Mark as Priced', next: 'priced', color: '#00d9e1' }],
  priced: [{ label: 'Send to Customer', next: 'sent', color: '#10b981' }],
  sent: [
    { label: 'Mark Accepted', next: 'accepted', color: '#10b981' },
    { label: 'Mark Rejected', next: 'rejected', color: '#ef4444' },
  ],
}

export function QuoteStatusActions({ quoteId, currentStatus }: { quoteId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const actions = statusActions[currentStatus]

  const handleTransition = async (nextStatus: string) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('quotes').update({ status: nextStatus as any }).eq('id', quoteId)
    if (error) alert('Error: ' + error.message)
    else router.refresh()
    setLoading(false)
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {currentStatus === 'accepted' ? '✅ This quote has been accepted.' : currentStatus === 'rejected' ? '❌ This quote was rejected.' : 'No actions available.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Actions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {actions.map(a => (
          <button
            key={a.next}
            onClick={() => handleTransition(a.next)}
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', padding: '0.625rem 1rem', fontSize: '0.875rem',
              background: `linear-gradient(135deg, ${a.color}, ${a.color}dd)`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
