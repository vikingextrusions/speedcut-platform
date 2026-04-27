import { Plane } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Aerospace Machining — AS9100 Ready | Speedcut',
  description: 'Precision CNC machining and EDM for aerospace components. AS9100 ready with full material traceability.',
}

export default function AerospacePage() {
  return (
    <PlaceholderPage
      title="Aerospace"
      category="Industry"
      description="AS9100-ready precision machining for aerospace components. Tight tolerances, exotic materials (titanium, Inconel), full traceability, and first article inspection reports."
      icon={<Plane size={14} />}
    />
  )
}
