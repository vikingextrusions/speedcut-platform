import { createClient } from '@/utils/supabase/server'
import { User, Building2, MapPin } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Get org membership + org details
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('role, organizations ( id, name, slug, industry, website, phone )')
    .eq('profile_id', user!.id)

  const org = orgMembers?.[0]?.organizations as any

  // Get addresses for the org if available
  const { data: addresses } = org
    ? await supabase
        .from('addresses')
        .select('*')
        .eq('organization_id', org.id)
        .order('is_default', { ascending: false })
    : { data: [] }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out', maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your profile and organization details</p>
      </div>

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(0,217,225,0.1)' }}>
            <User size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Profile</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="label">Full Name</label>
            <input className="input-field" defaultValue={profile?.full_name || ''} readOnly />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="label">Email</label>
            <input className="input-field" defaultValue={user?.email || ''} readOnly style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="label">Phone</label>
            <input className="input-field" defaultValue={profile?.phone || ''} placeholder="No phone number" readOnly />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="label">Role</label>
            <div>
              <span className="badge badge-accent">{profile?.role || 'unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Section */}
      {org && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(59,130,246,0.1)' }}>
              <Building2 size={20} style={{ color: '#3b82f6' }} />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Organization</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Company Name</label>
              <input className="input-field" defaultValue={org.name || ''} readOnly />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Industry</label>
              <input className="input-field" defaultValue={org.industry || ''} placeholder="—" readOnly />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Website</label>
              <input className="input-field" defaultValue={org.website || ''} placeholder="—" readOnly />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Phone</label>
              <input className="input-field" defaultValue={org.phone || ''} placeholder="—" readOnly />
            </div>
          </div>
        </div>
      )}

      {/* Addresses */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(16,185,129,0.1)' }}>
            <MapPin size={20} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Addresses</h2>
        </div>

        {addresses && addresses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {addresses.map((addr: any) => (
              <div
                key={addr.id}
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${addr.is_default ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{addr.type}</span>
                  {addr.is_default && <span className="badge badge-success">Default</span>}
                </div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {addr.line_1}{addr.line_2 ? `, ${addr.line_2}` : ''}<br />
                  {addr.city}, {addr.county} {addr.postcode}<br />
                  {addr.country}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No addresses on file. Contact us to update your delivery addresses.
          </p>
        )}
      </div>
    </div>
  )
}
