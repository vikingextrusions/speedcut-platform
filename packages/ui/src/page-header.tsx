import * as React from 'react'

/* ─── PageHeader ─── */

/**
 * A consistent page header with title, subtitle,
 * and an optional actions slot (buttons, etc).
 */

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  /** Back link — shown as a subtle "← Back" link above the title */
  backHref?: string
  backLabel?: string
  badge?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  backLabel = 'Back',
  badge,
}: PageHeaderProps) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {backHref && (
        <a
          href={backHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          {backLabel}
        </a>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: subtitle ? '0.25rem' : 0,
            }}
          >
            <h1 className="page-title">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p
              style={{
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>{actions}</div>}
      </div>
    </div>
  )
}
