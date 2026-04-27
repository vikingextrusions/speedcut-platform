import { ShieldCheck } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Quality & Inspection — CMM & ISO 9001 | Speedcut',
  description: 'Full quality assurance with CMM inspection, ISO 9001 certification, material traceability, and dimensional reporting.',
}

export default function QualityPage() {
  return (
    <PlaceholderPage
      title="Quality & Inspection"
      category="Service"
      description="ISO 9001 certified quality management with CMM dimensional inspection, first article inspection reports (FAIR), material certification, and full traceability."
      icon={<ShieldCheck size={14} />}
    />
  )
}
