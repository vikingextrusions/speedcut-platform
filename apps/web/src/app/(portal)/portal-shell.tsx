'use client'

import { SharedShell } from '@speedcut/ui/shared-shell'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Package,
  Receipt,
  FolderOpen,
  Settings,
  Bell,
} from 'lucide-react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { title: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
    ],
  },
  {
    label: 'Quotes',
    items: [
      { title: 'My Quotes', href: '/quotes', icon: <FileText size={20} /> },
      { title: 'New Quote', href: '/quotes/new', icon: <FilePlus size={20} /> },
    ],
  },
  {
    label: 'Orders',
    items: [
      { title: 'My Orders', href: '/orders', icon: <Package size={20} /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { title: 'Invoices', href: '/invoices', icon: <Receipt size={20} /> },
    ],
  },
  {
    label: 'Documents',
    items: [
      { title: 'My Files', href: '/files', icon: <FolderOpen size={20} /> },
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
      portal="web"
      portalTitle="Speedcut"
      navSections={navSections}
      footerLinks={footerLinks}
      onSignOut={handleSignOut}
    >
      {children}
    </SharedShell>
  )
}
