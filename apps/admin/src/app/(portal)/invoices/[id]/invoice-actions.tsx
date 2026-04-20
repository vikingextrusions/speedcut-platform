'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const statusActions: Record<string, { label: string; next: string; color: string }[]> = {
  draft: [{ label: 'Send Invoice', next: 'sent', color: '#3b82f6' }],
  sent: [
    { label: 'Mark as Paid', next: 'paid', color: '#10b981' },
    { label: 'Void Invoice', next: 'void', color: '#ef4444' },
  ],
}

export function InvoiceStatusActions({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const actions = statusActions[currentStatus]

  const handleTransition = async (nextStatus: string) => {
    setLoading(true)
    const supabase = createClient()
    const update: any = { status: nextStatus }
    if (nextStatus === 'paid') update.paid_date = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('invoices').update(update).eq('id', invoiceId)
    if (error) alert('Error: ' + error.message)
    else router.refresh()
    setLoading(false)
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {currentStatus === 'paid' ? '✅ This invoice has been paid.' : currentStatus === 'void' ? '❌ This invoice was voided.' : 'No actions available.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Actions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {actions.map(a => (
          <button key={a.next} onClick={() => handleTransition(a.next)} disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '0.625rem 1rem', fontSize: '0.875rem', background: `linear-gradient(135deg, ${a.color}, ${a.color}dd)`, opacity: loading ? 0.7 : 1 }}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
