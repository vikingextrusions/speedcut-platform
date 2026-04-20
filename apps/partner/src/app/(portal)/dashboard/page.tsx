import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  FileCheck,
  Package,
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

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Fetch user's partner org memberships
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user.id)

  const orgIds = orgMembers?.map(om => om.organization_id) || []

  // Fetch counts
  let pendingAssignments = 0
  let activeOrders = 0
  let pendingDeliveries = 0

  if (orgIds.length > 0) {
    const { count: ac } = await supabase
      .from('quote_assignments')
      .select('*', { count: 'exact', head: true })
      .in('partner_org_id', orgIds)
      .eq('status', 'pending')
    pendingAssignments = ac || 0

    const { count: oc } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('partner_org_id', orgIds)
      .in('status', ['confirmed', 'in_production', 'quality_check', 'ready_to_ship'])
    activeOrders = oc || 0

    const { count: dc } = await supabase
      .from('delivery_notes')
      .select('*, orders!inner(partner_org_id)', { count: 'exact', head: true })
      .in('orders.partner_org_id', orgIds)
      .eq('status', 'pending')
    pendingDeliveries = dc || 0
  }

  // Recent assignments
  const { data: recentAssignments } = orgIds.length > 0
    ? await supabase
        .from('quote_assignments')
        .select('id, status, created_at, partner_price, quotes(id, quote_number, total_amount)')
        .in('partner_org_id', orgIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  // Recent orders
  const { data: recentOrders } = orgIds.length > 0
    ? await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, order_date')
        .in('partner_org_id', orgIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  const greeting = getGreeting()

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={`${greeting}, ${profile?.full_name || 'there'}`}
        subtitle="Here's an overview of your partner activity"
      />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Pending Assignments" value={pendingAssignments} icon={<FileCheck size={24} />} href="/assignments" />
        <StatCard label="Active Orders" value={activeOrders} icon={<Package size={24} />} href="/orders" accent="#3b82f6" />
        <StatCard label="Pending Deliveries" value={pendingDeliveries} icon={<Truck size={24} />} href="/delivery-notes" accent="#f59e0b" />
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Assignments */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Assignments</h2>
            <Link href="/assignments" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {recentAssignments && recentAssignments.length > 0 ? (
            <div>
              {recentAssignments.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/assignments/${a.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', transition: 'background-color 0.15s',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {a.quotes?.quote_number || 'Quote'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FileCheck size={32} />} title="No assignments" message="No assignments yet" />
          )}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h2>
            <Link href="/orders" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div>
              {recentOrders.map((o: any) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', transition: 'background-color 0.15s',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.order_number}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                      {new Date(o.order_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      £{o.total_amount.toFixed(2)}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Package size={32} />} title="No orders" message="No orders yet" />
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
