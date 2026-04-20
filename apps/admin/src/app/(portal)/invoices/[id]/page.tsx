import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { InvoiceStatusActions } from './invoice-actions'

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, subtotal, vat_amount, total_amount, invoice_date, due_date, paid_date,
      payment_terms, notes, currency, created_at,
      organizations!invoices_customer_org_id_fkey(id, name),
      orders(id, order_number),
      invoice_lines(id, description, quantity, unit_price, total_price, sort_order),
      credit_notes(id, cn_number, status, total_amount)
    `)
    .eq('id', id)
    .single()

  if (!invoice) notFound()

  const lines = (invoice.invoice_lines as any[])?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
  const creditNotes = (invoice.credit_notes as any[]) || []
  const isOverdue = invoice.status === 'sent' && invoice.due_date && new Date(invoice.due_date) < new Date()

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={invoice.invoice_number}
        subtitle={`${(invoice.organizations as any)?.name || '—'} · Issued ${new Date(invoice.invoice_date).toLocaleDateString()}`}
        backHref="/invoices"
        backLabel="Back to Invoices"
        badge={<StatusBadge status={isOverdue ? 'overdue' : invoice.status} />}
      />

      <DetailLayout
        sidebarWidth="340px"
        sidebar={
          <>
            <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />

            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Payment Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Subtotal" value={`£${invoice.subtotal.toFixed(2)}`} />
                <Row label="VAT" value={`£${invoice.vat_amount.toFixed(2)}`} />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>£{invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Due Date" value={invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'} />
                {invoice.paid_date && <Row label="Paid Date" value={new Date(invoice.paid_date).toLocaleDateString()} />}
                <Row label="Payment Terms" value={invoice.payment_terms || '—'} />
                {(invoice.orders as any)?.order_number && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Order</span>
                    <Link href={`/orders/${(invoice.orders as any)?.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                      {(invoice.orders as any).order_number}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {creditNotes.length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Credit Notes</h3>
                {creditNotes.map((cn: any) => (
                  <Link key={cn.id} href={`/credit-notes/${cn.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{cn.cn_number}</span>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>-£{cn.total_amount.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            )}
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
                    {['#', 'Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line: any, idx: number) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'normal', maxWidth: '350px' }}>{line.description}</td>
                      <td style={tdStyle}>{line.quantity}</td>
                      <td style={tdStyle}>£{Number(line.unit_price).toFixed(2)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>£{Number(line.total_price || line.quantity * line.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
          )}
        </div>

        {invoice.notes && (
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{invoice.notes}</p>
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
