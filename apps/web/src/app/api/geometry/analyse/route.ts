import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const GEOMETRY_SERVICE_URL = process.env.GEOMETRY_SERVICE_URL || 'http://localhost:8100'

/**
 * POST /api/geometry/analyse
 *
 * Downloads the file from Supabase Storage (server-side, using the user's
 * session) and forwards it to the Python geometry service for analysis.
 * This avoids needing Supabase credentials on the Python service.
 *
 * Body: { fileId, filePath, geometryResultId }
 * Returns: { jobId }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fileId, filePath, geometryResultId } = body as {
      fileId: string
      filePath: string
      geometryResultId: string
    }

    if (!fileId || !filePath || !geometryResultId) {
      return NextResponse.json({ error: 'fileId, filePath, and geometryResultId are required' }, { status: 400 })
    }

    // Download the file from Supabase Storage using the user's session
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('cad-files')
      .download(filePath)

    if (downloadError || !fileData) {
      console.error('Storage download error:', downloadError)
      return NextResponse.json(
        { error: `Failed to download file: ${downloadError?.message || 'unknown error'}` },
        { status: 500 }
      )
    }

    // Extract the filename from the path for the Python service
    const filename = filePath.split('/').pop() || 'upload.step'

    // Forward the file to the Python /analyse endpoint as multipart form data
    const formData = new FormData()
    formData.append('file', new Blob([await fileData.arrayBuffer()]), filename)

    const response = await fetch(`${GEOMETRY_SERVICE_URL}/analyse`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('Python service error:', response.status, detail)
      return NextResponse.json(
        { error: `Geometry service error: ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json()

    // Update the geometry_results row with the real job_id from Python
    await supabase
      .from('geometry_results')
      .update({ job_id: data.job_id, status: 'queued' })
      .eq('id', geometryResultId)

    return NextResponse.json({ jobId: data.job_id })
  } catch (err) {
    console.error('Analyse trigger error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
