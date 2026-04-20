import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { OrderStatusActions } from './order-actions'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, subtotal, vat_amount, total_amount, order_date, required_date,
      customer_reference, notes, internal_notes, currency, created_at,
      organizations!orders_customer_org_id_fkey(id, name),
      order_lines(id, description, material, material_type, quantity, unit_price, line_status, production_line, priority, due_out_date, completed_date, notes, sort_order),
      invoices(id, invoice_number, status, total_amount),
      delivery_notes(id, dn_number, status, delivery_date)
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const lines = (order.order_lines as any[])?.sort((a, b) => a.sort_order - b.sort_order) || []
  const invoices = (order.invoices as any[]) || []
  const dns = (order.delivery_notes as any[]) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={order.order_number}
        subtitle={`${(order.organizations as any)?.name || '—'} · Ordered ${new Date(order.order_date).toLocaleDateString()}${order.required_date ? ` · Due ${new Date(order.required_date).toLocaleDateString()}` : ''}`}
        backHref="/orders"
        backLabel="Back to Orders"
        badge={<StatusBadge status={order.status} />}
      />

      <DetailLayout
        sidebarWidth="340px"
        sidebar={
          <>
            <OrderStatusActions orderId={order.id} currentStatus={order.status} />

            {/* Summary */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Subtotal" value={`£${order.subtotal.toFixed(2)}`} />
                <Row label="VAT" value={`£${order.vat_amount.toFixed(2)}`} />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>£{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Linked Invoices */}
            {invoices.length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Invoices</h3>
                {invoices.map((inv: any) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{inv.invoice_number}</span>
                    <StatusBadge status={inv.status} />
                  </Link>
                ))}
              </div>
            )}

            {/* Linked DNs */}
            {dns.length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Delivery Notes</h3>
                {dns.map((dn: any) => (
                  <Link key={dn.id} href={`/delivery-notes/${dn.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{dn.dn_number}</span>
                    <StatusBadge status={dn.status} />
                  </Link>
                ))}
              </div>
            )}

            {order.customer_reference && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Customer Ref</h3>
                <p style={{ fontSize: '0.875rem' }}>{order.customer_reference}</p>
              </div>
            )}
          </>
        }
      >
        {/* Line Items */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Line Items ({lines.length})</h2>
          </div>
          {lines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {lines.map((line, idx) => (
                <div key={line.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{idx + 1}. {line.description}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {line.material || line.material_type || '—'} · Qty: {line.quantity} · £{Number(line.unit_price).toFixed(2)}/ea
                      </div>
                    </div>
                    <span style={{ fontWeight: 700 }}>£{(line.quantity * line.unit_price).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <StatusBadge status={line.line_status || 'outstanding'} />
                    {line.production_line && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Line: {line.production_line}</span>}
                    {line.due_out_date && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {new Date(line.due_out_date).toLocaleDateString()}</span>}
                    {line.completed_date && <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>✓ {new Date(line.completed_date).toLocaleDateString()}</span>}
                  </div>
                  {line.notes && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>{line.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
          )}
        </div>

        {/* Notes */}
        {(order.notes || order.internal_notes) && (
          <div className="card">
            {order.notes && (
              <div style={{ marginBottom: order.internal_notes ? '1.5rem' : 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{order.notes}</p>
              </div>
            )}
            {order.internal_notes && (
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f59e0b' }}>🔒 Internal Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{order.internal_notes}</p>
              </div>
            )}
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
