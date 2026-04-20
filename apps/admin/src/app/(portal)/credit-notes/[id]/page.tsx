import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'

export default async function AdminCreditNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cn } = await supabase
    .from('credit_notes')
    .select(`
      id, cn_number, status, subtotal, vat_amount, total_amount, cn_date, reason, notes, created_at,
      organizations!credit_notes_customer_org_id_fkey(id, name),
      invoices(id, invoice_number),
      credit_note_lines(id, description, quantity, unit_price, total_price, sort_order)
    `)
    .eq('id', id)
    .single()

  if (!cn) notFound()

  const lines = (cn.credit_note_lines as any[])?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={cn.cn_number}
        subtitle={`${(cn.organizations as any)?.name || '—'} · Issued ${new Date(cn.cn_date).toLocaleDateString()}`}
        backHref="/credit-notes"
        backLabel="Back to Credit Notes"
        badge={<StatusBadge status={cn.status} />}
      />

      <DetailLayout
        sidebarWidth="340px"
        sidebar={
          <>
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Subtotal" value={`-£${cn.subtotal.toFixed(2)}`} />
                <Row label="VAT" value={`-£${cn.vat_amount.toFixed(2)}`} />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total Credit</span>
                  <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>-£{cn.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                {(cn.invoices as any)?.invoice_number && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Invoice</span>
                    <Link href={`/invoices/${(cn.invoices as any)?.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                      {(cn.invoices as any).invoice_number}
                    </Link>
                  </div>
                )}
                <Row label="Created" value={new Date(cn.created_at).toLocaleDateString()} />
              </div>
            </div>

            {cn.reason && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Reason</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{cn.reason}</p>
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
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#ef4444' }}>-£{Number(line.total_price || line.quantity * line.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items</div>
          )}
        </div>

        {cn.notes && (
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{cn.notes}</p>
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
