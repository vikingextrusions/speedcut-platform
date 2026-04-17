'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Zap,
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
  web: '',
  partner: 'hsl(260, 80%, 60%)',
  admin: 'hsl(30, 90%, 55%)',
}

/* ─── Constants ─── */
const SIDEBAR_EXPANDED = 260
const SIDEBAR_COLLAPSED = 72

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        {/* ─── Mobile Backdrop ─── */}
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            opacity: isMobileOpen ? 1 : 0,
            pointerEvents: isMobileOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* ─── Mobile Toggle Button ─── */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 60,
            padding: 10,
            borderRadius: 10,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          className="mobile-menu-btn"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* ─── Sidebar ─── */}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: SIDEBAR_EXPANDED,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(mounted ? {
              width: sidebarWidth,
            } : {}),
            transform: isMobileOpen ? 'translateX(0)' : undefined,
          }}
          className="sidebar-aside"
        >
          {/* ── Logo / Branding ── */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: isCollapsed ? '20px 0' : '20px 24px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderBottom: '1px solid var(--border)',
              textDecoration: 'none',
              minHeight: 64,
              transition: 'padding 0.3s ease',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover, var(--accent)))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={18} style={{ color: '#fff' }} />
            </div>
            {!isCollapsed && (
              <span style={{ fontWeight: 800, fontSize: '1.125rem', fontStyle: 'italic', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {portalTitle}
              </span>
            )}
          </Link>

          {/* ── Collapse Toggle (floating on edge) ── */}
          <button
            onClick={toggle}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="collapse-toggle-btn"
            style={{
              position: 'absolute',
              top: 22,
              right: -14,
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 60,
              transition: 'transform 0.3s ease, color 0.15s ease, background-color 0.15s ease',
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <PanelLeftClose size={14} />
          </button>

          {/* ── Navigation ── */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? '12px 8px' : '12px 12px', transition: 'padding 0.3s ease' }}>
            {navSections.map((section, sIdx) => (
              <div key={section.label} style={{ marginBottom: 8 }}>
                {/* Section Label */}
                {!isCollapsed ? (
                  <div
                    style={{
                      padding: '8px 12px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                      userSelect: 'none',
                    }}
                  >
                    {section.label}
                  </div>
                ) : (
                  sIdx > 0 && (
                    <div style={{ margin: '8px auto', width: 24, borderTop: '1px solid var(--border)' }} />
                  )
                )}

                {/* Section Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.title : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: isCollapsed ? '10px 0' : '10px 12px',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          borderRadius: 10,
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                          color: isActive ? '#fff' : 'var(--text-muted)',
                          backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                          boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                            e.currentTarget.style.color = 'var(--text-primary)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--text-muted)'
                          }
                        }}
                      >
                        <div style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</div>
                        {!isCollapsed && (
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

          {/* ── Footer ── */}
          <div
            style={{
              padding: isCollapsed ? '12px 8px' : '12px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transition: 'padding 0.3s ease',
            }}
          >
            {/* Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px', marginBottom: 4 }}>
              <ThemeToggle />
            </div>

            {/* Footer Links */}
            {footerLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.title : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: isCollapsed ? '10px 0' : '10px 12px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: 10,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</div>
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )
            })}


            {/* Sign Out */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title={isCollapsed ? 'Log Out' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: isCollapsed ? '10px 0' : '10px 12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: 10,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                <LogOut size={20} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span>Log Out</span>}
              </button>
            )}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main
          style={{
            flex: 1,
            marginLeft: mounted ? sidebarWidth : SIDEBAR_EXPANDED,
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: 0,
          }}
          className="main-content"
        >
          <div style={{ padding: '32px', maxWidth: 1600, margin: '0 auto' }} className="main-content-inner">
            {children}
          </div>
        </main>
      </div>

      {/* ─── Responsive Styles ─── */}
      <style>{`
        @media (max-width: 1023px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .sidebar-aside {
            width: ${SIDEBAR_EXPANDED}px !important;
            transform: ${isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
          .main-content-inner {
            padding: 20px !important;
            padding-top: 64px !important;
          }
          .collapse-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </SidebarContext.Provider>
  )
}
