import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  FileText,
  Package,
  Receipt,
  CreditCard,
  ShoppingCart,
  Building2,
  Factory,
  TrendingUp,
  ArrowRight,
  Activity,
  Clock,
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
    ordered: 'badge-info',
    received: 'badge-success',
    allocated: 'badge-success',
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
    <Link href={href} className="card-hover group" style={{ padding: 0, textDecoration: 'none', color: 'inherit' }}>
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
        <ArrowRight size={14} />
      </div>
    </Link>
  )
}

/* ─── Page ─── */
export default async function AdminDashboardPage() {
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

  // Fetch platform-wide counts
  const { count: quoteCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeOrderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['confirmed', 'in_production', 'quality_check', 'ready_to_ship', 'shipped'])

  const { count: unpaidInvoiceCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .in('status', ['sent', 'overdue'])

  const { count: customerCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'customer')

  const { count: partnerCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'partner')

  const { count: pendingPOCount } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['draft', 'ordered'])

  // Recent quotes
  const { data: recentQuotes } = await supabase
    .from('quotes')
    .select('id, quote_number, status, total_amount, created_at, organizations!quotes_customer_org_id_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, order_date, organizations!orders_customer_org_id_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent activity
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('id, action, entity_type, entity_id, created_at, profiles!activity_log_actor_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(8)

  const greeting = getGreeting()

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">{greeting}, {profile?.full_name || 'there'}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Platform overview and operations
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard
          label="Total Quotes"
          value={quoteCount || 0}
          icon={<FileText size={24} />}
          href="/quotes"
        />
        <StatCard
          label="Active Orders"
          value={activeOrderCount || 0}
          icon={<Package size={24} />}
          href="/orders"
          accent="#3b82f6"
        />
        <StatCard
          label="Unpaid Invoices"
          value={unpaidInvoiceCount || 0}
          icon={<Receipt size={24} />}
          href="/invoices"
          accent="#f59e0b"
        />
        <StatCard
          label="Customers"
          value={customerCount || 0}
          icon={<Building2 size={24} />}
          href="/customers"
          accent="#10b981"
        />
        <StatCard
          label="Partners"
          value={partnerCount || 0}
          icon={<Factory size={24} />}
          href="/partners"
          accent="#8b5cf6"
        />
        <StatCard
          label="Open POs"
          value={pendingPOCount || 0}
          icon={<ShoppingCart size={24} />}
          href="/purchase-orders"
          accent="#ef4444"
        />
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Quotes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Quotes</h2>
            <Link href="/quotes" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentQuotes && recentQuotes.length > 0 ? (
            <div>
              {recentQuotes.map((q: any) => (
                <Link
                  key={q.id}
                  href={`/quotes/${q.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', transition: 'background-color 0.15s',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{q.quote_number}</span>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2 }}>
                      {q.organizations?.name || '—'}
                    </div>
                  </div>
                  <StatusBadge status={q.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FileText size={32} />} message="No quotes yet" />
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
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', transition: 'background-color 0.15s',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{o.order_number}</span>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2 }}>
                      {o.organizations?.name || '—'}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Package size={32} />} message="No orders yet" />
          )}
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Activity Feed</h2>
            <Link href="/activity" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentActivity && recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((a: any) => (
                <div
                  key={a.id}
                  style={{
                    padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)',
                    fontSize: '0.825rem', lineHeight: 1.5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{a.profiles?.full_name || 'System'}</span>
                      <span style={{ color: 'var(--text-muted)' }}> {a.action} </span>
                      <span style={{ color: 'var(--accent)' }}>{a.entity_type}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Activity size={32} />} message="No activity yet" />
          )}
        </div>
      </div>

      {/* Responsive override for 3-col grid */}
      <style>{`
        @media (max-width: 1200px) {
          div[style*="grid-template-columns: 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 800px) {
          div[style*="grid-template-columns: 1fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ─── Empty State Component ─── */
function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode
  message: string
}) {
  return (
    <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.5 }}>{icon}</div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{message}</p>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
