import { CircleDot } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Brass & Copper Machining | Speedcut',
  description: 'CNC machining of brass and copper for electrical, thermal, and decorative components.',
}

export default function BrassCopperPage() {
  return (
    <PlaceholderPage
      title="Brass & Copper"
      category="Material"
      description="Precision CNC machining of brass (CZ121, CW614N) and copper (C101, C106) for electrical connectors, busbars, heat exchangers, and decorative components."
      icon={<CircleDot size={14} />}
    />
  )
}
