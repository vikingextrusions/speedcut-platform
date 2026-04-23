import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const GEOMETRY_SERVICE_URL = process.env.GEOMETRY_SERVICE_URL || 'http://localhost:8100'

/**
 * GET /api/geometry/status/[jobId]
 *
 * Proxies status polling to the Python service.
 * Returns { status, result?, error? }
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

    const response = await fetch(`${GEOMETRY_SERVICE_URL}/analyse/${jobId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.status === 404) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Geometry service unavailable' }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Status poll error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
