import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * POST /api/geometry/upload
 *
 * Generates a presigned upload URL for Supabase Storage so the browser can
 * upload a CAD file directly (bypassing Vercel's 4.5MB body limit).
 * Also inserts a `files` record and a placeholder `geometry_results` row.
 *
 * Returns: { uploadUrl, filePath, fileId, geometryResultId }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { filename, fileSize, mimeType } = body as {
      filename: string
      fileSize: number
      mimeType: string
    }

    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    const ext = filename.split('.').pop()?.toLowerCase()
    const allowed = ['step', 'stp', 'stl', 'obj']
    if (!ext || !allowed.includes(ext)) {
      return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 })
    }

    if (fileSize && fileSize > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 413 })
    }

    // Get org membership for the files record
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('organization_id')
      .eq('profile_id', user.id)
      .limit(1)
      .single()

    // Unique storage path: userId/timestamp-filename
    const timestamp = Date.now()
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${user.id}/${timestamp}-${safeFilename}`

    // Generate presigned upload URL (valid for 15 minutes)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('cad-files')
      .createSignedUploadUrl(filePath)

    if (signedError || !signedData) {
      console.error('Storage signed URL error:', signedError)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    // Insert files record
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        organization_id: orgMember?.organization_id ?? null,
        uploaded_by: user.id,
        name: filename,
        file_path: filePath,
        file_type: ext.toUpperCase(),
        file_size: fileSize ?? null,
        category: 'drawing',
        metadata: { source: 'geometry-upload', mime_type: mimeType ?? null },
      })
      .select('id')
      .single()

    if (fileError || !fileRecord) {
      console.error('Files insert error:', fileError)
      return NextResponse.json({ error: 'Failed to create file record' }, { status: 500 })
    }

    // Insert placeholder geometry_results row (status: queued)
    const { data: geoRecord, error: geoError } = await supabase
      .from('geometry_results')
      .insert({
        file_id: fileRecord.id,
        job_id: crypto.randomUUID(), // placeholder — will be updated by Python
        status: 'queued',
      })
      .select('id')
      .single()

    if (geoError || !geoRecord) {
      console.error('Geometry results insert error:', geoError)
      return NextResponse.json({ error: 'Failed to create geometry record' }, { status: 500 })
    }

    return NextResponse.json({
      uploadUrl: signedData.signedUrl,
      filePath,
      fileId: fileRecord.id,
      geometryResultId: geoRecord.id,
    })
  } catch (err) {
    console.error('Upload URL error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
