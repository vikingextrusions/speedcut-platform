import * as React from 'react'

/* ─── StatusBadge ─── */

/**
 * A centralised status → colour mapping for use across all portals.
 * Replaces the copy-pasted StatusBadge helpers in each page.
 */

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'accent'

const statusMap: Record<string, BadgeVariant> = {
  // Quote statuses
  draft: 'info',
  submitted: 'info',
  reviewing: 'warning',
  priced: 'accent',
  sent: 'accent',
  accepted: 'success',
  rejected: 'error',
  expired: 'error',

  // Order statuses
  confirmed: 'info',
  in_production: 'warning',
  quality_check: 'warning',
  ready_to_ship: 'accent',
  shipped: 'accent',
  delivered: 'success',
  completed: 'success',
  cancelled: 'error',

  // Assignment statuses
  pending: 'warning',
  declined: 'error',

  // Invoice statuses
  paid: 'success',
  overdue: 'error',
  void: 'error',
  partial: 'warning',

  // PO statuses
  ordered: 'accent',
  received: 'success',

  // Credit note statuses
  issued: 'accent',
  allocated: 'success',

  // Delivery note statuses
  dispatched: 'accent',
  signed: 'success',

  // Order line statuses
  outstanding: 'info',
  in_progress: 'warning',
  on_hold: 'error',
  waiting_material: 'warning',
  cutting_complete: 'accent',
  complete: 'success',

  // Org / user statuses
  active: 'success',
  inactive: 'error',
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  error: 'badge badge-error',
  info: 'badge badge-info',
  accent: 'badge badge-accent',
}

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
  /** Override the automatic variant mapping */
  variant?: BadgeVariant
  /** Custom label — defaults to status with underscores replaced by spaces */
  label?: string
}

export function StatusBadge({
  status,
  variant,
  label,
  className = '',
  ...props
}: StatusBadgeProps) {
  const resolvedVariant = variant || statusMap[status] || 'info'
  const displayLabel = label || status.replace(/_/g, ' ')

  return (
    <span className={`${variantClasses[resolvedVariant]} ${className}`} {...props}>
      {displayLabel}
    </span>
  )
}
