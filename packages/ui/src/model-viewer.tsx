'use client'

import React, { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, GizmoHelper, GizmoViewport, Center, Html } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import {
  Maximize2, Minimize2, Grid3x3, Axis3D, Box,
  RotateCcw, Eye, Loader2, Ruler
} from 'lucide-react'

// ─── Types ───

export interface ModelViewerProps {
  meshUrl: string
  boundingBox?: { x_mm: number; y_mm: number; z_mm: number }
  height?: number | string
  serviceColor?: string
  showToolbar?: boolean
  onFullscreen?: () => void
  isFullscreen?: boolean
  onCloseFullscreen?: () => void
}

// ─── AA Battery for scale (50.5mm tall, 14.5mm diameter) ───

function AABattery({ position }: { position: [number, number, number] }) {
  const bodyHeight = 50.5
  const bodyRadius = 7.25
  const nippleHeight = 1.5
  const nippleRadius = 2.75

  return (
    <group position={position}>
      {/* Main body — dark blue/grey */}
      <mesh position={[0, bodyHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 24]} />
        <meshPhysicalMaterial color="#2d3748" metalness={0.1} roughness={0.6} />
      </mesh>
      {/* Gold top cap */}
      <mesh position={[0, bodyHeight - 2, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.1, bodyRadius + 0.1, 4, 24]} />
        <meshPhysicalMaterial color="#c9a227" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Positive nipple */}
      <mesh position={[0, bodyHeight + nippleHeight / 2, 0]}>
        <cylinderGeometry args={[nippleRadius, nippleRadius, nippleHeight, 12]} />
        <meshPhysicalMaterial color="#d4a843" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Silver bottom */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.1, bodyRadius + 0.1, 4, 24]} />
        <meshPhysicalMaterial color="#a0aec0" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Label text — green band */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.15, bodyRadius + 0.15, bodyHeight * 0.5, 24]} />
        <meshPhysicalMaterial color="#276749" metalness={0.05} roughness={0.7} />
      </mesh>
      {/* Label — "AA" text overlay via Html */}
    </group>
  )
}

// ─── Scene Content (model + grid at base + scale ref) ───

function SceneContent({ url, wireframe, showGrid, showScale }: {
  url: string; wireframe: boolean; showGrid: boolean; showScale: boolean
}) {
  const gltf = useLoader(GLTFLoader, url)
  const groupRef = useRef<THREE.Group>(null)
  const [baseY, setBaseY] = useState(0)
  const [partExtent, setPartExtent] = useState(30) // default offset for scale ref

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Solid fill material
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0.55, 0.56, 0.58),
            metalness: 0.3,
            roughness: 0.45,
            clearcoat: 0.08,
            clearcoatRoughness: 0.3,
            wireframe,
            envMapIntensity: 0.8,
          })
          child.castShadow = true
          child.receiveShadow = true

          // Edge outlines
          const oldEdges = child.children.filter(c => c.userData.__edges)
          oldEdges.forEach(e => child.remove(e))

          if (!wireframe) {
            const edgesGeo = new THREE.EdgesGeometry(child.geometry, 25)
            const edgesMat = new THREE.LineBasicMaterial({
              color: new THREE.Color(0.3, 0.31, 0.33),
              linewidth: 1,
              transparent: true,
              opacity: 0.35,
            })
            const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat)
            edgeLines.userData.__edges = true
            child.add(edgeLines)
          }
        }
      })
    }
  }, [gltf, wireframe])

  // Compute base Y after centering
  useEffect(() => {
    // Small delay to let Center do its work
    const t = setTimeout(() => {
      if (groupRef.current) {
        const box = new THREE.Box3().setFromObject(groupRef.current)
        setBaseY(box.min.y)
        // Place scale ref just outside the part's X extent
        setPartExtent(Math.max((box.max.x - box.min.x) / 2 + 15, 30))
      }
    }, 100)
    return () => clearTimeout(t)
  }, [gltf])

  return (
    <>
      <Center ref={groupRef}>
        <primitive object={gltf.scene.clone(true)} />
      </Center>

      {/* Grid at base of part */}
      {showGrid && (
        <Grid
          position={[0, baseY - 0.01, 0]}
          args={[200, 200]}
          cellSize={5}
          cellThickness={0.4}
          cellColor="#d1d5db"
          sectionSize={25}
          sectionThickness={0.8}
          sectionColor="#b0b5bc"
          fadeDistance={150}
          fadeStrength={1.5}
          followCamera={false}
        />
      )}

      {/* Scale reference — AA battery */}
      {showScale && (
        <AABattery position={[partExtent, baseY, 0]} />
      )}
    </>
  )
}

