import * as React from 'react'

/* ─── EmptyState ─── */

/**
 * A reusable empty-state placeholder with icon, message,
 * and an optional call-to-action link.
 */

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  message?: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          opacity: 0.5,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontWeight: 700,
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      {message && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            maxWidth: '320px',
            margin: '0 auto',
          }}
        >
          {message}
        </p>
      )}
      {action && (
        <a
          href={action.href}
          className="btn-primary"
          style={{
            marginTop: '1.5rem',
            display: 'inline-flex',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            textDecoration: 'none',
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
