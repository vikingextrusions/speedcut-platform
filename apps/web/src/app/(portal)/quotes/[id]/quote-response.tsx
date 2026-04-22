'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, XCircle, Loader2, AlertCircle,
  CheckSquare, Square, ChevronRight,
} from 'lucide-react'
import { respondToQuote } from './actions'

type LineItem = {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number | null
  material: string | null
  lead_time: string | null
}

export function QuoteResponseActions({
  quoteId,
  items,
}: {
  quoteId: string
  items: LineItem[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [acting, setActing] = useState<'accepted' | 'rejected' | null>(null)
  const [error, setError] = useState<string | null>(null)
  // All lines selected by default
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.map(i => i.id)))

  const toggleLine = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        // Don't allow deselecting the last item
        if (next.size === 1) return prev
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === items.length) {
      // Deselect all except first (must keep at least one)
      setSelected(new Set([items[0].id]))
    } else {
      setSelected(new Set(items.map(i => i.id)))
    }
  }

  const selectedItems = items.filter(i => selected.has(i.id))
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + Number(i.total_price ?? i.unit_price * i.quantity), 0
  )
  const allSelected = selected.size === items.length

  const handle = (response: 'accepted' | 'rejected') => {
    setError(null)
    setActing(response)
    startTransition(async () => {
      try {
        const result = await respondToQuote(
          quoteId,
          response,
          response === 'accepted' ? Array.from(selected) : []
        )
        if (result?.orderId) {
          router.push(`/orders/${result.orderId}`)
        } else {
          router.refresh()
        }
      } catch (err: any) {
        setError(err?.message || 'Something went wrong')
        setActing(null)
      }
    })
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Line selection table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(0,217,225,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleAll}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--accent)' }}
              title={allSelected ? 'Deselect all' : 'Select all'}
            >
              {allSelected
                ? <CheckSquare size={18} />
                : <Square size={18} />
              }
            </button>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              Select lines to include in your order
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {selected.size} of {items.length} selected
          </span>
        </div>

        {/* Rows */}
        {items.map((item) => {
          const isSelected = selected.has(item.id)
          const lineTotal = Number(item.total_price ?? item.unit_price * item.quantity)
          return (
            <div
              key={item.id}
              onClick={() => toggleLine(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'background-color 0.12s',
                backgroundColor: isSelected ? 'transparent' : 'rgba(0,0,0,0.15)',
                opacity: isSelected ? 1 : 0.5,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isSelected ? 'var(--bg-primary)' : 'rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = isSelected ? 'transparent' : 'rgba(0,0,0,0.15)' }}
            >
              {/* Checkbox */}
              <div style={{ color: isSelected ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>
                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              </div>

              {/* Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600, fontSize: '0.875rem',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: isSelected ? 'none' : 'line-through',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {item.description}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {item.material && <span>{item.material} · </span>}
                  Qty: {item.quantity}
                  {item.lead_time && <span> · {item.lead_time}</span>}
                </div>
              </div>

              {/* Price */}
              <div style={{ fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                £{lineTotal.toFixed(2)}
              </div>
            </div>
          )
        })}

        {/* Selected total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--bg-primary)',
          fontSize: '0.875rem',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {selected.size < items.length && (
              <span style={{ color: '#f59e0b' }}>⚠ {items.length - selected.size} line{items.length - selected.size !== 1 ? 's' : ''} excluded — admin may need to revise pricing</span>
            )}
          </span>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>
            Selected total: £{selectedTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#ef4444', fontSize: '0.8rem',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => handle('accepted')}
          disabled={isPending || selected.size === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: 'none',
            fontWeight: 700, fontSize: '0.875rem',
            cursor: isPending || selected.size === 0 ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            opacity: isPending || selected.size === 0 ? 0.6 : 1,
            boxShadow: '0 2px 12px rgba(16, 185, 129, 0.3)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { if (!isPending) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {acting === 'accepted' && isPending
            ? <Loader2 size={16} className="animate-spin" />
            : <><CheckCircle2 size={16} /> <ChevronRight size={14} /></>
          }
          {acting === 'accepted' && isPending
            ? 'Placing order…'
            : `Accept & Place Order (${selected.size} line${selected.size !== 1 ? 's' : ''})`
          }
        </button>

        <button
          onClick={() => handle('rejected')}
          disabled={isPending}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            fontWeight: 600, fontSize: '0.875rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444', opacity: isPending ? 0.6 : 1,
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => { if (!isPending) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)' }}
        >
          {acting === 'rejected' && isPending
            ? <Loader2 size={16} className="animate-spin" />
            : <XCircle size={16} />
          }
          {acting === 'rejected' && isPending ? 'Declining…' : 'Decline Quote'}
        </button>
      </div>
    </div>
  )
}
