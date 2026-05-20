import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Aluminium Machining — 6082, 7075, 2024 | Speedcut',
  description: 'CNC machining and Wire EDM services for aluminium alloys including 6082, 7075, and 2024. Lightweight, corrosion-resistant parts.',
}

export default function AluminiumPage() {
  const data = materialsData.aluminium
  return <MaterialPageLayout material={data} />
}
