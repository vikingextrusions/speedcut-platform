import { Cpu } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Engineering Plastics — PEEK, Acetal, Nylon | Speedcut',
  description: 'CNC machining of engineering plastics including PEEK, Acetal, Nylon, and PTFE for precision components.',
}

export default function EngineeringPlasticsPage() {
  return (
    <PlaceholderPage
      title="Engineering Plastics"
      category="Material"
      description="CNC machining of high-performance engineering plastics including PEEK, Acetal (Delrin), Nylon 6/66, PTFE, and UHMWPE. Ideal for lightweight, non-conductive, or chemically inert components."
      icon={<Cpu size={14} />}
    />
  )
}
