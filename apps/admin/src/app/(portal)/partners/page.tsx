import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Factory } from 'lucide-react'

export default async function AdminPartnersPage() {
  const supabase = await createClient()

  const { data: partners } = await supabase
    .from('organizations')
    .select('id, name, account_ref, status, website, created_at')
    .eq('type', 'partner')
    .order('name', { ascending: true })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Partners</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage manufacturing partners</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {partners && partners.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Account Ref</th>
                  <th style={thStyle}>Website</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Created</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <Link href={`/partners/${p.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{p.name}</Link>
                    </td>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.account_ref || '—'}</span></td>
                    <td style={tdStyle}>{p.website ? <a href={p.website} target="_blank" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.website}</a> : '—'}</td>
                    <td style={tdStyle}><span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                    <td style={tdStyle}>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Factory size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No partners</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Partner organisations will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
