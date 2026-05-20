import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Titanium Machining — Grade 2 & Grade 5 | Speedcut',
  description: 'CNC machining of titanium alloys including Grade 2 and Grade 5 (Ti-6Al-4V) for aerospace and medical applications.',
}

export default function TitaniumPage() {
  const data = materialsData.titanium
  return <MaterialPageLayout material={data} />
}
