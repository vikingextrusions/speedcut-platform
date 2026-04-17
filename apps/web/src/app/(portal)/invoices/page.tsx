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

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user!.id)
  const orgIds = orgMembers?.map(om => om.organization_id) || []

  // Invoices are linked through orders → customer_org_id
  const { data: invoices } = orgIds.length > 0
    ? await supabase
        .from('invoices')
        .select('id, invoice_number, status, total_amount, invoice_date, due_date, paid_date, orders!inner(customer_org_id)')
        .in('orders.customer_org_id', orgIds)
        .order('invoice_date', { ascending: false })
    : { data: [] }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Invoices</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>View and track your invoices and payments</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {invoices && invoices.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Invoice #</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Paid</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-[var(--bg-primary)]">
                    <td style={tdStyle}>
                      <Link href={`/invoices/${inv.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td style={tdStyle}>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>£{inv.total_amount.toFixed(2)}</td>
                    <td style={tdStyle}>{inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : '—'}</td>
                    <td style={tdStyle}><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Receipt size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No invoices yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Invoices will appear here once orders are processed</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
