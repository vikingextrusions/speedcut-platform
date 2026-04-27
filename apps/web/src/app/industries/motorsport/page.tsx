import { Anchor } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Motorsport & Marine Machining | Speedcut',
  description: 'High-performance CNC machined components for motorsport and marine applications. Lightweight, precision parts.',
}

export default function MotorsportPage() {
  return (
    <PlaceholderPage
      title="Motorsport & Marine"
      category="Industry"
      description="High-performance CNC machined components for motorsport and marine applications. Lightweight titanium and aluminium parts, corrosion-resistant marine hardware, and rapid turnaround for race-day deadlines."
      icon={<Anchor size={14} />}
    />
  )
}
