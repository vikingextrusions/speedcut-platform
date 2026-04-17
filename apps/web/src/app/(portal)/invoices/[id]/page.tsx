import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info', sent: 'badge-accent', paid: 'badge-success',
    overdue: 'badge-error', void: 'badge-error', partial: 'badge-warning',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_lines ( id, description, quantity, unit_price, total_price, sort_order ),
      orders ( order_number, customer_po_number )
    `)
    .eq('id', id)
    .single()

  if (error || !invoice) notFound()

  const lines = (invoice.invoice_lines || []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <Link href="/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Invoices
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">{invoice.invoice_number}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          {invoice.orders && <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Order: {(invoice.orders as any).order_number}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>£{invoice.total_amount.toFixed(2)}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Inc. VAT</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <InfoCard label="Invoice Date" value={new Date(invoice.invoice_date).toLocaleDateString()} />
        <InfoCard label="Due Date" value={invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'} />
        <InfoCard label="Subtotal" value={`£${invoice.subtotal.toFixed(2)}`} />
        <InfoCard label="VAT" value={`£${invoice.vat_amount.toFixed(2)}`} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Line Items</h2>
        </div>
        {lines.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Qty</th>
                  <th style={thStyle}>Unit Price</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line: any, idx: number) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{line.description}</td>
                    <td style={tdStyle}>{line.quantity}</td>
                    <td style={tdStyle}>£{line.unit_price.toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>£{line.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
        )}
      </div>
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
