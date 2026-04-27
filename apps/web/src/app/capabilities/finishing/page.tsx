import { Layers } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Surface Finishing — Anodising, Plating & Powder Coat | Speedcut',
  description: 'Surface finishing services including anodising, plating, powder coating, and polishing for CNC machined parts.',
}

export default function FinishingPage() {
  return (
    <PlaceholderPage
      title="Surface Finishing"
      category="Service"
      description="Complete surface finishing options including anodising (Type II & III), zinc/nickel plating, powder coating, bead blasting, polishing, and passivation."
      icon={<Layers size={14} />}
    />
  )
}
