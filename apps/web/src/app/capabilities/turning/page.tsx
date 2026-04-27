import { CircleDot } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'CNC Turning — Lathes & Mill-Turn | Speedcut',
  description: 'Precision CNC turning services on lathes and mill-turn centres. Tight tolerances for round and cylindrical components.',
}

export default function TurningPage() {
  return (
    <PlaceholderPage
      title="CNC Turning"
      category="Process"
      description="Precision CNC turning on lathes and multi-axis mill-turn centres. Ideal for shafts, bushings, fittings, and cylindrical components with tight tolerances."
      icon={<CircleDot size={14} />}
    />
  )
}
