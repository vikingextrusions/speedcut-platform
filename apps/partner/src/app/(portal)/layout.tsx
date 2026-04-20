import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PortalShell } from './portal-shell'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify the user has partner or admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'partner' && profile.role !== 'admin')) {
    redirect('/unauthorized')
  }

  return <PortalShell>{children}</PortalShell>
}
