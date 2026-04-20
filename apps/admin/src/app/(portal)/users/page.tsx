import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, phone, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Users</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage platform user accounts</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {profiles && profiles.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p: any) => {
                  const roleColors: Record<string, string> = { admin: 'badge-warning', partner: 'badge-info', customer: 'badge-accent' }
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdStyle}><span style={{ fontWeight: 600 }}>{p.full_name || '—'}</span></td>
                      <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{p.email}</span></td>
                      <td style={tdStyle}><span className={`badge ${roleColors[p.role] || 'badge-info'}`}>{p.role}</span></td>
                      <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{p.phone || '—'}</span></td>
                      <td style={tdStyle}><span className={`badge ${p.is_active !== false ? 'badge-success' : 'badge-error'}`}>{p.is_active !== false ? 'active' : 'inactive'}</span></td>
                      <td style={tdStyle}>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Users size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No users</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>User profiles will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
