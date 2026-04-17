'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Zap,
  ChevronDown,
  LogIn,
  ArrowRight,
  Menu,
  X,
  Scissors,
  Layers,
  Ruler,
  CircleDot,
  FlaskConical,
  ThermometerSun,
  ShieldCheck,
  Droplets,
  Factory,
  Car,
  Building2,
  Plane,
  Stethoscope,
  Wind,
  BookOpen,
  FileText,
  HelpCircle,
  Newspaper,
  GraduationCap,
  Phone,
} from 'lucide-react'

/* ─── Types ─── */

interface MegaMenuItem {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}

interface MegaMenuColumn {
  heading: string
  items: MegaMenuItem[]
}

interface NavDropdown {
  label: string
  columns: MegaMenuColumn[]
  featured?: {
    title: string
    description: string
    href: string
    tag?: string
  }
}

/* ─── Menu Data ─── */

const navDropdowns: NavDropdown[] = [
  {
    label: 'Capabilities',
    columns: [
      {
        heading: 'Manufacturing',
        items: [
          { icon: <Scissors size={20} />, title: 'Rubber Extrusion', description: 'Custom profiles cut to length', href: '/capabilities/extrusion' },
          { icon: <CircleDot size={20} />, title: 'Rubber Moulding', description: 'Compression & injection moulding', href: '/capabilities/moulding' },
          { icon: <Layers size={20} />, title: 'Sponge & Foam', description: 'Expanded rubber products', href: '/capabilities/sponge' },
          { icon: <Ruler size={20} />, title: 'Gasket Cutting', description: 'Die-cut and waterjet gaskets', href: '/capabilities/gaskets' },
        ],
      },
      {
        heading: 'Services',
        items: [
          { icon: <ShieldCheck size={20} />, title: 'Quality & Testing', description: 'IATF 16949, ISO 9001 certified', href: '/capabilities/quality' },
          { icon: <Zap size={20} />, title: 'Rapid Prototyping', description: 'First samples in 48 hours', href: '/capabilities/prototyping' },
          { icon: <Ruler size={20} />, title: 'Design Assistance', description: 'Expert profile engineering', href: '/capabilities/design' },
          { icon: <Layers size={20} />, title: 'Kitting & Assembly', description: 'Pre-assembled seal kits', href: '/capabilities/kitting' },
        ],
      },
    ],
    featured: {
      title: 'Speedcut MaaS Platform',
      description: 'Upload drawings, get instant quotes, and track orders in real-time.',
      href: '/login',
      tag: 'New',
    },
  },
  {
    label: 'Materials',
    columns: [
      {
        heading: 'Rubber Types',
        items: [
          { icon: <FlaskConical size={20} />, title: 'EPDM', description: 'Weather & ozone resistant', href: '/materials/epdm' },
          { icon: <ThermometerSun size={20} />, title: 'Silicone', description: 'High temperature resistance', href: '/materials/silicone' },
          { icon: <Droplets size={20} />, title: 'Nitrile (NBR)', description: 'Oil & fuel resistant', href: '/materials/nitrile' },
          { icon: <ShieldCheck size={20} />, title: 'Neoprene', description: 'General purpose elastomer', href: '/materials/neoprene' },
        ],
      },
      {
        heading: 'Speciality',
        items: [
          { icon: <FlaskConical size={20} />, title: 'Viton® (FKM)', description: 'Chemical resistance', href: '/materials/viton' },
          { icon: <ThermometerSun size={20} />, title: 'Polyurethane', description: 'Abrasion resistant', href: '/materials/polyurethane' },
          { icon: <Layers size={20} />, title: 'Sponge Rubber', description: 'Lightweight sealing', href: '/materials/sponge-rubber' },
          { icon: <ShieldCheck size={20} />, title: 'Food Grade', description: 'FDA / EU 1935 compliant', href: '/materials/food-grade' },
        ],
      },
    ],
  },
  {
    label: 'Industries',
    columns: [
      {
        heading: 'Sectors',
        items: [
          { icon: <Car size={20} />, title: 'Automotive', description: 'Seals, gaskets & weatherstrips', href: '/industries/automotive' },
          { icon: <Building2 size={20} />, title: 'Construction', description: 'Glazing & façade seals', href: '/industries/construction' },
          { icon: <Plane size={20} />, title: 'Aerospace', description: 'High-spec, certified parts', href: '/industries/aerospace' },
          { icon: <Stethoscope size={20} />, title: 'Medical', description: 'Biocompatible elastomers', href: '/industries/medical' },
        ],
      },
      {
        heading: 'More Sectors',
        items: [
          { icon: <Factory size={20} />, title: 'Industrial OEM', description: 'Bespoke manufacturing', href: '/industries/industrial' },
          { icon: <Wind size={20} />, title: 'Renewable Energy', description: 'Wind & solar sealing', href: '/industries/energy' },
          { icon: <Droplets size={20} />, title: 'Marine', description: 'Saltwater & UV resistant', href: '/industries/marine' },
          { icon: <Factory size={20} />, title: 'Rail & Transport', description: 'Fire-rated profiles', href: '/industries/rail' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    columns: [
      {
        heading: 'Learn',
        items: [
          { icon: <BookOpen size={20} />, title: 'Knowledge Base', description: 'Technical guides & specs', href: '/resources/knowledge-base' },
          { icon: <FileText size={20} />, title: 'Case Studies', description: 'Real project examples', href: '/resources/case-studies' },
          { icon: <GraduationCap size={20} />, title: 'Material Guide', description: 'Choosing the right rubber', href: '/resources/material-guide' },
          { icon: <Newspaper size={20} />, title: 'Blog', description: 'Latest news & insights', href: '/resources/blog' },
        ],
      },
      {
        heading: 'Support',
        items: [
          { icon: <HelpCircle size={20} />, title: 'FAQ', description: 'Common questions answered', href: '/resources/faq' },
          { icon: <Phone size={20} />, title: 'Contact Us', description: 'Get in touch with our team', href: '/contact' },
          { icon: <FileText size={20} />, title: 'Request a Sample', description: 'Try before you buy', href: '/resources/samples' },
          { icon: <ShieldCheck size={20} />, title: 'Certifications', description: 'Quality accreditations', href: '/resources/certifications' },
        ],
      },
    ],
  },
]

/* ─── MarketingHeader Component ─── */

interface MarketingHeaderProps {
  isLoggedIn?: boolean
}

export function MarketingHeader({ isLoggedIn = false }: MarketingHeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  const isAnyMenuOpen = activeMenu !== null

  // Track scroll for background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(label)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150)
  }

  const cancelLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  // Find active dropdown data
  const activeDropdown = navDropdowns.find((d) => d.label === activeMenu)

  return (
    <header
      ref={headerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      {/* ─── Top Bar ─── */}
      <div
        style={{
          backgroundColor: scrolled || isAnyMenuOpen ? '#080c18' : 'rgba(8, 12, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent), #00b4d8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={20} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', fontStyle: 'italic', color: '#fff' }}>Speedcut</span>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
              {navDropdowns.map((dropdown) => (
                <div
                  key={dropdown.label}
                  onMouseEnter={() => handleEnter(dropdown.label)}
                  onMouseLeave={handleLeave}
                >
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: activeMenu === dropdown.label ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: activeMenu === dropdown.label ? '#fff' : 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {dropdown.label}
                    <ChevronDown
                      size={14}
                      style={{
                        transition: 'transform 0.2s ease',
                        transform: activeMenu === dropdown.label ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-actions">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                    background: 'linear-gradient(135deg, var(--accent), #00b4d8)',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                    borderRadius: 10, textDecoration: 'none',
                    boxShadow: '0 2px 12px rgba(0,217,225,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Go to Dashboard
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                      color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500,
                      textDecoration: 'none', borderRadius: 8, transition: 'color 0.15s ease',
                    }}
                  >
                    <LogIn size={16} />
                    Sign In
                  </Link>
                  <Link
                    href="/quotes/new"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                      background: 'linear-gradient(135deg, var(--accent), #00b4d8)',
                      color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                      borderRadius: 10, textDecoration: 'none',
                      boxShadow: '0 2px 12px rgba(0,217,225,0.3)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Get a Quote
                    <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-toggle"
              style={{
                display: 'none', padding: 8, borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#fff', cursor: 'pointer',
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Single Mega Menu Panel (Desktop) ─── */}
      <div
        onMouseEnter={cancelLeave}
        onMouseLeave={handleLeave}
        className="mega-menu-panel"
        style={{
          backgroundColor: '#0a0e1e',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
          maxHeight: isAnyMenuOpen ? 480 : 0,
          opacity: isAnyMenuOpen ? 1 : 0,
        }}
      >
        {/* Content container - renders all dropdowns, only active one visible */}
        <div style={{ position: 'relative' }}>
          {navDropdowns.map((dropdown) => {
            const isActive = activeMenu === dropdown.label
            return (
              <div
                key={dropdown.label}
                style={{
                  position: isActive ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                  transition: 'opacity 0.2s ease',
                  visibility: isActive ? 'visible' : 'hidden',
                }}
              >
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px', display: 'flex', gap: 48 }}>
                  {/* Columns */}
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${dropdown.columns.length}, 1fr)`, gap: 48 }}>
                    {dropdown.columns.map((col) => (
                      <div key={col.heading}>
                        <div style={{
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: 'var(--accent)', marginBottom: 16, paddingLeft: 4,
                        }}>
                          {col.heading}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {col.items.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href}
                              onClick={() => setActiveMenu(null)}
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 12px',
                                borderRadius: 10, textDecoration: 'none', color: 'inherit',
                                transition: 'background-color 0.15s ease',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            >
                              <div style={{
                                padding: 8, borderRadius: 8,
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                color: 'var(--accent)', flexShrink: 0, marginTop: 2,
                              }}>
                                {item.icon}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', marginBottom: 2 }}>
                                  {item.title}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Featured Banner */}
                  {dropdown.featured && (
                    <div style={{ width: 280, flexShrink: 0 }}>
                      <Link
                        href={dropdown.featured.href}
                        onClick={() => setActiveMenu(null)}
                        style={{
                          display: 'block', padding: 24, borderRadius: 16,
                          background: 'linear-gradient(145deg, rgba(0,217,225,0.12), rgba(0,180,216,0.06))',
                          border: '1px solid rgba(0,217,225,0.15)',
                          textDecoration: 'none', color: 'inherit',
                          transition: 'border-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,217,225,0.4)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,217,225,0.15)' }}
                      >
                        {dropdown.featured.tag && (
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                            backgroundColor: 'var(--accent)', color: '#000',
                            fontSize: 11, fontWeight: 700, marginBottom: 12,
                          }}>
                            {dropdown.featured.tag}
                          </span>
                        )}
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 8 }}>
                          {dropdown.featured.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 16 }}>
                          {dropdown.featured.description}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>
                          Learn more <ArrowRight size={14} />
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      <div
        className="mobile-menu"
        style={{
          backgroundColor: '#080c18',
          maxHeight: mobileOpen ? '80vh' : 0,
          overflow: mobileOpen ? 'auto' : 'hidden',
          transition: 'max-height 0.3s ease',
          borderTop: mobileOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div style={{ padding: '16px 24px' }}>
          {navDropdowns.map((dropdown) => (
            <MobileAccordion key={dropdown.label} dropdown={dropdown} />
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 12, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent), #00b4d8)',
                color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
              }}>
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>
                  <LogIn size={18} /> Sign In
                </Link>
                <Link href="/quotes/new" onClick={() => setMobileOpen(false)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--accent), #00b4d8)',
                  color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                }}>
                  Get a Quote <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Responsive Styles ─── */}
      <style>{`
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .mega-menu-panel { display: none !important; }
        }
        @media (min-width: 1024px) {
          .mobile-toggle { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  )
}

/* ─── Mobile Accordion ─── */
function MobileAccordion({ dropdown }: { dropdown: NavDropdown }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '14px 0', border: 'none', background: 'transparent',
          color: '#fff', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        {dropdown.label}
        <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      <div style={{ maxHeight: open ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        <div style={{ paddingBottom: 12 }}>
          {dropdown.columns.map((col) => (
            <div key={col.heading} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', padding: '8px 0 4px', marginLeft: 4 }}>
                {col.heading}
              </div>
              {col.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  style={{ display: 'block', padding: '8px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.825rem', textDecoration: 'none', borderRadius: 6 }}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
