import { Factory } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Oil & Gas Machining | Speedcut',
  description: 'CNC machining for oil and gas components. Corrosion-resistant materials and high-pressure rated parts.',
}

export default function OilGasPage() {
  return (
    <PlaceholderPage
      title="Oil & Gas"
      category="Industry"
      description="CNC machining of corrosion-resistant components for oil and gas applications. Inconel, duplex stainless, and super duplex parts for downhole, subsea, and topside equipment."
      icon={<Factory size={14} />}
    />
  )
}
