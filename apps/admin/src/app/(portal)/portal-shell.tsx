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
  CreditCard,
  ShoppingCart,
  Truck,
  Building2,
  Factory,
  Layers,
  Wrench,
  Calculator,
  Users,
  Activity,
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
    label: 'Sales',
    items: [
      { title: 'Quotes', href: '/quotes', icon: <FileText size={20} /> },
      { title: 'Orders', href: '/orders', icon: <Package size={20} /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { title: 'Invoices', href: '/invoices', icon: <Receipt size={20} /> },
      { title: 'Credit Notes', href: '/credit-notes', icon: <CreditCard size={20} /> },
      { title: 'Purchase Orders', href: '/purchase-orders', icon: <ShoppingCart size={20} /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'Delivery Notes', href: '/delivery-notes', icon: <Truck size={20} /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Customers', href: '/customers', icon: <Building2 size={20} /> },
      { title: 'Partners', href: '/partners', icon: <Factory size={20} /> },
      { title: 'Materials', href: '/materials', icon: <Layers size={20} /> },
      { title: 'Processes', href: '/processes', icon: <Wrench size={20} /> },
      { title: 'Calculator', href: '/calculator', icon: <Calculator size={20} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Users', href: '/users', icon: <Users size={20} /> },
      { title: 'Activity Log', href: '/activity', icon: <Activity size={20} /> },
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
      portal="admin"
      portalTitle="Speedcut Admin"
      navSections={navSections}
      footerLinks={footerLinks}
      onSignOut={handleSignOut}
    >
      {children}
    </SharedShell>
  )
}
