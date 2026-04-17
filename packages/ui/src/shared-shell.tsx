'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Settings,
  User,
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

/* ─── Types ─── */

export type PortalType = 'web' | 'partner' | 'admin'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface NavSection {
  label: string
  items: NavItem[]
}

interface SharedShellProps {
  children: React.ReactNode
  portal: PortalType
  portalTitle: string
  navSections: NavSection[]
  logoSrc?: string
  logoAlt?: string
  footerLinks?: NavItem[]
  onSignOut?: () => void
}

/* ─── Sidebar State Context ─── */

interface SidebarContextType {
  isCollapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggle: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

/* ─── Portal Accent Map ─── */

const portalAccents: Record<PortalType, string> = {
  web: '', // default accent from tokens
  partner: 'hsl(260, 80%, 60%)', // purple for partner
  admin: 'hsl(30, 90%, 55%)', // amber for admin
}

/* ─── SharedShell Component ─── */

export function SharedShell({
  children,
  portal,
  portalTitle,
  navSections,
  logoSrc,
  logoAlt = 'Speedcut',
  footerLinks = [],
  onSignOut,
}: SharedShellProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load sidebar preference
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) setIsCollapsed(saved === 'true')
  }, [])

  const toggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  // Set portal accent override
  useEffect(() => {
    const accent = portalAccents[portal]
    if (accent) {
      document.documentElement.style.setProperty('--accent', accent)
      return () => {
        document.documentElement.style.removeProperty('--accent')
      }
    }
  }, [portal])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      <div className="flex min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
        {/* ─── Mobile Backdrop ─── */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-[var(--overlay)] z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* ─── Mobile Toggle ─── */}
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] lg:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* ─── Sidebar ─── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col
            transition-all duration-300 ease-in-out
            ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          `}
        >
          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={toggle}
            className="hidden lg:flex absolute -right-3 top-24 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--accent)] z-50 transition-transform duration-300"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Branding */}
          <Link
            href="/"
            className={`
              p-6 border-b border-[var(--border)] flex items-center justify-center h-24 overflow-hidden hover:opacity-80 transition-opacity
              ${isCollapsed ? 'px-2' : 'px-6'}
            `}
          >
            {logoSrc ? (
              <div
                className={`relative transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-full h-14'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <span
                className={`font-bold text-[var(--accent)] transition-all duration-300 ${isCollapsed ? 'text-lg' : 'text-2xl'}`}
              >
                {isCollapsed ? 'SC' : portalTitle}
              </span>
            )}
          </Link>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navSections.map((section) => (
              <div key={section.label}>
                {!isCollapsed && (
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] select-none">
                    {section.label}
                  </p>
                )}
                {isCollapsed && (
                  <div className="mx-auto mb-2 w-6 border-t border-[var(--border)]" />
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        title={isCollapsed ? item.title : undefined}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl transition-all
                          ${
                            isActive
                              ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20'
                              : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                          }
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                      >
                        <div className="shrink-0">{item.icon}</div>
                        {!isCollapsed && (
                          <span className="font-medium whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div
            className={`p-4 border-t border-[var(--border)] space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}
          >
            {/* Theme Toggle */}
            <div className={`flex ${isCollapsed ? 'justify-center' : 'px-3'} mb-2`}>
              <ThemeToggle />
            </div>

            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.title : undefined}
                className={`flex items-center gap-3 p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="shrink-0">{item.icon}</div>
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </Link>
            ))}

            {onSignOut && (
              <button
                onClick={onSignOut}
                title={isCollapsed ? 'Log Out' : undefined}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all ${isCollapsed ? 'justify-center' : ''}`}
              >
                <LogOut size={20} className="shrink-0" />
                {!isCollapsed && <span className="font-medium">Log Out</span>}
              </button>
            )}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}
          `}
        >
          <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
