'use client'

import { Button } from '@speedcut/ui/button'
import { Input, Textarea, Select } from '@speedcut/ui/input'
import { Card, CardHeader } from '@speedcut/ui/card'
import { Badge } from '@speedcut/ui/badge'
import { ThemeToggle } from '@speedcut/ui/theme-toggle'
import {
  Save,
  Trash2,
  Plus,
  Download,
  Search,
  Bell,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-16 animate-[fade-in_0.4s_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-4"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
            <h1 className="page-title text-4xl">
              Design System{' '}
              <span className="text-[var(--accent)]">Preview</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg">
              Speedcut Platform — Extracted branding applied to all shared UI
              components.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* ─── COLOR PALETTE ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Color Palette</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <ColorSwatch name="Accent" cssVar="--accent" hex="#00d9e1" />
            <ColorSwatch name="BG Primary" cssVar="--bg-primary" hex="#0f172a" />
            <ColorSwatch name="BG Surface" cssVar="--bg-surface" hex="#1e293b" />
            <ColorSwatch name="Text Primary" cssVar="--text-primary" hex="#f8fafc" />
            <ColorSwatch name="Text Muted" cssVar="--text-muted" hex="#94a3b8" />
            <ColorSwatch name="Border" cssVar="--border" hex="rgba(255,255,255,0.1)" />
            <ColorSwatch name="Success" cssVar="--success" hex="#10b981" />
            <ColorSwatch name="Warning" cssVar="--warning" hex="#f59e0b" />
            <ColorSwatch name="Error" cssVar="--error" hex="#ef4444" />
            <ColorSwatch name="Glass BG" cssVar="--glass-bg" hex="rgba(30,41,59,0.7)" />
            <ColorSwatch name="Accent Hover" cssVar="--accent-hover" hex="#00f0f9" />
            <ColorSwatch name="Elevated" cssVar="--bg-elevated" hex="#334155" />
          </div>
        </section>

        {/* ─── TYPOGRAPHY ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Typography</h2>
          <Card>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="micro-label">Font Family</p>
                <p className="text-lg">
                  <span className="font-[family-name:var(--font-geist-sans)]">Geist Sans</span>{' '}
                  <span className="text-[var(--text-muted)]">•</span>{' '}
                  <span className="font-[family-name:var(--font-geist-mono)] text-[var(--text-muted)]">Geist Mono</span>
                </p>
              </div>
              <div className="space-y-4 border-t border-[var(--border)] pt-6">
                <div className="flex items-baseline gap-6">
                  <span className="micro-label w-24 shrink-0">Page Title</span>
                  <h1 className="page-title">The quick brown fox</h1>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="micro-label w-24 shrink-0">Section</span>
                  <h2 className="section-title border-none pb-0">Section Heading</h2>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="micro-label w-24 shrink-0">Body</span>
                  <p className="text-base">
                    Body text for descriptions and content blocks. Optimised for readability.
                  </p>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="micro-label w-24 shrink-0">Muted</span>
                  <p className="text-sm text-[var(--text-muted)]">
                    Secondary text for supporting information and metadata.
                  </p>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="micro-label w-24 shrink-0">Micro Label</span>
                  <span className="micro-label">TRACKING · LABEL · STYLE</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ─── BUTTONS ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Buttons</h2>

          <Card>
            <div className="space-y-8">
              {/* Variants */}
              <div className="space-y-3">
                <p className="micro-label">Variants</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <p className="micro-label">Sizes</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* With Icons */}
              <div className="space-y-3">
                <p className="micro-label">With Icons</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button icon={<Save size={16} />}>Save</Button>
                  <Button variant="secondary" icon={<Download size={16} />}>
                    Export
                  </Button>
                  <Button variant="outline" icon={<Plus size={16} />}>
                    Add New
                  </Button>
                  <Button variant="destructive" icon={<Trash2 size={16} />}>
                    Delete
                  </Button>
                </div>
              </div>

              {/* States */}
              <div className="space-y-3">
                <p className="micro-label">States</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ─── INPUTS ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Form Inputs</h2>

          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Company Name"
                placeholder="e.g. Viking Extrusions Ltd"
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="contact@example.com"
                hint="We'll never share your email."
              />
              <Input
                label="Part Number"
                placeholder="SC-00001"
                error="This part number already exists"
              />
              <Select
                label="Credit Terms"
                options={[
                  { value: 'proforma', label: 'Pro-forma' },
                  { value: '30', label: '30 Days' },
                  { value: '60', label: '60 Days' },
                  { value: 'immediate', label: 'Immediate' },
                ]}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Notes"
                  placeholder="Internal notes about this order..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <input
                      className="input-field pl-9"
                      placeholder="Search customers..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ─── CARDS ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Cards</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader title="Standard Card" description="Default glassmorphism effect with backdrop blur." />
              <p className="text-sm text-[var(--text-muted)] mt-4">
                Cards use semi-transparent backgrounds with blur effects to create depth.
              </p>
            </Card>

            <Card hoverable>
              <CardHeader
                title="Hoverable Card"
                description="Hover to see the accent border glow."
                action={<Badge variant="accent">New</Badge>}
              />
              <p className="text-sm text-[var(--text-muted)] mt-4">
                Interactive cards with hover state for clickable surfaces.
              </p>
            </Card>

            <Card hoverable>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Bell className="text-amber-500" size={24} />
                  <span className="micro-label">Requires action</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-muted)]">
                    Pending Quotes
                  </p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">14</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ─── BADGES ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Badges</h2>
          <Card>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="success">Accepted</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Rejected</Badge>
              <Badge variant="info">In Review</Badge>
              <Badge variant="accent">New</Badge>
              <Badge variant="neutral">Draft</Badge>
            </div>
          </Card>
        </section>

        {/* ─── GLASS EFFECT DEMO ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Glass Effect</h2>
          <div className="relative rounded-2xl overflow-hidden h-64">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/30 via-blue-500/20 to-purple-500/30" />
            <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--accent)] rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-30" />

            {/* Glass card on top */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="card max-w-md w-full space-y-4">
                <h3 className="text-xl font-bold">Glassmorphism</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  All surfaces use semi-transparent backgrounds with backdrop blur,
                  matching the existing Speedcut_App aesthetic. This creates a modern,
                  layered depth effect that works beautifully in both dark and light modes.
                </p>
                <div className="flex gap-3">
                  <Button size="sm">Learn More</Button>
                  <Button variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SPACING & TOKENS ─── */}
        <section className="space-y-6">
          <h2 className="section-title">Design Tokens Summary</h2>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="micro-label">Border Radius</p>
                <div className="flex items-end gap-4">
                  <div className="w-12 h-12 bg-[var(--accent)]/20 border border-[var(--accent)]/40 rounded-sm" />
                  <div className="w-12 h-12 bg-[var(--accent)]/20 border border-[var(--accent)]/40 rounded-lg" />
                  <div className="w-12 h-12 bg-[var(--accent)]/20 border border-[var(--accent)]/40 rounded-xl" />
                  <div className="w-12 h-12 bg-[var(--accent)]/20 border border-[var(--accent)]/40 rounded-2xl" />
                  <div className="w-12 h-12 bg-[var(--accent)]/20 border border-[var(--accent)]/40 rounded-full" />
                </div>
                <div className="flex gap-4 text-[10px] text-[var(--text-muted)] font-mono">
                  <span className="w-12 text-center">sm</span>
                  <span className="w-12 text-center">lg</span>
                  <span className="w-12 text-center">xl</span>
                  <span className="w-12 text-center">2xl</span>
                  <span className="w-12 text-center">full</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="micro-label">Shadows & Glow</p>
                <div className="flex items-end gap-4">
                  <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-xl shadow-lg" />
                  <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-xl shadow-[0_0_20px_rgba(0,217,225,0.15)]" />
                  <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-xl shadow-[0_0_30px_rgba(0,217,225,0.3)]" />
                </div>
                <div className="flex gap-4 text-[10px] text-[var(--text-muted)] font-mono">
                  <span className="w-16 text-center">shadow</span>
                  <span className="w-16 text-center">glow</span>
                  <span className="w-16 text-center">intense</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-[var(--text-muted)] pb-8 border-t border-[var(--border)] pt-8">
          <p>
            Speedcut Platform Design System •{' '}
            <span className="text-[var(--accent)]">
              Branding extracted from Speedcut_App
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Color Swatch Component ─── */

function ColorSwatch({
  name,
  cssVar,
  hex,
}: {
  name: string
  cssVar: string
  hex: string
}) {
  return (
    <div className="space-y-2">
      <div
        className="w-full aspect-square rounded-xl border border-[var(--border)] shadow-inner"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <p className="text-xs font-bold">{name}</p>
      <p className="text-[10px] text-[var(--text-muted)] font-mono">{hex}</p>
    </div>
  )
}
