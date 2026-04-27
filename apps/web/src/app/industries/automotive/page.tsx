import { Car } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Automotive Machining — IATF 16949 | Speedcut',
  description: 'CNC machining for automotive components. IATF 16949 compliant with high-volume production capability.',
}

export default function AutomotivePage() {
  return (
    <PlaceholderPage
      title="Automotive"
      category="Industry"
      description="IATF 16949 compliant CNC machining for automotive components. From prototype to production volumes — engine parts, transmission components, and chassis fittings."
      icon={<Car size={14} />}
    />
  )
}
