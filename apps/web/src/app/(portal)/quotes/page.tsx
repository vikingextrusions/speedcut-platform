import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FilePlus, FileText, Search } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'badge-info',
    submitted: 'badge-info',
    reviewing: 'badge-warning',
    priced: 'badge-accent',
    sent: 'badge-accent',
    accepted: 'badge-success',
    rejected: 'badge-error',
    expired: 'badge-error',
  }
  return (
    <span className={`badge ${colors[status] || 'badge-info'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user!.id)

  const orgIds = orgMembers?.map(om => om.organization_id) || []

  const { data: quotes } = orgIds.length > 0
    ? await supabase
        .from('quotes')
        .select('id, quote_number, status, total_amount, subtotal, vat_amount, quote_date, valid_until, customer_reference, created_at')
        .in('customer_org_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Quotes</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            View and manage your quote requests
          </p>
        </div>
        <Link
          href="/quotes/new"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', textDecoration: 'none' }}
        >
          <FilePlus size={18} />
          New Quote Request
        </Link>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {quotes && quotes.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Quote #</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Reference</th>
                  <th style={thStyle}>Subtotal</th>
                  <th style={thStyle}>VAT</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Valid Until</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' }}
                    className="hover:bg-[var(--bg-primary)]"
                  >
                    <td style={tdStyle}>
                      <Link href={`/quotes/${q.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        {q.quote_number}
                      </Link>
                    </td>
                    <td style={tdStyle}>{new Date(q.quote_date).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--text-muted)' }}>{q.customer_reference || '—'}</span>
                    </td>
                    <td style={tdStyle}>£{q.subtotal.toFixed(2)}</td>
                    <td style={tdStyle}>£{q.vat_amount.toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>£{q.total_amount.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '—'}
                    </td>
                    <td style={tdStyle}><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}>
              <FileText size={48} />
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No quotes yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Submit your first quote request to get started
            </p>
            <Link
              href="/quotes/new"
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', textDecoration: 'none' }}
            >
              <FilePlus size={16} />
              Request a Quote
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '0.875rem 1.25rem',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.875rem 1.25rem',
  whiteSpace: 'nowrap',
}
