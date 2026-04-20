'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Save, User } from 'lucide-react'

export function AdminSettingsForm({
  userId, email, fullName, phone,
}: {
  userId: string; email: string; fullName: string; phone: string
}) {
  const router = useRouter()
  const [name, setName] = useState(fullName)
  const [phoneNumber, setPhoneNumber] = useState(phone)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ full_name: name, phone: phoneNumber || null }).eq('id', userId)
    if (error) { alert('Error: ' + error.message) } else { setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Profile</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label className="label" style={{ marginBottom: '0.375rem', display: 'block' }}>Email</label>
          <input type="email" className="input-field" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
        <div>
          <label className="label" style={{ marginBottom: '0.375rem', display: 'block' }}>Full Name</label>
          <input type="text" className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" style={{ marginBottom: '0.375rem', display: 'block' }}>Phone</label>
          <input type="tel" className="input-field" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', fontSize: '0.875rem', opacity: saving ? 0.7 : 1 }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  )
}
