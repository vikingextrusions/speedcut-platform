import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSettingsForm } from './settings-form'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your admin profile</p>
      </div>
      <div style={{ maxWidth: '640px' }}>
        <AdminSettingsForm
          userId={user.id}
          email={user.email || ''}
          fullName={profile?.full_name || ''}
          phone={profile?.phone || ''}
        />
      </div>
    </div>
  )
}
