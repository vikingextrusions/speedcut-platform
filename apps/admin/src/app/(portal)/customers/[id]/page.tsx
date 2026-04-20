import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { Building2, Mail, Phone, Globe, MapPin, FileText, Package, Receipt } from 'lucide-react'

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, type, account_ref, website, phone, email, address, notes, is_active, created_at')
    .eq('id', id)
    .single()

  if (!org) notFound()

  // Fetch contacts
  const { data: members } = await supabase
    .from('org_members')
    .select('id, role, profiles(id, full_name, email, phone)')
    .eq('organization_id', id)

  // Fetch recent quotes
  const { data: recentQuotes } = await supabase
    .from('quotes')
    .select('id, quote_number, status, total_amount, quote_date')
    .eq('customer_org_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, order_date')
    .eq('customer_org_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recent invoices
  const { data: recentInvoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total_amount, invoice_date, due_date')
    .eq('customer_org_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const contacts = (members || []).map((m: any) => ({ ...m.profiles, orgRole: m.role }))

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={org.name}
        subtitle={`${org.account_ref || 'No account ref'} · Customer since ${new Date(org.created_at).toLocaleDateString()}`}
        backHref="/customers"
        backLabel="Back to Customers"
        badge={<StatusBadge status={org.is_active !== false ? 'active' : 'inactive'} />}
      />

      <DetailLayout
        sidebarWidth="360px"
        sidebar={
          <>
            {/* Org Info */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Organisation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                {org.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <a href={`mailto:${org.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{org.email}</a>
                  </div>
                )}
                {org.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span>{org.phone}</span>
                  </div>
                )}
                {org.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <a href={org.website} target="_blank" rel="noopener" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{org.website}</a>
                  </div>
                )}
                {org.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '0.125rem' }} />
                    <span style={{ whiteSpace: 'pre-line' }}>{org.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contacts */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Contacts ({contacts.length})</h3>
              {contacts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {contacts.map((c: any) => (
                    <div key={c.id} style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-primary)', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600 }}>{c.full_name || '—'}</div>
                      {c.email && <div style={{ color: 'var(--text-muted)', marginTop: '0.125rem' }}>{c.email}</div>}
                      {c.phone && <div style={{ color: 'var(--text-muted)', marginTop: '0.125rem' }}>{c.phone}</div>}
                      {c.orgRole && <span className="badge badge-info" style={{ marginTop: '0.25rem' }}>{c.orgRole}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No contacts linked</p>
              )}
            </div>

            {org.notes && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{org.notes}</p>
              </div>
            )}
          </>
        }
      >
        {/* Recent Quotes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Quotes ({recentQuotes?.length || 0})</h2>
          </div>
          {recentQuotes && recentQuotes.length > 0 ? (
            <div>{recentQuotes.map((q: any) => (
              <Link key={q.id} href={`/quotes/${q.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{q.quote_number}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>{new Date(q.quote_date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>£{q.total_amount.toFixed(2)}</span>
                  <StatusBadge status={q.status} />
                </div>
              </Link>
            ))}</div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No quotes</div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Orders ({recentOrders?.length || 0})</h2>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div>{recentOrders.map((o: any) => (
              <Link key={o.id} href={`/orders/${o.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{o.order_number}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>{new Date(o.order_date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>£{o.total_amount.toFixed(2)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}</div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders</div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Invoices ({recentInvoices?.length || 0})</h2>
          </div>
          {recentInvoices && recentInvoices.length > 0 ? (
            <div>{recentInvoices.map((inv: any) => {
              const isOverdue = inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()
              return (
                <Link key={inv.id} href={`/invoices/${inv.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{inv.invoice_number}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>{new Date(inv.invoice_date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600 }}>£{inv.total_amount.toFixed(2)}</span>
                    <StatusBadge status={isOverdue ? 'overdue' : inv.status} />
                  </div>
                </Link>
              )
            })}</div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No invoices</div>
          )}
        </div>
      </DetailLayout>
    </div>
  )
}
