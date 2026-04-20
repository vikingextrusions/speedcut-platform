import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { POStatusActions } from './po-actions'

export default async function AdminPODetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: po } = await supabase
    .from('purchase_orders')
    .select(`
      id, po_number, status, subtotal, vat_amount, total_amount, order_date, delivery_date,
      notes, created_at,
      organizations!purchase_orders_supplier_org_id_fkey(id, name),
      purchase_lines(id, description, part_number, quantity, unit_price, sort_order)
    `)
    .eq('id', id)
    .single()

  if (!po) notFound()

  const lines = (po.purchase_lines as any[])?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={po.po_number}
        subtitle={`${(po.organizations as any)?.name || '—'} · Raised ${new Date(po.order_date).toLocaleDateString()}`}
        backHref="/purchase-orders"
        backLabel="Back to Purchase Orders"
        badge={<StatusBadge status={po.status} />}
      />

      <DetailLayout
        sidebarWidth="340px"
        sidebar={
          <>
            <POStatusActions poId={po.id} currentStatus={po.status} />

            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Subtotal" value={`£${po.subtotal.toFixed(2)}`} />
                <Row label="VAT" value={`£${po.vat_amount.toFixed(2)}`} />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>£{po.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Supplier" value={(po.organizations as any)?.name || '—'} />
                <Row label="Delivery Date" value={po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : '—'} />
                <Row label="Created" value={new Date(po.created_at).toLocaleDateString()} />
              </div>
            </div>
          </>
        }
      >
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Line Items ({lines.length})</h2>
          </div>
          {lines.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Description', 'Part #', 'Qty', 'Unit Price', 'Total'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line: any, idx: number) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'normal', maxWidth: '350px' }}>{line.description}</td>
                      <td style={tdStyle}>{line.part_number || '—'}</td>
                      <td style={tdStyle}>{line.quantity}</td>
                      <td style={tdStyle}>£{Number(line.unit_price).toFixed(2)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>£{(line.quantity * line.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
          )}
        </div>

        {po.notes && (
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{po.notes}</p>
          </div>
        )}
      </DetailLayout>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
