import { login, signup } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  return <LoginPageContent searchParams={searchParams} />
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const message = params?.message

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,217,225,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,143,160,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          animation: 'scale-in 0.3s ease-out',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              marginBottom: '1rem',
              boxShadow: '0 0 30px rgba(0,217,225,0.2)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Speedcut
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              marginTop: '0.5rem',
            }}
          >
            Customer Portal — Request quotes & track orders
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {message && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
              }}
            >
              {message}
            </div>
          )}

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button
              formAction={login}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}
            >
              Sign In
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '0.25rem 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <button
              formAction={signup}
              className="btn-outline"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
              }}
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Footer links */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '1.5rem',
          }}
        >
          Powered by Speedcut MaaS Platform
        </p>
      </div>
    </div>
  )
}
