'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Cpu, Printer, Layers } from 'lucide-react'
import { ServiceCard } from '@speedcut/ui/service-tabs'

const services = [
  {
    id: 'cnc',
    title: 'CNC Machining',
    description: 'Precision CNC milling and turning for metals, plastics, and composites. Tight tolerances and production-ready finishes.',
    icon: <Cpu size={26} />,
    accentColor: '#00d9e1',
    features: [
      'Milling, turning & multi-axis machining',
      'Metals: aluminium, steel, titanium, brass',
      'Tolerances down to ±0.01mm',
      'Surface finishes: anodising, plating, powder coat',
    ],
    href: '/quotes/new/cnc',
  },
  {
    id: '3d-printing',
    title: '3D Printing',
    description: 'Rapid prototyping and low-volume production using industrial additive manufacturing technologies.',
    icon: <Printer size={26} />,
    accentColor: '#a855f7',
    badge: 'Fast Turnaround',
    features: [
      'FDM, SLA, SLS & MJF technologies',
      'Prototyping & end-use parts',
      'Nylon, resin, PETG, ABS & more',
      'Post-processing & finishing available',
    ],
    href: '/quotes/new/3d-printing',
  },
  {
    id: 'sheet-metal',
    title: 'Sheet Metal',
    description: 'Laser cutting, bending, welding and fabrication. Low to mid-volume sheet metal components and assemblies.',
    icon: <Layers size={26} />,
    accentColor: '#f59e0b',
    features: [
      'Laser cutting up to 25mm mild steel',
      'CNC bending & forming',
      'MIG, TIG & spot welding',
      'Powder coating & galvanising',
    ],
    href: '/quotes/new/sheet-metal',
  },
]

export default function NewQuotePage() {
  const router = useRouter()

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* Back link */}
      <Link
        href="/quotes"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
          Request a Quote
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520 }}>
          Choose a manufacturing service to get started. Upload your files and we&apos;ll get back to you with competitive pricing.
        </p>
      </div>

      {/* Service Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}
      >
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            icon={service.icon}
            title={service.title}
            description={service.description}
            features={service.features}
            accentColor={service.accentColor}
            badge={service.badge}
            onClick={() => router.push(service.href)}
          />
        ))}
      </div>

      {/* Help Section */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
            Not sure which service you need?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Our engineering team can help you choose the best manufacturing process for your project.
          </p>
        </div>
        <button className="btn-outline" style={{ whiteSpace: 'nowrap', padding: '0.625rem 1.25rem' }}>
          Contact Engineering
        </button>
      </div>
    </div>
  )
}
