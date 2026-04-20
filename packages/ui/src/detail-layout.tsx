import * as React from 'react'

/* ─── DetailLayout ─── */

/**
 * A two-column detail page layout:
 * - Main content area (left, wider)
 * - Sidebar panels (right, fixed width)
 *
 * Collapses to single column on mobile.
 */

interface DetailLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  /** Width of the sidebar — defaults to '360px' */
  sidebarWidth?: string
}

export function DetailLayout({
  children,
  sidebar,
  sidebarWidth = '360px',
}: DetailLayoutProps) {
  return (
    <>
      <div
        className="detail-layout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `1fr ${sidebarWidth}`,
          gap: '1.5rem',
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            minWidth: 0,
          }}
        >
          {children}
        </div>

        {/* Sidebar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {sidebar}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .detail-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
