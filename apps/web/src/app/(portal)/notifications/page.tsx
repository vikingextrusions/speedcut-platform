import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { PageHeader } from '@speedcut/ui/page-header'
import { EmptyState } from '@speedcut/ui/empty-state'
import { NotificationList } from './notification-list'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, type, title, body, is_read, entity_type, entity_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
      />

      {notifications && notifications.length > 0 ? (
        <NotificationList notifications={notifications as any[]} />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState
            icon={<Bell size={48} />}
            title="No notifications"
            message="You'll be notified about quotes, orders, and deliveries here"
          />
        </div>
      )}
    </div>
  )
}
