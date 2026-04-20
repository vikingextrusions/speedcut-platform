import { createClient } from '@/utils/supabase/server'
import { Activity } from 'lucide-react'

export default async function AdminActivityPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('activity_log')
    .select('id, action, entity_type, entity_id, changes, created_at, profiles!activity_log_actor_id_fkey(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Activity Log</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Audit trail of all platform activity</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {logs && logs.length > 0 ? (
          <div>
            {logs.map((log: any) => (
              <div key={log.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700 }}>{log.profiles?.full_name || log.profiles?.email || 'System'}</span>
                    <span style={{ color: 'var(--text-muted)' }}> {log.action} </span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{log.entity_type}</span>
                    {log.entity_id && (
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                        {log.entity_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {JSON.stringify(log.changes, null, 0).slice(0, 200)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><Activity size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No activity yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Activity will be logged here as users interact with the platform</p>
          </div>
        )}
      </div>
    </div>
  )
}
