import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LineStatusUpdater } from './line-status-updater'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info', confirmed: 'badge-info', in_production: 'badge-warning',
    quality_check: 'badge-warning', ready_to_ship: 'badge-accent', shipped: 'badge-accent',
    delivered: 'badge-success', completed: 'badge-success', cancelled: 'badge-error',
    outstanding: 'badge-info', in_progress: 'badge-warning', on_hold: 'badge-error',
    waiting_material: 'badge-warning', cutting_complete: 'badge-accent', complete: 'badge-success',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function PartnerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, total_amount, subtotal, vat_amount, order_date, required_date,
      customer_reference, notes, currency,
      organizations!orders_customer_org_id_fkey(name),
      order_lines(id, description, material, material_type, quantity, unit_price, line_status, production_line, priority, due_out_date, completed_date, notes, sort_order)
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const lines = (order.order_lines as any[])?.sort((a, b) => a.sort_order - b.sort_order) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 className="page-title">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            {(order as any).organizations?.name || '—'} · Ordered {new Date(order.order_date).toLocaleDateString()}
            {order.required_date && <> · Required by {new Date(order.required_date).toLocaleDateString()}</>}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Line Items */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Line Items</h2>
          </div>
          {lines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {lines.map((line, idx) => (
                <div key={line.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{idx + 1}. {line.description}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {line.material || line.material_type || '—'} · Qty: {line.quantity} · £{Number(line.unit_price).toFixed(2)}/ea
                      </div>
                    </div>
                    <span style={{ fontWeight: 700 }}>£{(line.quantity * line.unit_price).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <LineStatusUpdater lineId={line.id} currentStatus={line.line_status} />
                    {line.due_out_date && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Due: {new Date(line.due_out_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {line.notes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>{line.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>£{order.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>VAT</span>
                <span>£{order.vat_amount.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>£{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.customer_reference && (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Customer Ref</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{order.customer_reference}</p>
            </div>
          )}

          {order.notes && (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
