import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Mild Steel Machining — EN3B, EN8, EN24 | Speedcut',
  description: 'CNC machining for mild and medium carbon steel grades including EN3B, EN8, and EN24.',
}

export default function MildSteelPage() {
  const data = materialsData['mild-steel']
  return <MaterialPageLayout material={data} />
}
