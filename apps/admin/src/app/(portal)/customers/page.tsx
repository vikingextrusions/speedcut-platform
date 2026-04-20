import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Building2, Plus, Search } from 'lucide-react'

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('organizations')
    .select('id, name, account_ref, status, website, created_at')
    .eq('type', 'customer')
    .order('name', { ascending: true })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage customer organisations</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {customers && customers.length > 0 ? (
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
                {customers.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <Link href={`/customers/${c.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{c.name}</Link>
                    </td>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.account_ref || '—'}</span></td>
                    <td style={tdStyle}>{c.website ? <a href={c.website} target="_blank" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.website}</a> : '—'}</td>
                    <td style={tdStyle}><span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                    <td style={tdStyle}>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Building2 size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No customers</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Customer organisations will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
