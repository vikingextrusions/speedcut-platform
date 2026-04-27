import { Crosshair } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Wire EDM — Precision Wire Erosion | Speedcut',
  description: 'Wire EDM cutting services for intricate profiles and tight-tolerance components. Ideal for hardened materials and complex geometries.',
}

export default function WireEdmPage() {
  return (
    <PlaceholderPage
      title="Wire EDM"
      category="Process"
      description="Precision wire erosion cutting for intricate profiles, tight-tolerance slots, and complex contours. Perfect for hardened tool steels, carbide, and exotic alloys."
      icon={<Crosshair size={14} />}
    />
  )
}
