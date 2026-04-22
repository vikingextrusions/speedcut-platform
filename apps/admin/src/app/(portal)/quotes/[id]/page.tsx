import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { QuoteStatusActions } from './quote-actions'
import { AssignPartnerPanel } from './assign-partner'

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: quote }, { data: partnerOrgs }] = await Promise.all([
    supabase
      .from('quotes')
      .select(`
        id, quote_number, status, subtotal, vat_amount, total_amount, quote_date, valid_until,
        customer_reference, material_type, notes, internal_notes, vat_rate, created_at,
        organizations!quotes_customer_org_id_fkey(id, name),
        profiles!quotes_contact_id_fkey(id, full_name, email, phone),
        quote_items(id, description, material, material_type, quantity, unit_price, total_price, lead_time, sort_order),
        quote_assignments(id, status, partner_price, notes, responded_at, created_at,
          organizations!quote_assignments_partner_org_id_fkey(name)
        )
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('organizations')
      .select('id, name')
      .eq('type', 'partner')
      .eq('status', 'active')
      .order('name'),
  ])

  if (!quote) notFound()

  const items = (quote.quote_items as any[])?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
  const assignments = (quote.quote_assignments as any[]) || []
  const partners = (partnerOrgs || []) as { id: string; name: string }[]

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={quote.quote_number}
        subtitle={`${(quote.organizations as any)?.name || '—'} · ${quote.quote_date ? new Date(quote.quote_date).toLocaleDateString() : '—'}`}
        backHref="/quotes"
        backLabel="Back to Quotes"
        badge={<StatusBadge status={quote.status} />}
      />

      <DetailLayout
        sidebar={
          <>
            {/* Status Actions */}
            <QuoteStatusActions quoteId={quote.id} currentStatus={quote.status} />

            {/* Summary */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Subtotal" value={`£${quote.subtotal.toFixed(2)}`} />
                <Row label={`VAT (${quote.vat_rate || 20}%)`} value={`£${quote.vat_amount.toFixed(2)}`} />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>£{quote.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Customer Ref" value={quote.customer_reference || '—'} />
                <Row label="Material" value={quote.material_type || '—'} />
                <Row label="Valid Until" value={quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '—'} />
                <Row label="Created" value={new Date(quote.created_at).toLocaleDateString()} />
                {(quote.profiles as any)?.full_name && (
                  <Row label="Contact" value={(quote.profiles as any).full_name} />
                )}
              </div>
            </div>

            {/* Partner Assignment */}
            <AssignPartnerPanel
              quoteId={quote.id}
              partners={partners}
              assignments={assignments}
            />
          </>
        }
      >
        {/* Line Items */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Line Items ({items.length})</h2>
          </div>
          {items.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Description', 'Material', 'Qty', 'Unit Price', 'Total', 'Lead Time'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'normal', maxWidth: '300px' }}>{item.description}</td>
                      <td style={tdStyle}>{item.material || item.material_type || '—'}</td>
                      <td style={tdStyle}>{item.quantity}</td>
                      <td style={tdStyle}>£{Number(item.unit_price).toFixed(2)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>£{Number(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                      <td style={tdStyle}>{item.lead_time || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
          )}
        </div>

        {/* Notes */}
        {(quote.notes || quote.internal_notes) && (
          <div className="card">
            {quote.notes && (
              <div style={{ marginBottom: quote.internal_notes ? '1.5rem' : 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Customer Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{quote.notes}</p>
              </div>
            )}
            {quote.internal_notes && (
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f59e0b' }}>🔒 Internal Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{quote.internal_notes}</p>
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
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