// ─── Dimension Overlay ───

function BoundingBoxOverlay({ bb }: { bb: { x_mm: number; y_mm: number; z_mm: number } }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 8,
      left: 8,
      fontSize: '0.65rem',
      fontWeight: 600,
      fontFamily: 'monospace',
      color: '#6b7280',
      opacity: 0.8,
      pointerEvents: 'none',
      display: 'flex',
      gap: '0.5rem',
    }}>
      <span style={{ color: '#ef4444' }}>X:{bb.x_mm.toFixed(1)}</span>
      <span style={{ color: '#22c55e' }}>Y:{bb.y_mm.toFixed(1)}</span>
      <span style={{ color: '#3b82f6' }}>Z:{bb.z_mm.toFixed(1)}</span>
      <span style={{ opacity: 0.5 }}>mm</span>
    </div>
  )
}

// ─── Loading Spinner ───

function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-muted)',
      }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Loading 3D model...</span>
      </div>
    </Html>
  )
}

// ─── Toolbar Button ───

function ToolbarButton({
  active,
  onClick,
  title,
  children,
  color,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 5,
        border: '1px solid #d1d5db',
        background: active ? (color || '#6b7280') + '18' : '#ffffff',
        color: active ? (color || '#6b7280') : '#9ca3af',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        opacity: active ? 1 : 0.6,
        padding: 0,
      }}
    >
      {children}
    </button>
  )
}

// ─── Main Component ───

export function ModelViewer({
  meshUrl,
  boundingBox,
  height = 280,
  serviceColor = '#00d9e1',
  showToolbar = true,
  onFullscreen,
  isFullscreen = false,
  onCloseFullscreen,
}: ModelViewerProps) {
  const [showGrid, setShowGrid] = useState(true)
  const [showAxes, setShowAxes] = useState(true)
  const [wireframe, setWireframe] = useState(false)
  const [showScale, setShowScale] = useState(false)
  const [loadError, setLoadError] = useState(false)

  if (loadError) {
    return (
      <div style={{
        height,
        borderRadius: '0.5rem',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--glass-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
      }}>
        3D preview unavailable
      </div>
    )
  }

  return (
    <div style={{
      height,
      borderRadius: isFullscreen ? 0 : '0.5rem',
      border: isFullscreen ? 'none' : '1px solid var(--border)',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#f0f1f3',
    }}>
      <Canvas
        shadows
        camera={{ position: [80, 60, 80], fov: 35 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onError={() => setLoadError(true)}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#eceef1')
          scene.background = new THREE.Color('#eceef1')
        }}
      >
        {/* Lighting — key/fill/rim for industrial look */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 80, 50]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-30, 40, -20]} intensity={0.6} />
        <directionalLight position={[0, -20, 40]} intensity={0.2} />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Axes gizmo */}
        {showAxes && (
          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport
              axisColors={['#ef4444', '#22c55e', '#3b82f6']}
              labelColor="white"
            />
          </GizmoHelper>
        )}

        {/* Model + grid at base + scale reference */}
        <Suspense fallback={<LoadingFallback />}>
          <SceneContent url={meshUrl} wireframe={wireframe} showGrid={showGrid} showScale={showScale} />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.5}
          minDistance={5}
          maxDistance={500}
        />
      </Canvas>

      {/* Bounding box dimensions overlay */}
      {boundingBox && <BoundingBoxOverlay bb={boundingBox} />}

      {/* Toolbar */}
      {showToolbar && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 4,
          zIndex: 10,
        }}>
          <ToolbarButton
            active={showGrid}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle grid"
            color="#64748b"
          >
            <Grid3x3 size={13} />
          </ToolbarButton>
          <ToolbarButton
            active={showAxes}
            onClick={() => setShowAxes(!showAxes)}
            title="Toggle axes"
            color="#3b82f6"
          >
            <Axis3D size={13} />
          </ToolbarButton>
          <ToolbarButton
            active={wireframe}
            onClick={() => setWireframe(!wireframe)}
            title="Toggle wireframe"
            color="#a855f7"
          >
            <Box size={13} />
          </ToolbarButton>
          <ToolbarButton
            active={showScale}
            onClick={() => setShowScale(!showScale)}
            title="Toggle scale reference (AA battery)"
            color="#f59e0b"
          >
            <Ruler size={13} />
          </ToolbarButton>

          {/* Separator */}
          <div style={{ width: 1, background: 'var(--border)', margin: '4px 2px', opacity: 0.5 }} />

          {isFullscreen ? (
            <ToolbarButton
              onClick={() => onCloseFullscreen?.()}
              title="Exit fullscreen"
              color={serviceColor}
            >
              <Minimize2 size={13} />
            </ToolbarButton>
          ) : onFullscreen ? (
            <ToolbarButton
              onClick={onFullscreen}
              title="Fullscreen"
              color={serviceColor}
            >
              <Maximize2 size={13} />
            </ToolbarButton>
          ) : null}
        </div>
      )}

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}


