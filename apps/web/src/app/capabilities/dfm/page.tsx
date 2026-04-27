import { Wrench } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Design for Manufacture (DFM) | Speedcut',
  description: 'Expert DFM analysis and optimisation to reduce costs and improve manufacturability of your CNC and EDM parts.',
}

export default function DfmPage() {
  return (
    <PlaceholderPage
      title="Design for Manufacture"
      category="Service"
      description="Expert DFM analysis and design optimisation to reduce manufacturing costs, improve tolerances, and streamline production. Upload your STEP file for automated DFM feedback."
      icon={<Wrench size={14} />}
    />
  )
}
