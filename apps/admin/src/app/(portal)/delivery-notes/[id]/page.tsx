import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { DNStatusActions } from './dn-actions'

export default async function AdminDNDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: dn } = await supabase
    .from('delivery_notes')
    .select(`
      id, dn_number, status, delivery_date, dispatch_date, shipped_via, tracking_number,
      delivery_address, special_instructions, notes, created_at,
      orders(id, order_number, organizations!orders_customer_org_id_fkey(name)),
      delivery_note_lines(id, description, quantity, sort_order),
      delivery_signatures(id, signer_name, signed_at)
    `)
    .eq('id', id)
    .single()

  if (!dn) notFound()

  const lines = (dn.delivery_note_lines as any[])?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
  const signatures = (dn.delivery_signatures as any[]) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={dn.dn_number}
        subtitle={`${(dn.orders as any)?.organizations?.name || '—'} · Order ${(dn.orders as any)?.order_number || '—'}`}
        backHref="/delivery-notes"
        backLabel="Back to Delivery Notes"
        badge={<StatusBadge status={dn.status} />}
      />

      <DetailLayout
        sidebarWidth="340px"
        sidebar={
          <>
            <DNStatusActions dnId={dn.id} currentStatus={dn.status} />

            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Delivery Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Row label="Delivery Date" value={dn.delivery_date ? new Date(dn.delivery_date).toLocaleDateString() : '—'} />
                <Row label="Dispatched" value={dn.dispatch_date ? new Date(dn.dispatch_date).toLocaleDateString() : '—'} />
                <Row label="Shipped Via" value={dn.shipped_via || '—'} />
                <Row label="Tracking" value={dn.tracking_number || '—'} />
              </div>
            </div>

            {dn.delivery_address && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Delivery Address</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{dn.delivery_address}</p>
              </div>
            )}

            {(dn.orders as any)?.order_number && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Linked Order</h3>
                <Link href={`/orders/${(dn.orders as any)?.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                  {(dn.orders as any).order_number} →
                </Link>
              </div>
            )}

            {signatures.length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Signatures</h3>
                {signatures.map((sig: any) => (
                  <div key={sig.id} style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{sig.signer_name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{new Date(sig.signed_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        }
      >
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Delivery Items ({lines.length})</h2>
          </div>
          {lines.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Description', 'Qty'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line: any, idx: number) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'normal', maxWidth: '400px' }}>{line.description}</td>
                      <td style={tdStyle}>{line.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No delivery items</div>
          )}
        </div>

        {(dn.special_instructions || dn.notes) && (
          <div className="card">
            {dn.special_instructions && (
              <div style={{ marginBottom: dn.notes ? '1.5rem' : 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Special Instructions</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{dn.special_instructions}</p>
              </div>
            )}
            {dn.notes && (
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{dn.notes}</p>
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

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
