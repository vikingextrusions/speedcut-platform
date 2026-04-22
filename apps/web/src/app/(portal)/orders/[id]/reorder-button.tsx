'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { reorderFromOrder } from './actions'

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleReorder = () => {
    setError(null)
    startTransition(async () => {
      try {
        const { quoteId } = await reorderFromOrder(orderId)
        router.push(`/quotes/${quoteId}`)
      } catch (err: any) {
        setError(err?.message || 'Failed to create re-order')
      }
    })
  }

  return (
    <div>
      <button
        onClick={handleReorder}
        disabled={isPending}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          fontWeight: 600, fontSize: '0.825rem',
          cursor: isPending ? 'not-allowed' : 'pointer',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'var(--text-secondary)',
          opacity: isPending ? 0.7 : 1,
          transition: 'border-color 0.15s, color 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => {
          if (!isPending) {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--accent)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
        title="Create a new quote request using the same parts as this order"
      >
        {isPending
          ? <Loader2 size={14} className="animate-spin" />
          : <RefreshCw size={14} />
        }
        {isPending ? 'Creating…' : 'Re-order'}
      </button>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#ef4444', fontSize: '0.8rem',
        }}>
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  )
}
