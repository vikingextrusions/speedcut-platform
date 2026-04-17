import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Package } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'badge-info', in_production: 'badge-warning', quality_check: 'badge-warning',
    ready_to_ship: 'badge-accent', shipped: 'badge-accent', delivered: 'badge-success',
    completed: 'badge-success', cancelled: 'badge-error',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user!.id)
  const orgIds = orgMembers?.map(om => om.organization_id) || []

  const { data: orders } = orgIds.length > 0
    ? await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, order_date, customer_reference, required_date')
        .in('customer_org_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">My Orders</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track your orders from confirmation to delivery</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {orders && orders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Order #</th>
                  <th style={thStyle}>Your Ref</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Required By</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-[var(--bg-primary)]">
                    <td style={tdStyle}>
                      <Link href={`/orders/${o.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        {o.order_number}
                      </Link>
                    </td>
                    <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{o.customer_reference || '—'}</span></td>
                    <td style={tdStyle}>{new Date(o.order_date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{o.required_date ? new Date(o.required_date).toLocaleDateString() : '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>£{o.total_amount.toFixed(2)}</td>
                    <td style={tdStyle}><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Package size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Orders will appear here once a quote is accepted and confirmed</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
