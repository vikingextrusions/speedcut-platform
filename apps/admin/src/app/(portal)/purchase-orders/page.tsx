import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info', ordered: 'badge-accent', received: 'badge-success', cancelled: 'badge-error',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function AdminPurchaseOrdersPage() {
  const supabase = await createClient()

  const { data: pos } = await supabase
    .from('purchase_orders')
    .select(`
      id, po_number, status, subtotal, vat_amount, total_amount, order_date, delivery_date,
      organizations!purchase_orders_supplier_org_id_fkey(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Purchase Orders</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage supplier purchase orders</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {pos && pos.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>PO #</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Delivery</th>
                  <th style={thStyle}>Subtotal</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po: any) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <Link href={`/purchase-orders/${po.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{po.po_number}</Link>
                    </td>
                    <td style={tdStyle}>{po.organizations?.name || '—'}</td>
                    <td style={tdStyle}>{new Date(po.order_date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : '—'}</td>
                    <td style={tdStyle}>£{po.subtotal.toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>£{po.total_amount.toFixed(2)}</td>
                    <td style={tdStyle}><StatusBadge status={po.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><ShoppingCart size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No purchase orders</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Purchase orders will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
