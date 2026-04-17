import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logout } from '../login/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Admin Console</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Welcome back, {profile?.full_name || user.email}
          </p>
        </div>
        <form>
          <button formAction={logout} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Sign Out
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Session Info</h2>
        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Email</span>
            <span>{user.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Role</span>
            <span className="badge badge-accent">{profile?.role || 'unknown'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>User ID</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{user.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
