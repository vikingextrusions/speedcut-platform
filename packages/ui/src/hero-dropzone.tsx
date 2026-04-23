'use client'

import React, { useCallback, useRef, useState } from 'react'
import { Upload, Shield, Plus } from 'lucide-react'

const ACCEPTED = ['.step', '.stp', '.stl', '.obj']
const MAX_BYTES = 50 * 1024 * 1024

interface HeroDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  compact?: boolean
}

export function HeroDropzone({ onFilesSelected, disabled, compact }: HeroDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = (files: FileList | File[]): File[] => {
    const valid: File[] = []
    for (const f of Array.from(files)) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      if (ACCEPTED.includes(ext) && f.size <= MAX_BYTES) valid.push(f)
    }
    return valid
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const valid = validate(e.dataTransfer.files)
    if (valid.length) onFilesSelected(valid)
  }, [onFilesSelected, disabled])

  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const valid = validate(e.target.files)
    if (valid.length) onFilesSelected(valid)
    e.target.value = ''
  }, [onFilesSelected])

  // ── Compact mode: small "add another part" strip ──
  if (compact) {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        style={{
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          border: `1.5px dashed ${dragOver ? '#00d9e1' : 'var(--border)'}`,
          backgroundColor: dragOver ? 'rgba(0,217,225,0.04)' : 'transparent',
          cursor: disabled ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = '#00d9e180' }}
        onMouseLeave={(e) => { if (!dragOver) e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          multiple
          onChange={onInput}
          style={{ display: 'none' }}
        />
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(0,217,225,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(0,217,225,0.15)',
          flexShrink: 0,
        }}>
          <Plus size={16} color="#00d9e1" />
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Add another part
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            Drop file or click to browse
          </span>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.6 }}>
          STEP, STP, STL, OBJ
        </span>
      </div>
    )
  }

  // ── Full hero mode ──
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        position: 'relative',
        padding: '3rem 2rem',
        borderRadius: '1rem',
        border: `2px dashed ${dragOver ? '#00d9e1' : 'var(--border)'}`,
        backgroundColor: dragOver ? 'rgba(0,217,225,0.04)' : 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'center',
        transition: 'all 0.25s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        onChange={onInput}
        style={{ display: 'none' }}
      />

      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(0,217,225,0.15), rgba(0,217,225,0.05))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem',
        border: '1px solid rgba(0,217,225,0.2)',
      }}>
        <Upload size={24} color="#00d9e1" />
      </div>

      <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
        Drop your CAD files here to get started
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 420, margin: '0 auto 1rem' }}>
        Upload one or more files — each becomes a separate part to configure
      </p>

      <button type="button" style={{
        padding: '0.5rem 1.5rem', borderRadius: 8,
        border: '1px solid rgba(0,217,225,0.3)',
        backgroundColor: 'rgba(0,217,225,0.08)',
        color: '#00d9e1', fontWeight: 700, fontSize: '0.8rem',
        cursor: 'pointer', transition: 'all 0.15s ease',
        pointerEvents: 'none',
      }}>
        Browse Files
      </button>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, marginTop: '1.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7,
      }}>
        <span>STEP, STP, STL, OBJ</span>
        <span style={{ opacity: 0.3 }}>•</span>
        <span>Up to 50MB each</span>
        <span style={{ opacity: 0.3 }}>•</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Shield size={10} /> Secure upload
        </span>
      </div>
    </div>
  )
}
