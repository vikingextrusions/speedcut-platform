import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '1rem',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '1rem',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Access Denied
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          This portal is restricted to approved manufacturing partners.
          If you believe this is an error, contact Speedcut support.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
