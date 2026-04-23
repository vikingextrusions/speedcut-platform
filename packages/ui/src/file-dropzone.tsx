'use client'

import React, { useCallback, useRef, useState } from 'react'
import { Upload, File, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

// ─── Types ───

export type UploadPhase = 'idle' | 'uploading' | 'analysing' | 'complete' | 'error'

export interface GeometryResult {
  volume_mm3: number
  surface_area_mm2: number
  bounding_box: { x_mm: number; y_mm: number; z_mm: number }
  stock_volume_mm3: number
  material_removal_ratio: number
  face_count: number
  solid_count: number
  is_watertight: boolean
  wall_thickness_min_mm?: number | null
  complexity_score?: number | null
  recommended_process?: string | null
  process_confidence?: number | null
  processing_time_ms?: number | null
  mesh_url?: string | null
}

export interface FileUploadResult {
  fileId: string
  geometryResultId: string
  result: GeometryResult
}

interface FileDropzoneProps {
  serviceColor?: string
  serviceType?: string
  onComplete?: (result: FileUploadResult) => void
  onError?: (error: string) => void
  className?: string
}

const ACCEPTED = ['.step', '.stp', '.stl', '.obj']
const MAX_BYTES = 50 * 1024 * 1024

// ─── Component ───

export function FileDropzone({
  serviceColor = '#00d9e1',
  serviceType = 'cnc',
  onComplete,
  onError,
}: FileDropzoneProps) {
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [filename, setFilename] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FileUploadResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    setPhase('idle')
    setProgress(0)
    setFilename(null)
    setError(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleFile = useCallback(async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      const msg = `Unsupported type: ${ext}. Accepted: ${ACCEPTED.join(', ')}`
      setError(msg)
      onError?.(msg)
      return
    }
    if (file.size > MAX_BYTES) {
      const msg = 'File exceeds 50MB limit'
      setError(msg)
      onError?.(msg)
      return
    }

    setFilename(file.name)
    setError(null)
    setPhase('uploading')
    setProgress(0)

    try {
      // Step 1: Get presigned upload URL + create DB records
      const metaRes = await fetch('/api/geometry/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
        }),
      })

      if (!metaRes.ok) {
        const { error: e } = await metaRes.json()
        throw new Error(e || 'Failed to get upload URL')
      }

      const { uploadUrl, filePath, fileId, geometryResultId } = await metaRes.json()

      // Step 2: Upload directly to Supabase Storage using XHR for progress events
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed: ${xhr.status}`))
        })
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.send(file)
      })

      setProgress(100)
      setPhase('analysing')

      // Step 3: Trigger analysis
      const analyseRes = await fetch('/api/geometry/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, filePath, geometryResultId }),
      })

      if (!analyseRes.ok) {
        const { error: e } = await analyseRes.json()
        throw new Error(e || 'Failed to trigger analysis')
      }

      const { jobId } = await analyseRes.json()

      // Step 4: Poll for completion
      await new Promise<void>((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 60 // 2 min max
        pollRef.current = setInterval(async () => {
          attempts++
          if (attempts > maxAttempts) {
            clearInterval(pollRef.current!)
            reject(new Error('Analysis timed out'))
            return
          }

          try {
            const statusRes = await fetch(`/api/geometry/status/${jobId}`)
            if (!statusRes.ok) return // retry on transient error

            const statusData = await statusRes.json()

            if (statusData.status === 'complete' && statusData.result) {
              clearInterval(pollRef.current!)
              const uploadResult: FileUploadResult = {
                fileId,
                geometryResultId,
                result: statusData.result,
              }
              setResult(uploadResult)
              setPhase('complete')
              onComplete?.(uploadResult)
              resolve()
            } else if (statusData.status === 'failed') {
              clearInterval(pollRef.current!)
              reject(new Error(statusData.error || 'Analysis failed'))
            }
          } catch {
            // transient poll error — continue
          }
        }, 2000)
      })

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setPhase('error')
      onError?.(msg)
    }
  }, [onComplete, onError])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // ── Render States ──

  if (phase === 'complete' && result) {
    return (
      <div
        style={{
          border: `1.5px solid ${serviceColor}40`,
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: `${serviceColor}08`,
        }}
      >
        <CheckCircle2 size={16} style={{ color: serviceColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {filename}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Analysis complete
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          title="Remove file"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  if (phase === 'uploading' || phase === 'analysing') {
    return (
      <div
        style={{
          border: `1.5px dashed ${serviceColor}60`,
          borderRadius: '0.5rem',
          padding: '1rem 1.25rem',
          backgroundColor: `${serviceColor}06`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: phase === 'uploading' ? '0.625rem' : 0 }}>
          {phase === 'analysing'
            ? <Loader2 size={16} style={{ color: serviceColor, flexShrink: 0, animation: 'spin 1s linear infinite' }} />
            : <File size={16} style={{ color: serviceColor, flexShrink: 0 }} />
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {filename}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {phase === 'uploading' ? `Uploading… ${progress}%` : 'Analysing geometry…'}
            </p>
          </div>
        </div>
        {phase === 'uploading' && (
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: serviceColor,
              borderRadius: 2,
              transition: 'width 0.2s ease',
            }} />
          </div>
        )}
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div
        style={{
          border: '1.5px dashed #ef4444',
          borderRadius: '0.5rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'rgba(239,68,68,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444' }}>Upload failed</p>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>{error}</p>
        <button
          type="button"
          onClick={reset}
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#ef4444',
            background: 'none',
            border: '1px solid #ef444440',
            borderRadius: 5,
            padding: '3px 10px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  // Idle state
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragOver ? serviceColor : 'var(--border)'}`,
          borderRadius: '0.5rem',
          padding: '1rem 1.25rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          backgroundColor: dragOver ? `${serviceColor}08` : 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Upload size={15} style={{ color: 'var(--text-muted)', opacity: dragOver ? 1 : 0.5, transition: 'opacity 0.15s' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Drop CAD file or <span style={{ color: serviceColor, fontWeight: 600 }}>browse</span>
          </span>
        </div>
        <p style={{ fontSize: '0.65rem', marginTop: 4, color: 'var(--text-muted)', opacity: 0.6 }}>
          STEP, STP, STL, OBJ — up to 50MB
        </p>
      </div>
    </>
  )
}
