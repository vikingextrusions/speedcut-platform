import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Receipt } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info', sent: 'badge-accent', paid: 'badge-success',
    overdue: 'badge-error', void: 'badge-error', partial: 'badge-warning',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function AdminInvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, subtotal, vat_amount, total_amount, invoice_date, due_date,
      orders(organizations!orders_customer_org_id_fkey(name))
    `)
    .order('created_at', { ascending: false })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Invoices</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage billing and payments</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {invoices && invoices.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Invoice #</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Subtotal</th>
                  <th style={thStyle}>VAT</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => {
                  const isOverdue = inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: isOverdue ? 'rgba(239,68,68,0.03)' : undefined }}>
                      <td style={tdStyle}>
                        <Link href={`/invoices/${inv.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{inv.invoice_number}</Link>
                      </td>
                      <td style={tdStyle}>{inv.orders?.organizations?.name || '—'}</td>
                      <td style={tdStyle}>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, color: isOverdue ? '#ef4444' : undefined, fontWeight: isOverdue ? 700 : undefined }}>
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td style={tdStyle}>£{inv.subtotal.toFixed(2)}</td>
                      <td style={tdStyle}>£{inv.vat_amount.toFixed(2)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>£{inv.total_amount.toFixed(2)}</td>
                      <td style={tdStyle}><StatusBadge status={isOverdue ? 'overdue' : inv.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Receipt size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No invoices</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Invoices will appear here once orders are billed</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
