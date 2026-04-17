import Link from 'next/link'
import { ArrowRight, LogIn, Package, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Top Nav ─── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(var(--bg-primary-rgb, 10, 15, 30), 0.8)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Zap size={20} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 800, fontSize: '1.125rem', fontStyle: 'italic' }}>Speedcut</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/login"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            <LogIn size={16} />
            Sign In
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ paddingTop: '5rem' }}>
        <div className="max-w-3xl text-center space-y-8 animate-[fade-in_0.5s_ease-out]">
          {/* Hero */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-semibold">
              <Zap size={14} />
              Digital Manufacturing Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Custom Parts,{' '}
              <span className="text-[var(--accent)]">Delivered Fast</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Get instant quotes for custom rubber extrusions, seals, and gaskets.
              Upload your drawings and receive precision-manufactured parts from our
              network of certified manufacturers.
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
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
          </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="card-hover space-y-3 text-left">
            <Package className="text-[var(--accent)]" size={28} />
            <h3 className="font-bold text-lg">Instant Quoting</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Upload CAD files and get automated pricing in minutes, not days.
            </p>
          </div>
          <div className="card-hover space-y-3 text-left">
            <Shield className="text-[var(--accent)]" size={28} />
            <h3 className="font-bold text-lg">Quality Assured</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Every part inspected and certified. Full traceability from order to delivery.
            </p>
          </div>
          <div className="card-hover space-y-3 text-left">
            <Zap className="text-[var(--accent)]" size={28} />
            <h3 className="font-bold text-lg">Fast Turnaround</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Leveraging our partner network to deliver parts when you need them.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
