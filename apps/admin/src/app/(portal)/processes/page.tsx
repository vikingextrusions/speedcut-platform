import { createClient } from '@/utils/supabase/server'
import { Wrench } from 'lucide-react'

export default async function AdminProcessesPage() {
  const supabase = await createClient()

  const { data: processes } = await supabase
    .from('manufacturing_processes')
    .select('id, name, description, icon, active, created_at')
    .order('name', { ascending: true })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Manufacturing Processes</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configure available manufacturing process types</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {processes && processes.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Icon</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description || '—'}</td>
                    <td style={tdStyle}>{p.icon || '—'}</td>
                    <td style={tdStyle}><span className={`badge ${p.active !== false ? 'badge-success' : 'badge-error'}`}>{p.active !== false ? 'active' : 'inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Wrench size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No processes configured</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add manufacturing processes to offer on the platform</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
