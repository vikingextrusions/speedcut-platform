import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ReorderButton } from './reorder-button'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'badge-info', in_production: 'badge-warning', quality_check: 'badge-warning',
    ready_to_ship: 'badge-accent', shipped: 'badge-accent', delivered: 'badge-success',
    completed: 'badge-success', cancelled: 'badge-error',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_lines ( id, description, material, quantity, unit_price, line_status, sort_order )
    `)
    .eq('id', id)
    .single()

  if (error || !order) notFound()

  const lines = (order.order_lines || []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  // Production progress
  const totalLines = lines.length
  const completedLines = lines.filter((l: any) => ['completed', 'delivered', 'shipped'].includes(l.line_status)).length

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          {order.customer_reference && <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Ref: {order.customer_reference}</p>}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>£{order.total_amount.toFixed(2)}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Inc. VAT</p>
          <ReorderButton orderId={order.id} />
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <InfoCard label="Order Date" value={new Date(order.order_date).toLocaleDateString()} />
        <InfoCard label="Required By" value={order.required_date ? new Date(order.required_date).toLocaleDateString() : 'N/A'} />
        <InfoCard label="Subtotal" value={`£${order.subtotal.toFixed(2)}`} />
        <InfoCard label="Progress" value={totalLines > 0 ? `${completedLines}/${totalLines} items` : 'N/A'} />
      </div>

      {/* Production Progress Bar */}
      {totalLines > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Production Progress</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{Math.round((completedLines / totalLines) * 100)}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
            <div style={{
              width: `${(completedLines / totalLines) * 100}%`,
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Order Lines</h2>
        </div>
        {lines.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Material</th>
                  <th style={thStyle}>Qty</th>
                  <th style={thStyle}>Unit Price</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line: any, idx: number) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{line.description}</td>
                    <td style={tdStyle}>{line.material || '—'}</td>
                    <td style={tdStyle}>{line.quantity}</td>
                    <td style={tdStyle}>£{line.unit_price.toFixed(2)}</td>
                    <td style={tdStyle}><StatusBadge status={line.line_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
        )}
      </div>

      {order.notes && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Notes</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{order.notes}</p>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="micro-label" style={{ marginBottom: '0.375rem' }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{value}</p>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
