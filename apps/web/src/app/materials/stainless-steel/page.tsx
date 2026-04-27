import { Shield } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Stainless Steel Machining — 303, 304, 316 | Speedcut',
  description: 'CNC machining services for stainless steel grades 303, 304, and 316. Corrosion-resistant precision parts.',
}

export default function StainlessSteelPage() {
  return (
    <PlaceholderPage
      title="Stainless Steel"
      category="Material"
      description="Precision machining of stainless steel grades 303, 304, 316, 17-4PH, and duplex. Excellent corrosion resistance for medical, marine, and food-grade applications."
      icon={<Shield size={14} />}
    />
  )
}
