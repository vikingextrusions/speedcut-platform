import { Cog } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Mild Steel Machining — EN3B, EN8, EN24 | Speedcut',
  description: 'CNC machining for mild and medium carbon steel grades including EN3B, EN8, and EN24.',
}

export default function MildSteelPage() {
  return (
    <PlaceholderPage
      title="Mild Steel"
      category="Material"
      description="Cost-effective CNC machining of mild and medium carbon steels including EN3B, EN8, EN24, and EN19. Ideal for structural components, fixtures, and general engineering."
      icon={<Cog size={14} />}
    />
  )
}
