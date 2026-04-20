import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@speedcut/ui/status-badge'
import { PageHeader } from '@speedcut/ui/page-header'
import { DetailLayout } from '@speedcut/ui/detail-layout'
import { Mail, Phone, Globe, MapPin, FileCheck, Package } from 'lucide-react'

export default async function AdminPartnerDetailPage({
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

  // Fetch partner capabilities
  const { data: capabilities } = await supabase
    .from('partner_capabilities')
    .select('id, process, materials, max_size, certifications, lead_time_days')
    .eq('partner_org_id', id)

  // Fetch recent assignments
  const { data: recentAssignments } = await supabase
    .from('quote_assignments')
    .select('id, status, partner_price, created_at, quotes(quote_number)')
    .eq('partner_org_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch active orders
  const { data: activeOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, order_date')
    .eq('partner_org_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const contacts = (members || []).map((m: any) => ({ ...m.profiles, orgRole: m.role }))
  const caps = (capabilities as any[]) || []

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <PageHeader
        title={org.name}
        subtitle={`${org.account_ref || 'No account ref'} · Partner since ${new Date(org.created_at).toLocaleDateString()}`}
        backHref="/partners"
        backLabel="Back to Partners"
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
        {/* Capabilities */}
        {caps.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Capabilities</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1px', backgroundColor: 'var(--border)' }}>
              {caps.map((cap: any) => (
                <div key={cap.id} style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{cap.process}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {cap.materials && <span>Materials: {Array.isArray(cap.materials) ? cap.materials.join(', ') : cap.materials}</span>}
                    {cap.max_size && <span>Max Size: {cap.max_size}</span>}
                    {cap.lead_time_days && <span>Lead Time: {cap.lead_time_days} days</span>}
                    {cap.certifications && <span>Certs: {Array.isArray(cap.certifications) ? cap.certifications.join(', ') : cap.certifications}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Assignments */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Assignment History ({recentAssignments?.length || 0})</h2>
          </div>
          {recentAssignments && recentAssignments.length > 0 ? (
            <div>{recentAssignments.map((a: any) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{a.quotes?.quote_number || '—'}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {a.partner_price && <span style={{ fontWeight: 600 }}>£{Number(a.partner_price).toFixed(2)}</span>}
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}</div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No assignments</div>
          )}
        </div>

        {/* Active Orders */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Orders ({activeOrders?.length || 0})</h2>
          </div>
          {activeOrders && activeOrders.length > 0 ? (
            <div>{activeOrders.map((o: any) => (
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
      </DetailLayout>
    </div>
  )
}
