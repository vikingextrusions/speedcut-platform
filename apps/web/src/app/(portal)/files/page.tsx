import { createClient } from '@/utils/supabase/server'
import { FolderOpen, Upload, FileText, Image, File } from 'lucide-react'

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <Image size={20} style={{ color: '#10b981' }} />
  if (['pdf'].includes(ext || '')) return <FileText size={20} style={{ color: '#ef4444' }} />
  if (['dxf', 'dwg', 'step', 'stp', 'iges', 'stl'].includes(ext || '')) return <File size={20} style={{ color: '#3b82f6' }} />
  return <File size={20} style={{ color: 'var(--text-muted)' }} />
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default async function FilesPage() {
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
        .select('id, name, file_type, file_size, file_path, category, drawing_number, description, created_at')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Files</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your drawings, specifications, and documents</p>
        </div>
        <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
          <Upload size={18} />
          Upload File
        </button>
      </div>

      {/* Upload Zone */}
      <div
        className="card"
        style={{
          border: '2px dashed var(--border)',
          backgroundColor: 'transparent',
          textAlign: 'center',
          padding: '2.5rem',
          marginBottom: '1.5rem',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.5 }} />
        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Drag and drop files here</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          PDF, DXF, DWG, STEP, PNG, JPG up to 25MB
        </p>
      </div>

      {/* File List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {files && files.length > 0 ? (
          <div>
            {files.map((f) => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color 0.15s',
                }}
                className="hover:bg-[var(--bg-primary)]"
              >
                <FileIcon filename={f.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {f.file_type} · {formatFileSize(f.file_size ?? 0)} · {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}><FolderOpen size={48} /></div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No files uploaded</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Upload drawings or documents to share with orders</p>
          </div>
        )}
      </div>
    </div>
  )
}
