'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const statusActions: Record<string, { label: string; next: string; color: string }[]> = {
  draft: [{ label: 'Confirm Order', next: 'confirmed', color: '#3b82f6' }],
  confirmed: [{ label: 'Start Production', next: 'in_production', color: '#f59e0b' }],
  in_production: [{ label: 'Quality Check', next: 'quality_check', color: '#8b5cf6' }],
  quality_check: [{ label: 'Ready to Ship', next: 'ready_to_ship', color: '#00d9e1' }],
  ready_to_ship: [{ label: 'Mark Shipped', next: 'shipped', color: '#10b981' }],
  shipped: [{ label: 'Mark Delivered', next: 'delivered', color: '#10b981' }],
  delivered: [{ label: 'Complete', next: 'completed', color: '#10b981' }],
}

export function OrderStatusActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const actions = statusActions[currentStatus]

  const handleTransition = async (nextStatus: string) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: nextStatus as any }).eq('id', orderId)
    if (error) alert('Error: ' + error.message)
    else router.refresh()
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: 'cancelled' as any }).eq('id', orderId)
    if (error) alert('Error: ' + error.message)
    else router.refresh()
    setLoading(false)
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {currentStatus === 'completed' ? '✅ This order is complete.' : currentStatus === 'cancelled' ? '❌ This order was cancelled.' : 'No actions available.'}
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
        {!['completed', 'cancelled', 'delivered'].includes(currentStatus) && (
          <button onClick={handleCancel} disabled={loading} className="btn-destructive"
            style={{ width: '100%', padding: '0.625rem 1rem', fontSize: '0.875rem', opacity: loading ? 0.7 : 1, marginTop: '0.25rem' }}>
            Cancel Order
          </button>
        )}
      </div>
    </div>
  )
}
