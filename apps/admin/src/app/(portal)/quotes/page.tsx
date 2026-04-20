import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FileText, Plus } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info', submitted: 'badge-info', reviewing: 'badge-warning',
    priced: 'badge-accent', sent: 'badge-accent', accepted: 'badge-success',
    rejected: 'badge-error', expired: 'badge-error',
  }
  return <span className={`badge ${colors[status] || 'badge-info'}`}>{status.replace(/_/g, ' ')}</span>
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params?.status
  const supabase = await createClient()

  let query = supabase
    .from('quotes')
    .select(`
      id, quote_number, status, subtotal, total_amount, quote_date, valid_until, customer_reference, material_type,
      organizations!quotes_customer_org_id_fkey(name),
      profiles!quotes_contact_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && ['draft','submitted','reviewing','priced','sent','accepted','rejected','expired'].includes(statusFilter)) {
    query = query.eq('status', statusFilter as any)
  }

  const { data: quotes } = await query

  const statuses = ['draft', 'submitted', 'reviewing', 'priced', 'sent', 'accepted', 'rejected', 'expired']

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Quotes</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage all customer quotes</p>
        </div>
        <Link href="/quotes/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none' }}>
          <Plus size={18} /> New Quote
        </Link>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/quotes" className={!statusFilter ? 'btn-primary' : 'btn-ghost'} style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', textDecoration: 'none' }}>All</Link>
        {statuses.map(s => (
          <Link key={s} href={`/quotes?status=${s}`} className={statusFilter === s ? 'btn-primary' : 'btn-ghost'} style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', textDecoration: 'none', textTransform: 'capitalize' }}>{s}</Link>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {quotes && quotes.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Quote #</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Material</th>
                  <th style={thStyle}>Subtotal</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q: any) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <Link href={`/quotes/${q.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{q.quote_number}</Link>
                    </td>
                    <td style={tdStyle}>{q.organizations?.name || '—'}</td>
                    <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{q.profiles?.full_name || '—'}</span></td>
                    <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{q.material_type || '—'}</span></td>
                    <td style={tdStyle}>£{q.subtotal?.toFixed(2) || '0.00'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>£{q.total_amount?.toFixed(2) || '0.00'}</td>
                    <td style={tdStyle}>{q.quote_date ? new Date(q.quote_date).toLocaleDateString() : '—'}</td>
                    <td style={tdStyle}><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><FileText size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No quotes found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {statusFilter ? `No ${statusFilter} quotes. Try a different filter.` : 'Create your first quote to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
