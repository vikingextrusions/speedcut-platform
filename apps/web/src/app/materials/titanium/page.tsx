import { Gauge } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Titanium Machining — Grade 2 & Grade 5 | Speedcut',
  description: 'CNC machining of titanium alloys including Grade 2 and Grade 5 (Ti-6Al-4V) for aerospace and medical applications.',
}

export default function TitaniumPage() {
  return (
    <PlaceholderPage
      title="Titanium"
      category="Material"
      description="Specialist CNC machining of titanium Grade 2 (commercially pure) and Grade 5 (Ti-6Al-4V). High strength-to-weight ratio for aerospace, medical, and motorsport applications."
      icon={<Gauge size={14} />}
    />
  )
}
