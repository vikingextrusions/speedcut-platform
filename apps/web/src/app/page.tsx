import Link from 'next/link'
import { ArrowRight, Crosshair, Shield, Zap } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'
import { createClient } from '@/utils/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div
      data-theme="dark"
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#080c18',
        color: '#e8eaf0',
      }}
    >
      <MarketingHeader isLoggedIn={isLoggedIn} />

      {/* ─── Hero ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ paddingTop: '6rem' }}>
        <div className="max-w-3xl text-center space-y-8 animate-[fade-in_0.5s_ease-out]">
          {/* Hero */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-semibold">
              <Zap size={14} />
              Precision CNC & EDM Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Precision Machined Parts,{' '}
              <span className="text-[var(--accent)]">Delivered Fast</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Upload STEP files and get instant quotes for CNC milling, turning,
              and wire EDM. Precision-manufactured parts with full traceability
              and ISO 9001 certified quality.
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn-primary flex items-center gap-2 px-8 py-3 text-base"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-primary flex items-center gap-2 px-8 py-3 text-base"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/quotes/new"
                  className="btn-secondary flex items-center gap-2 px-8 py-3 text-base"
                >
                  Request a Quote
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="card-hover space-y-3 text-left">
              <Crosshair className="text-[var(--accent)]" size={28} />
              <h3 className="font-bold text-lg">Instant Quoting</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Upload STEP or DXF files and get automated pricing for CNC and EDM in minutes.
              </p>
            </div>
            <div className="card-hover space-y-3 text-left">
              <Shield className="text-[var(--accent)]" size={28} />
              <h3 className="font-bold text-lg">CMM Inspected</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Every part CMM inspected with full material certification and dimensional reports.
              </p>
            </div>
            <div className="card-hover space-y-3 text-left">
              <Zap className="text-[var(--accent)]" size={28} />
              <h3 className="font-bold text-lg">Fast Turnaround</h3>
              <p className="text-sm text-[var(--text-muted)]">
                In-house CNC and EDM capacity with express lead times from 3 working days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
