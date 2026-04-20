import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FileCheck, Clock, CheckCircle2, XCircle, Filter } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    accepted: 'badge-success',
    declined: 'badge-error',
    completed: 'badge-success',
  }
  return (
    <span className={`badge ${colors[status] || 'badge-info'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params?.status
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user!.id)
  const orgIds = orgMembers?.map(om => om.organization_id) || []

  let query = supabase
    .from('quote_assignments')
    .select(`
      id, status, partner_price, notes, responded_at, created_at,
      quotes(id, quote_number, total_amount, status, customer_reference, material_type,
        organizations!quotes_customer_org_id_fkey(name)
      )
    `)
    .in('partner_org_id', orgIds)
    .order('created_at', { ascending: false })

  if (statusFilter && ['pending', 'accepted', 'declined', 'completed'].includes(statusFilter)) {
    query = query.eq('status', statusFilter as 'pending' | 'accepted' | 'declined' | 'completed')
  }

  const { data: assignments } = orgIds.length > 0
    ? await query
    : { data: [] }

  const statuses = ['pending', 'accepted', 'declined', 'completed']

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Assignments</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Quote assignments from Speedcut
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link
          href="/assignments"
          className={!statusFilter ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', textDecoration: 'none' }}
        >
          All
        </Link>
        {statuses.map(s => (
          <Link
            key={s}
            href={`/assignments?status=${s}`}
            className={statusFilter === s ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', textDecoration: 'none', textTransform: 'capitalize' }}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {assignments && assignments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Quote #</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Material</th>
                  <th style={thStyle}>Quote Value</th>
                  <th style={thStyle}>Your Price</th>
                  <th style={thStyle}>Received</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <Link href={`/assignments/${a.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        {a.quotes?.quote_number || '—'}
                      </Link>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--text-secondary)' }}>{a.quotes?.organizations?.name || '—'}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--text-muted)' }}>{a.quotes?.material_type || '—'}</span>
                    </td>
                    <td style={tdStyle}>
                      £{a.quotes?.total_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {a.partner_price ? `£${Number(a.partner_price).toFixed(2)}` : '—'}
                    </td>
                    <td style={tdStyle}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}>
              <FileCheck size={48} />
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No assignments found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {statusFilter
                ? `No ${statusFilter} assignments. Try a different filter.`
                : 'Assignments will appear here when Speedcut sends work your way.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
