import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info', issued: 'badge-accent', allocated: 'badge-success', void: 'badge-error',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function AdminCreditNotesPage() {
  const supabase = await createClient()

  const { data: creditNotes } = await supabase
    .from('credit_notes')
    .select(`
      id, credit_note_number, status, total_amount, date, notes,
      invoices(invoice_number),
      organizations!credit_notes_customer_org_id_fkey(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Credit Notes</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage credit notes and refunds</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {creditNotes && creditNotes.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>CN #</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Invoice</th>
                  <th style={thStyle}>Notes</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {creditNotes.map((cn: any) => (
                  <tr key={cn.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <Link href={`/credit-notes/${cn.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{cn.credit_note_number}</Link>
                    </td>
                    <td style={tdStyle}>{cn.organizations?.name || '—'}</td>
                    <td style={tdStyle}>{cn.invoices?.invoice_number || '—'}</td>
                    <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cn.notes || '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#ef4444' }}>-£{cn.total_amount.toFixed(2)}</td>
                    <td style={tdStyle}>{cn.date ? new Date(cn.date).toLocaleDateString() : '—'}</td>
                    <td style={tdStyle}><StatusBadge status={cn.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><CreditCard size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No credit notes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Credit notes will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
