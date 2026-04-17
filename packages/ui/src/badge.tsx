import * as React from 'react'

/* ─── Badge ─── */

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'accent' | 'neutral'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  error: 'badge badge-error',
  info: 'badge badge-info',
  accent: 'badge badge-accent',
  neutral:
    'badge bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]',
}

export function Badge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}
