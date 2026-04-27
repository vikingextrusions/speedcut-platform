import { Gem } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Aluminium Machining — 6082, 7075, 2024 | Speedcut',
  description: 'CNC machining and Wire EDM services for aluminium alloys including 6082, 7075, and 2024. Lightweight, corrosion-resistant parts.',
}

export default function AluminiumPage() {
  return (
    <PlaceholderPage
      title="Aluminium"
      category="Material"
      description="CNC milling, turning, and EDM for aluminium alloys. We machine 6082-T6, 7075-T6, 2024, 5083, and more with tight tolerances and excellent surface finishes."
      icon={<Gem size={14} />}
    />
  )
}