// ─── Viewer Modal (centered dialog with info panel) ───

import type { GeometryResult } from './file-dropzone'

export function ModelViewerModal({
  meshUrl,
  boundingBox,
  serviceColor,
  onClose,
  filename,
  geometryResult,
}: {
  meshUrl: string
  boundingBox?: { x_mm: number; y_mm: number; z_mm: number }
  serviceColor?: string
  onClose: () => void
  filename?: string
  geometryResult?: GeometryResult
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const gr = geometryResult
  const bb = boundingBox || gr?.bounding_box

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div style={{
        width: '90vw',
        maxWidth: 1200,
        height: '85vh',
        maxHeight: 760,
        borderRadius: 12,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        backgroundColor: '#ffffff',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Left: 3D Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 14px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} style={{ color: serviceColor || '#00d9e1' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1f2937' }}>
                3D Preview
              </span>
              {filename && (
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                  — {filename}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
                background: '#ffffff', border: '1px solid #d1d5db',
                borderRadius: 5, padding: '3px 10px', cursor: 'pointer',
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Viewer */}
          <div style={{ flex: 1 }}>
            <ModelViewer
              meshUrl={meshUrl}
              boundingBox={bb}
              height="100%"
              serviceColor={serviceColor}
              showToolbar
            />
          </div>
        </div>

        {/* Right: Info Panel */}
        <div style={{
          borderLeft: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Dimensions */}
          {bb && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dimensions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'X', value: bb.x_mm, color: '#ef4444' },
                  { label: 'Y', value: bb.y_mm, color: '#22c55e' },
                  { label: 'Z', value: bb.z_mm, color: '#3b82f6' },
                ].map(d => (
                  <div key={d.label} style={{
                    padding: '6px 8px', borderRadius: 6,
                    backgroundColor: '#ffffff', border: '1px solid #e5e7eb',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: d.color, marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937' }}>{d.value.toFixed(1)}</div>
                    <div style={{ fontSize: '0.58rem', color: '#9ca3af' }}>mm</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Geometry Metrics */}
          {gr && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Geometry
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Volume', value: gr.volume_mm3 ? `${(gr.volume_mm3 / 1000).toFixed(1)} cm³` : '—' },
                  { label: 'Surface Area', value: gr.surface_area_mm2 ? `${(gr.surface_area_mm2 / 100).toFixed(1)} cm²` : '—' },
                  { label: 'Face Count', value: gr.face_count?.toLocaleString() || '—' },
                  { label: 'Watertight', value: gr.is_watertight ? '✓ Yes' : '✗ No' },
                  { label: 'Min Wall', value: gr.wall_thickness_min_mm ? `${gr.wall_thickness_min_mm.toFixed(2)} mm` : '—' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '4px 0',
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>{row.label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1f2937', fontFamily: 'monospace' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Recommendation */}
          {gr?.recommended_process && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Recommendation
              </h4>
              <div style={{
                padding: '8px 10px', borderRadius: 6,
                backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>
                  {gr.recommended_process === 'CNC' ? 'CNC Machining' :
                   gr.recommended_process === '3DP' ? '3D Printing' :
                   gr.recommended_process === 'SHEET_METAL' ? 'Sheet Metal' : gr.recommended_process}
                </div>
                {gr.process_confidence && (
                  <div style={{ fontSize: '0.65rem', color: '#15803d', marginTop: 2 }}>
                    {Math.round(gr.process_confidence * 100)}% confidence
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complexity */}
          {gr?.complexity_score != null && (
            <div style={{ padding: '14px 16px' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Complexity
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${Math.min(gr.complexity_score * 100, 100)}%`,
                    background: gr.complexity_score < 0.3 ? '#22c55e' :
                                gr.complexity_score < 0.7 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1f2937', minWidth: 35, textAlign: 'right' }}>
                  {(gr.complexity_score * 10).toFixed(1)}
                </span>
              </div>
              <div style={{ fontSize: '0.62rem', color: '#9ca3af', marginTop: 4 }}>
                {gr.complexity_score < 0.3 ? 'Low complexity' :
                 gr.complexity_score < 0.7 ? 'Medium complexity' : 'High complexity'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
