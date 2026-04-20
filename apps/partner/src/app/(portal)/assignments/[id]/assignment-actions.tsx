'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle2, XCircle, Send } from 'lucide-react'

export function AssignmentActions({
  assignmentId,
  status,
  currentPrice,
  currentNotes,
}: {
  assignmentId: string
  status: string
  currentPrice?: number
  currentNotes: string
}) {
  const router = useRouter()
  const [price, setPrice] = useState(currentPrice?.toString() || '')
  const [notes, setNotes] = useState(currentNotes)
  const [loading, setLoading] = useState(false)

  const handleRespond = async (responseStatus: 'accepted' | 'declined') => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('quote_assignments')
      .update({
        status: responseStatus,
        responded_at: new Date().toISOString(),
        notes: notes || null,
        partner_price: responseStatus === 'accepted' && price ? parseFloat(price) : null,
      })
      .eq('id', assignmentId)

    if (error) {
      alert('Error updating assignment: ' + error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  if (status !== 'pending') {
    return (
      <div className="card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Status</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {status === 'accepted' && 'You accepted this assignment.'}
          {status === 'declined' && 'You declined this assignment.'}
          {status === 'completed' && 'This assignment is complete.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Respond</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="label" style={{ marginBottom: '0.375rem', display: 'block' }}>
            Your Price (£)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter your price"
            className="input-field"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label className="label" style={{ marginBottom: '0.375rem', display: 'block' }}>
            Notes
          </label>
          <textarea
            placeholder="Any notes about lead time, requirements, etc."
            className="input-field"
            rows={3}
            style={{ resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={() => handleRespond('accepted')}
            disabled={loading}
            className="btn-primary"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <CheckCircle2 size={16} />
            Accept
          </button>
          <button
            onClick={() => handleRespond('declined')}
            disabled={loading}
            className="btn-destructive"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <XCircle size={16} />
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
