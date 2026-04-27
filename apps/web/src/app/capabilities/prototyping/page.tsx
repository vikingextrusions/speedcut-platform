import { Zap } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Rapid Prototyping — First-Off in 48 Hours | Speedcut',
  description: 'Fast prototyping services for CNC machined and EDM parts. First-off samples delivered within 48 hours.',
}

export default function PrototypingPage() {
  return (
    <PlaceholderPage
      title="Rapid Prototyping"
      category="Service"
      description="Get first-off samples in as little as 48 hours. Iterate designs quickly with our rapid CNC and EDM prototyping service before committing to production volumes."
      icon={<Zap size={14} />}
    />
  )
}
