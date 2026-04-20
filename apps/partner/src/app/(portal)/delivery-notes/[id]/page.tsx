import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DeliveryNoteActions } from './dn-actions'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'badge-warning', dispatched: 'badge-accent', delivered: 'badge-success', signed: 'badge-success',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function PartnerDeliveryNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: dn } = await supabase
    .from('delivery_notes')
    .select(`
      id, dn_number, status, delivery_date, delivery_address, shipped_via, tracking_number, notes, created_at,
      orders(order_number, customer_reference, organizations!orders_customer_org_id_fkey(name)),
      delivery_note_lines(id, description, quantity, sort_order)
    `)
    .eq('id', id)
    .single()

  if (!dn) notFound()

  const lines = (dn.delivery_note_lines as any[])?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <Link href="/delivery-notes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Delivery Notes
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 className="page-title">{dn.dn_number}</h1>
            <StatusBadge status={dn.status} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Order: {(dn.orders as any)?.order_number || '—'} · {(dn.orders as any)?.organizations?.name || '—'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
        {/* Lines */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Items</h2>
          </div>
          {lines.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line: any, idx: number) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'normal' }}>{line.description}</td>
                      <td style={tdStyle}>{line.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items</div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <DeliveryNoteActions
            dnId={dn.id}
            status={dn.status}
            currentShippedVia={dn.shipped_via || ''}
            currentTrackingNumber={dn.tracking_number || ''}
          />

          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Delivery Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Delivery Date</p>
                <p>{new Date(dn.delivery_date).toLocaleDateString()}</p>
              </div>
              {dn.delivery_address && (
                <div>
                  <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Address</p>
                  <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{dn.delivery_address}</p>
                </div>
              )}
              {dn.shipped_via && (
                <div>
                  <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Shipped Via</p>
                  <p>{dn.shipped_via}</p>
                </div>
              )}
              {dn.tracking_number && (
                <div>
                  <p className="micro-label" style={{ marginBottom: '0.25rem' }}>Tracking #</p>
                  <p style={{ fontFamily: 'monospace' }}>{dn.tracking_number}</p>
                </div>
              )}
            </div>
          </div>

          {dn.notes && (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{dn.notes}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 360px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
