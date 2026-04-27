import { Target } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Tool Steel Machining & EDM — H13, D2, S7 | Speedcut',
  description: 'CNC machining and Wire EDM for hardened tool steels including H13, D2, and S7. Precision die and mould tooling.',
}

export default function ToolSteelPage() {
  return (
    <PlaceholderPage
      title="Tool Steel"
      category="Material"
      description="CNC machining and Wire EDM of hardened tool steels including H13, D2, S7, A2, and M2. Specialist capability for die, mould, and punch tooling up to 65 HRC."
      icon={<Target size={14} />}
    />
  )
}
