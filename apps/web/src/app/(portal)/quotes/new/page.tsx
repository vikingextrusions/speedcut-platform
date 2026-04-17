import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'

export default function NewQuotePage() {
  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Back link */}
      <Link href="/quotes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Request a Quote</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Tell us what you need and we&apos;ll get back to you with pricing
      </p>

      <form action="/api/quotes" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
        {/* Contact / Reference */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Quote Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="customer_reference" className="label">Your Reference</label>
              <input id="customer_reference" name="customer_reference" className="input-field" placeholder="e.g. PO-12345" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="material_type" className="label">Material Type</label>
              <select id="material_type" name="material_type" className="input-field">
                <option value="">Select material...</option>
                <option value="EPDM">EPDM</option>
                <option value="Neoprene">Neoprene</option>
                <option value="Nitrile">Nitrile (NBR)</option>
                <option value="Silicone">Silicone</option>
                <option value="Natural Rubber">Natural Rubber</option>
                <option value="Viton">Viton (FKM)</option>
                <option value="PVC">PVC</option>
                <option value="TPE">TPE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Items</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Item 1 */}
            <div style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-accent">Item 1</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="label">Description *</label>
                  <input name="items[0].description" className="input-field" placeholder="Part description, dimensions, tolerances..." required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="label">Quantity *</label>
                  <input name="items[0].quantity" type="number" min="1" defaultValue="1" className="input-field" required />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost"
            style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            + Add Another Item
          </button>
        </div>

        {/* Notes & Drawings */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Additional Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="notes" className="label">Notes / Special Requirements</label>
              <textarea
                id="notes"
                name="notes"
                className="input-field"
                rows={4}
                placeholder="Any additional notes, special requirements, or delivery instructions..."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Drawings / Documents</label>
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '0.875rem' }}>Drag and drop files here, or click to browse</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>PDF, DXF, DWG, STEP up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link href="/quotes" className="btn-secondary" style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}>
            Cancel
          </Link>
          <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem' }}>
            <Send size={16} />
            Submit Quote Request
          </button>
        </div>
      </form>
    </div>
  )
}
