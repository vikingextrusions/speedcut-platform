import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Brass & Copper Machining | Speedcut',
  description: 'CNC machining of brass and copper for electrical, thermal, and decorative components.',
}

export default function BrassCopperPage() {
  const data = materialsData['brass-copper']
  return <MaterialPageLayout material={data} />
}
