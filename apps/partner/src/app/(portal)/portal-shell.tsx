'use client'

import { SharedShell } from '@speedcut/ui/shared-shell'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileCheck,
  Package,
  Truck,
  FolderOpen,
  Settings,
} from 'lucide-react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    label: 'Jobs',
    items: [
      { title: 'Assignments', href: '/assignments', icon: <FileCheck size={20} /> },
      { title: 'Orders', href: '/orders', icon: <Package size={20} /> },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { title: 'Delivery Notes', href: '/delivery-notes', icon: <Truck size={20} /> },
    ],
  },
  {
    label: 'Documents',
    items: [
      { title: 'Files', href: '/files', icon: <FolderOpen size={20} /> },
    ],
  },
]

const footerLinks = [
  { title: 'Settings', href: '/settings', icon: <Settings size={20} /> },
]

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <SharedShell
      portal="partner"
      portalTitle="Speedcut Partner"
      navSections={navSections}
      footerLinks={footerLinks}
      onSignOut={handleSignOut}
    >
      {children}
    </SharedShell>
  )
}
