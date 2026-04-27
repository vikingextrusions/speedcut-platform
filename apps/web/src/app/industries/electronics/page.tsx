import { Cpu } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Electronics & Telecoms Machining | Speedcut',
  description: 'Precision CNC machining for electronics enclosures, heatsinks, and telecoms infrastructure components.',
}

export default function ElectronicsPage() {
  return (
    <PlaceholderPage
      title="Electronics & Telecoms"
      category="Industry"
      description="Precision CNC machining for electronics enclosures, heatsinks, RF shielding, waveguide components, and telecoms infrastructure. Aluminium, copper, and brass expertise."
      icon={<Cpu size={14} />}
    />
  )
}
