'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Cpu, Printer, Layers } from 'lucide-react'
import { ServiceTabs } from '@speedcut/ui/service-tabs'
import type { ServiceTab } from '@speedcut/ui/service-tabs'

const serviceTabs: ServiceTab[] = [
  { id: 'cnc', label: 'CNC Machining', icon: <Cpu size={18} /> },
  { id: '3d-printing', label: '3D Printing', icon: <Printer size={18} />, badge: 'Fast' },
  { id: 'sheet-metal', label: 'Sheet Metal', icon: <Layers size={18} /> },
]

const tabRoutes: Record<string, string> = {
  'cnc': '/quotes/new/cnc',
  '3d-printing': '/quotes/new/3d-printing',
  'sheet-metal': '/quotes/new/sheet-metal',
}

function getActiveTab(pathname: string | null): string | null {
  if (!pathname) return null
  if (pathname.includes('/cnc')) return 'cnc'
  if (pathname.includes('/3d-printing')) return '3d-printing'
  if (pathname.includes('/sheet-metal')) return 'sheet-metal'
  return null
}

export default function NewQuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = getActiveTab(pathname)

  const handleTabChange = (tabId: string) => {
    const route = tabRoutes[tabId]
    if (route) router.push(route)
  }

  // Only show tabs when we're on a service sub-page, not on the selector page
  const showTabs = activeTab !== null

  return (
    <div>
      {showTabs && (
        <div style={{ marginBottom: '2rem' }}>
          <ServiceTabs
            tabs={serviceTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}
      {children}
    </div>
  )
}
