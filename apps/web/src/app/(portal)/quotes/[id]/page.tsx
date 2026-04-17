import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info', submitted: 'badge-info', reviewing: 'badge-warning',
    priced: 'badge-accent', sent: 'badge-accent', accepted: 'badge-success',
    rejected: 'badge-error', expired: 'badge-error',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_items (
        id, description, material, material_type, quantity, unit_price, total_price, sort_order, lead_time,
        manufacturing_processes ( name )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !quote) notFound()

  const items = (quote.quote_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Back link */}
      <Link href="/quotes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">{quote.quote_number}</h1>
            <StatusBadge status={quote.status} />
          </div>
          {quote.customer_reference && (
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Ref: {quote.customer_reference}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            £{quote.total_amount.toFixed(2)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Inc. VAT</p>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <InfoCard label="Quote Date" value={new Date(quote.quote_date).toLocaleDateString()} />
        <InfoCard label="Valid Until" value={quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'} />
        <InfoCard label="Subtotal" value={`£${quote.subtotal.toFixed(2)}`} />
        <InfoCard label="VAT (${quote.vat_rate}%)" value={`£${quote.vat_amount.toFixed(2)}`} />
      </div>

      {/* Line Items */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Line Items</h2>
        </div>
        {items.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Material</th>
                  <th style={thStyle}>Process</th>
                  <th style={thStyle}>Qty</th>
                  <th style={thStyle}>Unit Price</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Lead Time</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={{ ...tdStyle, maxWidth: '300px' }}>{item.description}</td>
                    <td style={tdStyle}>{item.material || '—'}</td>
                    <td style={tdStyle}>{item.manufacturing_processes?.name || '—'}</td>
                    <td style={tdStyle}>{item.quantity}</td>
                    <td style={tdStyle}>£{item.unit_price.toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>£{(item.total_price || item.unit_price * item.quantity).toFixed(2)}</td>
                    <td style={tdStyle}>{item.lead_time || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No line items
          </div>
        )}
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Notes</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {quote.notes}
          </p>
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

const thStyle: React.CSSProperties = {
  padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem',
  textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)',
}
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
