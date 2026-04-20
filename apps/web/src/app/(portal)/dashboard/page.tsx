import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  FileText,
  Package,
  Receipt,
  TrendingUp,
  Bell,
  Truck,
} from 'lucide-react'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { StatCard } from '@speedcut/ui/stat-card'
import { PageHeader } from '@speedcut/ui/page-header'
import { EmptyState } from '@speedcut/ui/empty-state'

/* ─── Page ─── */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single()

  // Fetch user's org memberships to scope queries
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user!.id)

  const orgIds = orgMembers?.map(om => om.organization_id) || []

  // Fetch counts
  let quoteCount = 0
  let orderCount = 0
  let invoiceCount = 0

  if (orgIds.length > 0) {
    const { count: qc } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .in('customer_org_id', orgIds)
    quoteCount = qc || 0

    const { count: oc } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('customer_org_id', orgIds)
    orderCount = oc || 0

    const { count: ic } = await supabase
      .from('invoices')
      .select('*, orders!inner(customer_org_id)', { count: 'exact', head: true })
      .in('orders.customer_org_id', orgIds)
      .in('status', ['sent', 'overdue'])
    invoiceCount = ic || 0
  }

  // Unread notifications count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('is_read', false)

  // Recent quotes
  const { data: recentQuotes } = orgIds.length > 0
    ? await supabase
        .from('quotes')
        .select('id, quote_number, status, total_amount, created_at')
        .in('customer_org_id', orgIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  // Recent orders
  const { data: recentOrders } = orgIds.length > 0
    ? await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, order_date')
        .in('customer_org_id', orgIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  // Recent deliveries
  const { data: recentDeliveries } = orgIds.length > 0
    ? await supabase
        .from('delivery_notes')
        .select('id, dn_number, status, delivery_date, shipped_via, tracking_number, orders!inner(customer_org_id)')
        .in('orders.customer_org_id', orgIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  // Recent notifications
  const { data: recentNotifications } = await supabase
    .from('notifications')
    .select('id, title, body, is_read, entity_type, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const greeting = getGreeting()

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={`${greeting}, ${profile?.full_name || 'there'}`}
        subtitle="Here's an overview of your account"
      />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Active Quotes" value={quoteCount} icon={<FileText size={24} />} href="/quotes" />
        <StatCard label="Open Orders" value={orderCount} icon={<Package size={24} />} href="/orders" accent="#3b82f6" />
        <StatCard label="Pending Invoices" value={invoiceCount} icon={<Receipt size={24} />} href="/invoices" accent="#f59e0b" />
        <StatCard label="Notifications" value={unreadCount || 0} icon={<Bell size={24} />} href="/notifications" accent="#8b5cf6" />
        <StatCard label="Quick Action" value="New RFQ" icon={<TrendingUp size={24} />} href="/quotes/new" accent="#10b981" />
      </div>

      {/* Main Grid: 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Quotes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Quotes</h2>
            <Link href="/quotes" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentQuotes && recentQuotes.length > 0 ? (
            <div>
              {recentQuotes.map((q: any) => (
                <Link key={q.id} href={`/quotes/${q.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{q.quote_number}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>£{q.total_amount.toFixed(2)}</span>
                    <StatusBadge status={q.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FileText size={32} />} title="No quotes yet" message="Get started by requesting a quote" action={{ label: 'Request a Quote', href: '/quotes/new' }} />
          )}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h2>
            <Link href="/orders" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div>
              {recentOrders.map((o: any) => (
                <Link key={o.id} href={`/orders/${o.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.order_number}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>{new Date(o.order_date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>£{o.total_amount.toFixed(2)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Package size={32} />} title="No orders" message="Orders will appear here once quotes are accepted" />
          )}
        </div>

        {/* Delivery Tracking */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} /> Deliveries
            </h2>
          </div>
          {recentDeliveries && recentDeliveries.length > 0 ? (
            <div>
              {recentDeliveries.map((d: any) => (
                <div key={d.id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{d.dn_number}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {d.shipped_via && <span>Via: {d.shipped_via}</span>}
                    {d.tracking_number && <span>Tracking: {d.tracking_number}</span>}
                    {d.delivery_date && <span>Date: {new Date(d.delivery_date).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Truck size={32} />} title="No deliveries" message="Delivery tracking will appear here" />
          )}
        </div>

        {/* Notifications */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} /> Notifications
              {(unreadCount || 0) > 0 && (
                <span style={{ backgroundColor: 'var(--accent)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '999px', marginLeft: '0.25rem' }}>
                  {unreadCount}
                </span>
              )}
            </h2>
            <Link href="/notifications" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentNotifications && recentNotifications.length > 0 ? (
            <div>
              {recentNotifications.map((n: any) => (
                <div key={n.id} style={{
                  padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem',
                  backgroundColor: n.is_read ? 'transparent' : 'var(--accent-glow)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontWeight: n.is_read ? 500 : 700 }}>{n.title}</p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                  {n.body && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{n.body}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Bell size={32} />} title="All caught up" message="You'll be notified about quotes, orders, and deliveries here" />
          )}
        </div>
      </div>

      {/* Responsive grid override */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
