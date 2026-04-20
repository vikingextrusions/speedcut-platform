import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { AssignmentActions } from './assignment-actions'

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: assignment } = await supabase
    .from('quote_assignments')
    .select(`
      id, status, partner_price, notes, responded_at, created_at,
      quotes(
        id, quote_number, total_amount, subtotal, vat_amount, status, customer_reference, material_type, notes, quote_date, valid_until,
        organizations!quotes_customer_org_id_fkey(name),
        quote_items(id, description, material, material_type, quantity, unit_price, total_price, lead_time, sort_order)
      )
    `)
    .eq('id', id)
    .single()

  if (!assignment) notFound()

  const quote = assignment.quotes as any
  const items = quote?.quote_items?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={quote?.quote_number || 'Assignment'}
        subtitle={`From ${quote?.organizations?.name || 'Unknown Customer'} · Received ${new Date(assignment.created_at).toLocaleDateString()}`}
        backHref="/assignments"
        backLabel="Back to Assignments"
        badge={<StatusBadge status={assignment.status} />}
      />

      <DetailLayout
        sidebar={
          <>
            <AssignmentActions
              assignmentId={assignment.id}
              status={assignment.status}
              currentPrice={assignment.partner_price ? Number(assignment.partner_price) : undefined}
              currentNotes={assignment.notes || ''}
            />

            {assignment.responded_at && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Response</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Responded</span>
                    <span>{new Date(assignment.responded_at).toLocaleDateString()}</span>
                  </div>
                  {assignment.partner_price && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Your Price</span>
                      <span style={{ fontWeight: 700 }}>£{Number(assignment.partner_price).toFixed(2)}</span>
                    </div>
                  )}
                  {assignment.notes && (
                    <div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Notes</p>
                      <p style={{ color: 'var(--text-secondary)' }}>{assignment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        }
      >
        {/* Quote Info */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Quote Details</h2>
          </div>
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Material</p>
              <p style={{ fontWeight: 600 }}>{quote?.material_type || '—'}</p>
            </div>
            <div>
              <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Quote Date</p>
              <p style={{ fontWeight: 600 }}>{quote?.quote_date ? new Date(quote.quote_date).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Valid Until</p>
              <p style={{ fontWeight: 600 }}>{quote?.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Customer Ref</p>
              <p style={{ fontWeight: 600 }}>{quote?.customer_reference || '—'}</p>
            </div>
            <div>
              <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Subtotal</p>
              <p style={{ fontWeight: 600 }}>£{quote?.subtotal?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Total (inc. VAT)</p>
              <p style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--accent)' }}>£{quote?.total_amount?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          {quote?.notes && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <p className="micro-label" style={{ marginBottom: '0.5rem' }}>Notes</p>
              {quote.notes}
            </div>
          )}
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
                    {['#', 'Description', 'Material', 'Qty', 'Unit Price', 'Total', 'Lead Time'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.875rem 1.25rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.875rem 1.25rem', maxWidth: '300px', whiteSpace: 'normal' }}>{item.description}</td>
                      <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>{item.material || item.material_type || '—'}</td>
                      <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>{item.quantity}</td>
                      <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>£{Number(item.unit_price).toFixed(2)}</td>
                      <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap', fontWeight: 600 }}>£{Number(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                      <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>{item.lead_time || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
          )}
        </div>
      </DetailLayout>
    </div>
  )
}
