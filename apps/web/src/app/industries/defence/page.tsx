import { Shield } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Defence & Security Machining | Speedcut',
  description: 'Precision CNC machining for defence and security applications. ITAR awareness and export-controlled material handling.',
}

export default function DefencePage() {
  return (
    <PlaceholderPage
      title="Defence & Security"
      category="Industry"
      description="Precision machining for defence and security applications. Export-controlled material handling, secure supply chain, and full traceability for classified and restricted programmes."
      icon={<Shield size={14} />}
    />
  )
}
