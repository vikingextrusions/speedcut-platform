import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  FileText,
  Package,
  Receipt,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

/* ─── Status badge helper ─── */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info',
    submitted: 'badge-info',
    reviewing: 'badge-warning',
    priced: 'badge-accent',
    sent: 'badge-accent',
    accepted: 'badge-success',
    rejected: 'badge-error',
    expired: 'badge-error',
    confirmed: 'badge-info',
    in_production: 'badge-warning',
    quality_check: 'badge-warning',
    ready_to_ship: 'badge-accent',
    shipped: 'badge-accent',
    delivered: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-error',
    paid: 'badge-success',
    overdue: 'badge-error',
    void: 'badge-error',
  }
  return (
    <span className={`badge ${colors[status] || 'badge-info'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  icon,
  href,
  accent,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  href: string
  accent?: string
}) {
  return (
    <Link href={href} className="card-hover group" style={{ padding: 0 }}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="micro-label" style={{ marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1 }}>{value}</p>
        </div>
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '0.75rem',
            backgroundColor: accent ? `${accent}15` : 'var(--accent-glow)',
            color: accent || 'var(--accent)',
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>View all</span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}

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

  // Fetch counts (gracefully handle empty orgs)
  let quoteCount = 0
  let orderCount = 0
  let invoiceCount = 0
  let pendingInvoiceTotal = 0

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

  const greeting = getGreeting()

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">{greeting}, {profile?.full_name || 'there'}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Here&apos;s an overview of your account
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard
          label="Active Quotes"
          value={quoteCount}
          icon={<FileText size={24} />}
          href="/quotes"
        />
        <StatCard
          label="Open Orders"
          value={orderCount}
          icon={<Package size={24} />}
          href="/orders"
          accent="#3b82f6"
        />
        <StatCard
          label="Pending Invoices"
          value={invoiceCount}
          icon={<Receipt size={24} />}
          href="/invoices"
          accent="#f59e0b"
        />
        <StatCard
          label="Quick Action"
          value="New RFQ"
          icon={<TrendingUp size={24} />}
          href="/quotes/new"
          accent="#10b981"
        />
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Quotes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Quotes</h2>
            <Link href="/quotes" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {recentQuotes && recentQuotes.length > 0 ? (
            <div>
              {recentQuotes.map((q) => (
                <Link
                  key={q.id}
                  href={`/quotes/${q.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background-color 0.15s',
                  }}
                  className="hover:bg-[var(--bg-primary)]"
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{q.quote_number}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      £{q.total_amount.toFixed(2)}
                    </span>
                    <StatusBadge status={q.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FileText size={32} />} message="No quotes yet" action={{ label: 'Request a Quote', href: '/quotes/new' }} />
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
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background-color 0.15s',
                  }}
                  className="hover:bg-[var(--bg-primary)]"
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
            <EmptyState icon={<Package size={32} />} message="No orders yet" />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Empty State Component ─── */
function EmptyState({
  icon,
  message,
  action,
}: {
  icon: React.ReactNode
  message: string
  action?: { label: string; href: string }
}) {
  return (
    <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.5 }}>{icon}</div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{message}</p>
      {action && (
        <Link
          href={action.href}
          className="btn-primary"
          style={{ marginTop: '1rem', display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
