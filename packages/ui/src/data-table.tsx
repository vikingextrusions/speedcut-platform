import * as React from 'react'

/* ─── DataTable ─── */

/**
 * A reusable data table with consistent styling,
 * supporting column definitions and empty state.
 */

export interface DataTableColumn<T> {
  key: string
  header: string
  /** Render function for the cell. Receives the row data and column index. */
  render: (row: T, index: number) => React.ReactNode
  /** Text alignment — defaults to 'left' */
  align?: 'left' | 'right' | 'center'
  /** Whether to apply nowrap — defaults to true */
  nowrap?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Key extractor. Receives the row and returns a unique string. */
  getRowKey: (row: T) => string
  /** Empty state content — shown when data is empty */
  emptyState?: React.ReactNode
  /** Row click handler — makes rows clickable */
  onRowClick?: (row: T) => void
}

const thStyle: React.CSSProperties = {
  padding: '0.875rem 1.25rem',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.875rem 1.25rem',
  whiteSpace: 'nowrap',
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...thStyle,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={getRowKey(row)}
              style={{
                borderBottom: '1px solid var(--border)',
                cursor: onRowClick ? 'pointer' : undefined,
                transition: 'background-color 0.1s',
              }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    ...tdStyle,
                    textAlign: col.align || 'left',
                    whiteSpace: col.nowrap === false ? 'normal' : 'nowrap',
                  }}
                >
                  {col.render(row, rowIdx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
