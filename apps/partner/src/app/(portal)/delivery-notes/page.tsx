import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Truck } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'badge-warning', dispatched: 'badge-accent', delivered: 'badge-success', signed: 'badge-success',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function PartnerDeliveryNotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user!.id)
  const orgIds = orgMembers?.map(om => om.organization_id) || []

  const { data: deliveryNotes } = orgIds.length > 0
    ? await supabase
        .from('delivery_notes')
        .select(`
          id, dn_number, status, delivery_date, shipped_via, tracking_number, created_at,
          orders!inner(order_number, partner_org_id, organizations!orders_customer_org_id_fkey(name))
        `)
        .in('orders.partner_org_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Delivery Notes</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track shipments and deliveries</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {deliveryNotes && deliveryNotes.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>DN #</th>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Delivery Date</th>
                  <th style={thStyle}>Shipped Via</th>
                  <th style={thStyle}>Tracking</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveryNotes.map((dn: any) => (
                  <tr key={dn.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <Link href={`/delivery-notes/${dn.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        {dn.dn_number}
                      </Link>
                    </td>
                    <td style={tdStyle}>{dn.orders?.order_number || '—'}</td>
                    <td style={tdStyle}>{dn.orders?.organizations?.name || '—'}</td>
                    <td style={tdStyle}>{new Date(dn.delivery_date).toLocaleDateString()}</td>
                    <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{dn.shipped_via || '—'}</span></td>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{dn.tracking_number || '—'}</span></td>
                    <td style={tdStyle}><StatusBadge status={dn.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Truck size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No delivery notes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Delivery notes will appear here when orders are ready to ship</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
