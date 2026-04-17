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

  return <PortalShell>{children}</PortalShell>
}
