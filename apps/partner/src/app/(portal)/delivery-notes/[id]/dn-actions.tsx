'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Send, Truck } from 'lucide-react'

export function DeliveryNoteActions({
  dnId,
  status,
  currentShippedVia,
  currentTrackingNumber,
}: {
  dnId: string
  status: string
  currentShippedVia: string
  currentTrackingNumber: string
}) {
  const router = useRouter()
  const [shippedVia, setShippedVia] = useState(currentShippedVia)
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber)
  const [loading, setLoading] = useState(false)

  const handleDispatch = async () => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('delivery_notes')
      .update({
        status: 'dispatched',
        shipped_via: shippedVia || null,
        tracking_number: trackingNumber || null,
      })
      .eq('id', dnId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  if (status !== 'pending') {
    return (
      <div className="card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Dispatch Status</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {status === 'dispatched' && '📦 This delivery note has been dispatched.'}
          {status === 'delivered' && '✅ This delivery has been confirmed as received.'}
          {status === 'signed' && '✍️ This delivery has been signed for.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Mark as Dispatched</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="label" style={{ marginBottom: '0.375rem', display: 'block' }}>Shipped Via</label>
          <input
            type="text"
            placeholder="e.g. DPD, Royal Mail, TNT"
            className="input-field"
            value={shippedVia}
            onChange={(e) => setShippedVia(e.target.value)}
          />
        </div>

        <div>
          <label className="label" style={{ marginBottom: '0.375rem', display: 'block' }}>Tracking Number</label>
          <input
            type="text"
            placeholder="Enter tracking number"
            className="input-field"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>

        <button
          onClick={handleDispatch}
          disabled={loading}
          className="btn-primary"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.625rem 1rem', fontSize: '0.875rem', width: '100%',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Send size={16} />
          Mark as Dispatched
        </button>
      </div>
    </div>
  )
}
