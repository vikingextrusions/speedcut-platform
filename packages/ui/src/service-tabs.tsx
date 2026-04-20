'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

/* ─── Types ─── */

export interface ServiceTab {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  badge?: string
}

interface ServiceTabsProps {
  tabs: ServiceTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

/* ─── ServiceTabs Component ─── */

export function ServiceTabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: ServiceTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current.get(activeTab)
    const container = containerRef.current
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = activeEl.getBoundingClientRect()
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [activeTab])

  useEffect(() => {
    setMounted(true)
    updateIndicator()
  }, [updateIndicator])

  useEffect(() => {
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  return (
    <div className={className}>
      {/* Tab Bar */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'flex',
          gap: 4,
          padding: 4,
          borderRadius: 14,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Animated Indicator */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: indicator.left,
            width: indicator.width,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover, var(--accent)))',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 30%, transparent)',
            transition: mounted ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            zIndex: 0,
          }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el)
              }}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'color-mix(in srgb, var(--accent) 15%, transparent)',
                    color: isActive ? '#fff' : 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── ServiceCard — for the landing/selector view ─── */

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  accentColor?: string
  onClick: () => void
  badge?: string
}

export function ServiceCard({
  icon,
  title,
  description,
  features,
  accentColor,
  onClick,
  badge,
}: ServiceCardProps) {
  const [hovered, setHovered] = useState(false)
  const accent = accentColor || 'var(--accent)'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
        padding: '2rem',
        borderRadius: '1rem',
        border: `1px solid ${hovered ? accent : 'var(--glass-border)'}`,
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered
          ? `0 8px 32px color-mix(in srgb, ${accent} 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.05)`
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Badge */}
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 9999,
            backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)`,
            color: accent,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
          }}
        >
          {badge}
        </span>
      )}

      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
          transition: 'background-color 0.2s ease',
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div>
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>

      {/* Features */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
        }}
      >
        {features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 12,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: accent,
        }}
      >
        <span>Start Quote →</span>
      </div>
    </button>
  )
}
