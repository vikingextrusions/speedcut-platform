import { createClient } from '@/utils/supabase/server'
import { Layers } from 'lucide-react'

export default async function AdminMaterialsPage() {
  const supabase = await createClient()

  const { data: materials } = await supabase
    .from('materials')
    .select('id, name, category, cutting_speed, density, active, created_at')
    .order('name', { ascending: true })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Materials</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configure material types for quoting and manufacturing</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {materials && materials.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Cutting Speed</th>
                  <th style={thStyle}>Density</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{m.name}</td>
                    <td style={tdStyle}><span className="badge badge-accent">{m.category || '—'}</span></td>
                    <td style={tdStyle}>{m.cutting_speed ? `${m.cutting_speed} mm/min` : '—'}</td>
                    <td style={tdStyle}>{m.density ? `${m.density} g/cm³` : '—'}</td>
                    <td style={tdStyle}><span className={`badge ${m.active !== false ? 'badge-success' : 'badge-error'}`}>{m.active !== false ? 'active' : 'inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Layers size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No materials configured</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add materials to use in quoting and manufacturing</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
