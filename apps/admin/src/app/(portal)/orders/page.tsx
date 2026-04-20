import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DataTable } from '@speedcut/ui/data-table'
import type { DataTableColumn } from '@speedcut/ui/data-table'
import { EmptyState } from '@speedcut/ui/empty-state'

type OrderRow = {
  id: string
  order_number: string
  status: string
  total_amount: number
  order_date: string
  required_date: string | null
  customer_reference: string | null
  organizations: { name: string } | null
}

const columns: DataTableColumn<OrderRow>[] = [
  {
    key: 'order_number',
    header: 'Order #',
    render: (row) => (
      <Link href={`/orders/${row.id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
        {row.order_number}
      </Link>
    ),
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (row) => row.organizations?.name || '—',
  },
  {
    key: 'customer_ref',
    header: 'Customer Ref',
    render: (row) => <span style={{ color: 'var(--text-muted)' }}>{row.customer_reference || '—'}</span>,
  },
  {
    key: 'date',
    header: 'Date',
    render: (row) => new Date(row.order_date).toLocaleDateString(),
  },
  {
    key: 'required',
    header: 'Required By',
    render: (row) => row.required_date ? new Date(row.required_date).toLocaleDateString() : '—',
  },
  {
    key: 'total',
    header: 'Total',
    render: (row) => <span style={{ fontWeight: 700 }}>£{row.total_amount.toFixed(2)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
]

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, total_amount, order_date, required_date, customer_reference,
      organizations!orders_customer_org_id_fkey(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title="Orders"
        subtitle="Manage all platform orders"
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={(orders as OrderRow[]) || []}
          getRowKey={(row) => row.id}
          emptyState={
            <EmptyState
              icon={<Package size={48} />}
              title="No orders yet"
              message="Orders will appear here once quotes are accepted"
            />
          }
        />
      </div>
    </div>
  )
}
