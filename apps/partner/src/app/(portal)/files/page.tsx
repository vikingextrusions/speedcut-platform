import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FolderOpen, FileText, Download, Calendar } from 'lucide-react'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default async function PartnerFilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user!.id)
  const orgIds = orgMembers?.map(om => om.organization_id) || []

  const { data: files } = orgIds.length > 0
    ? await supabase
        .from('files')
        .select('id, filename, file_type, file_size, category, uploaded_at')
        .in('organization_id', orgIds)
        .order('uploaded_at', { ascending: false })
    : { data: [] }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Files</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Documents and files for your organisation</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {files && files.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>File</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Size</th>
                  <th style={thStyle}>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f: any) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{f.filename}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span className="badge badge-accent">{f.category || 'general'}</span>
                    </td>
                    <td style={tdStyle}><span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>{f.file_type || '—'}</span></td>
                    <td style={tdStyle}>{f.file_size ? formatFileSize(f.file_size) : '—'}</td>
                    <td style={tdStyle}>{new Date(f.uploaded_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><FolderOpen size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No files</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Uploaded documents will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }
const tdStyle: React.CSSProperties = { padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }
