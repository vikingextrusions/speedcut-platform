import { Building2 } from 'lucide-react'

export default function PartnerHomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 animate-[fade-in_0.5s_ease-out]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <Building2 className="text-[var(--accent)]" size={32} />
        </div>
        <h1 className="page-title text-4xl">Partner Portal</h1>
        <p className="text-[var(--text-muted)] text-lg max-w-md">
          Manufacturer dashboard for managing jobs, capacity, and quotes
          from the Speedcut platform.
        </p>
        <div className="badge-accent">Coming Soon</div>
      </div>
    </div>
  )
}
