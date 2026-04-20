'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Bell, FileText, Package, Receipt, Truck, CheckCheck } from 'lucide-react'

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  is_read: boolean
  link: string | null
  created_at: string
}

const typeIcons: Record<string, React.ReactNode> = {
  quote: <FileText size={16} />,
  order: <Package size={16} />,
  invoice: <Receipt size={16} />,
  delivery: <Truck size={16} />,
}

export function NotificationList({ notifications: initial }: { notifications: Notification[] }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initial)
  const [markingAll, setMarkingAll] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    const supabase = createClient()
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }
    setMarkingAll(false)
  }

  const handleClick = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id)
    if (n.link) {
      router.push(n.link)
    }
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.map((n, idx) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            style={{
              padding: '1rem 1.5rem',
              borderBottom: idx < notifications.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: n.link ? 'pointer' : 'default',
              backgroundColor: n.is_read ? 'transparent' : 'var(--accent-glow)',
              transition: 'background-color 0.15s',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '0.5rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: n.is_read ? 'var(--bg-primary)' : 'var(--accent-glow)',
              color: n.is_read ? 'var(--text-muted)' : 'var(--accent)',
            }}>
              {n.type && typeIcons[n.type] ? typeIcons[n.type] : <Bell size={16} />}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.875rem' }}>{n.title}</p>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {formatRelativeTime(n.created_at)}
                </span>
              </div>
              {n.body && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{n.body}</p>
              )}
            </div>

            {/* Unread dot */}
            {!n.is_read && (
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: 'var(--accent)', flexShrink: 0, marginTop: '0.375rem',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}
