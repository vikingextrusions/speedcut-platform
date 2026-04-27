import { Cog } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'CNC Milling — 3, 4 & 5-Axis | Speedcut',
  description: 'Precision CNC milling services including 3-axis, 4-axis, and 5-axis machining. Upload STEP files for instant quotes.',
}

export default function MillingPage() {
  return (
    <PlaceholderPage
      title="CNC Milling"
      category="Process"
      description="High-precision 3-axis, 4-axis, and 5-axis CNC milling for complex geometries. From prototypes to production runs in aluminium, steel, titanium, and engineering plastics."
      icon={<Cog size={14} />}
    />
  )
}
