import { Wrench } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Tooling & Mould-Making — EDM Electrodes | Speedcut',
  description: 'CNC machining and Wire EDM for tooling, moulds, and die components. Precision EDM electrodes and cavity machining.',
}

export default function ToolingPage() {
  return (
    <PlaceholderPage
      title="Tooling & Mould-Making"
      category="Industry"
      description="Precision CNC and EDM services for mould tools, press dies, EDM electrodes, and injection mould inserts. Wire EDM and spark erosion for complex cavities in hardened tool steels."
      icon={<Wrench size={14} />}
    />
  )
}
