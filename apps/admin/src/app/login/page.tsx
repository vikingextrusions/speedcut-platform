import { login } from './actions'

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
      {/* Ambient glow — admin amber tint */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-25%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,217,225,0.05) 0%, transparent 70%)',
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
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              marginBottom: '1rem',
              boxShadow: '0 0 30px rgba(245,158,11,0.25)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
              <path d="M12 2a10 10 0 0 1 10 10" />
              <path d="M12 12l8.5-5" />
              <path d="M12 12l0-10" />
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
            Speedcut <span style={{ color: '#f59e0b' }}>Admin</span>
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              marginTop: '0.5rem',
            }}
          >
            Internal Management Console
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
                placeholder="admin@speedcut.co.uk"
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
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 10px 15px -3px rgba(245,158,11,0.2)',
              }}
            >
              Sign In
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            🔒 Restricted to authorised Speedcut staff
          </div>
        </div>

        {/* Footer */}
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
