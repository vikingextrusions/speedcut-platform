'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const LINE_STATUSES = [
  'outstanding',
  'in_progress',
  'on_hold',
  'waiting_material',
  'cutting_complete',
  'quality_check',
  'complete',
] as const

const statusColors: Record<string, string> = {
  outstanding: '#3b82f6',
  in_progress: '#f59e0b',
  on_hold: '#ef4444',
  waiting_material: '#f59e0b',
  cutting_complete: '#00d9e1',
  quality_check: '#f59e0b',
  complete: '#10b981',
}

export function LineStatusUpdater({
  lineId,
  currentStatus,
}: {
  lineId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus: string) => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('order_lines')
      .update({
        line_status: newStatus as any,
        completed_date: newStatus === 'complete' ? new Date().toISOString().split('T')[0] : undefined,
      })
      .eq('id', lineId)

    router.refresh()
    setLoading(false)
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="input-field"
      style={{
        width: 'auto',
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        borderColor: statusColors[currentStatus] || 'var(--border)',
        color: statusColors[currentStatus] || 'var(--text-primary)',
        minWidth: '140px',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {LINE_STATUSES.map(s => (
        <option key={s} value={s}>
          {s.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  )
}
