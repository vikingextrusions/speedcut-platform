import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Stainless Steel Machining — 303, 304, 316 | Speedcut',
  description: 'CNC machining services for stainless steel grades 303, 304, and 316. Corrosion-resistant precision parts.',
}

export default function StainlessSteelPage() {
  const data = materialsData['stainless-steel']
  return <MaterialPageLayout material={data} />
}
