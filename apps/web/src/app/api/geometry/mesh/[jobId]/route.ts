import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const GEOMETRY_SERVICE_URL = process.env.GEOMETRY_SERVICE_URL || 'http://localhost:8100'

/**
 * GET /api/geometry/mesh/[jobId]
 *
 * Proxies the GLB mesh file from the Python geometry service.
 * Returns binary GLB data with proper content-type for Three.js.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await params

    const response = await fetch(`${GEOMETRY_SERVICE_URL}/mesh/${jobId}`, {
      method: 'GET',
    })

    if (response.status === 404) {
      return NextResponse.json({ error: 'Mesh not found' }, { status: 404 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Mesh service unavailable' }, { status: 502 })
    }

    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('Mesh proxy error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
