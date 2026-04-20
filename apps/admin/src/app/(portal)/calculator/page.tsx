import { createClient } from '@/utils/supabase/server'
import { Calculator } from 'lucide-react'

export default async function AdminCalculatorPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('calculator_settings')
    .select('id, key, value, label, description, created_at')
    .order('key', { ascending: true })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Calculator Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configure pricing parameters for the quoting engine</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {settings && settings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Key</th>
                  <th style={thStyle}>Label</th>
                  <th style={thStyle}>Value</th>
                  <th style={thStyle}>Description</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s: any) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}><code style={{ fontSize: '0.8rem', padding: '0.125rem 0.375rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.25rem', color: 'var(--accent)' }}>{s.key}</code></td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{s.label || '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'monospace' }}>{s.value}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Calculator size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No settings configured</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Calculator pricing parameters will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
