import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing-header'

interface PlaceholderPageProps {
  title: string
  category: string
  description: string
  icon: React.ReactNode
}

export function PlaceholderPage({ title, category, description, icon }: PlaceholderPageProps) {
  return (
    <div
      data-theme="dark"
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#080c18', color: '#e8eaf0' }}
    >
      <MarketingHeader />

      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ paddingTop: '8rem' }}>
        <div className="max-w-2xl text-center space-y-8 animate-[fade-in_0.5s_ease-out]">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-semibold">
            {icon}
            {category}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto">
            {description}
          </p>

          {/* Coming Soon Notice */}
          <div className="card max-w-md mx-auto text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(0,217,225,0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(0,217,225,0.2)',
              }}
            >
              Coming Soon
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              This page is under development. Get in touch to learn more about our {title.toLowerCase()} capabilities.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link href="/" className="btn-ghost flex items-center gap-2 text-sm">
                <ArrowLeft size={16} />
                Back Home
              </Link>
              <Link href="/quotes/new" className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5">
                Get a Quote
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[var(--text-muted)]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Speedcut. All rights reserved.
      </footer>
    </div>
  )
}
