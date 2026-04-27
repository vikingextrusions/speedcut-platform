import { Flame } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Inconel & Hastelloy Machining | Speedcut',
  description: 'CNC machining and EDM of high-temperature superalloys including Inconel 625, 718, and Hastelloy C276.',
}

export default function InconelPage() {
  return (
    <PlaceholderPage
      title="Inconel & Hastelloy"
      category="Material"
      description="Expert machining of nickel-based superalloys including Inconel 625, 718, and Hastelloy C276. Suited for extreme temperature, pressure, and corrosive environments."
      icon={<Flame size={14} />}
    />
  )
}
