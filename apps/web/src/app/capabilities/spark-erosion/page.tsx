import { Flame } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Spark Erosion — Sinker / Die-Sink EDM | Speedcut',
  description: 'Spark erosion (sinker EDM) services for complex cavities, moulds, and die tooling in hardened materials.',
}

export default function SparkErosionPage() {
  return (
    <PlaceholderPage
      title="Spark Erosion"
      category="Process"
      description="Sinker and die-sink EDM for producing complex cavities, textured surfaces, and precision moulds in hardened tool steels and exotic alloys."
      icon={<Flame size={14} />}
    />
  )
}
