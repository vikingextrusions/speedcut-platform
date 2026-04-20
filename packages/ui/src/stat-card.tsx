import * as React from 'react'

/* ─── StatCard ─── */

/**
 * A dashboard stat card with icon, value, label,
 * and a subtle "View all" footer link.
 */

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  href: string
  /** Custom accent colour (CSS colour string). Falls back to --accent. */
  accent?: string
}

export function StatCard({ label, value, icon, href, accent }: StatCardProps) {
  return (
    <a
      href={href}
      className="card-hover group"
      style={{
        padding: 0,
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
      }}
    >
      <div
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            className="micro-label"
            style={{ marginBottom: '0.5rem' }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1,
            }}
          >
            {value}
          </p>
        </div>
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '0.75rem',
            backgroundColor: accent ? `${accent}15` : 'var(--accent-glow)',
            color: accent || 'var(--accent)',
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>View all</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </a>
  )
}
