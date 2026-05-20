import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Inconel & Hastelloy Machining | Speedcut',
  description: 'CNC machining and EDM of high-temperature superalloys including Inconel 625, 718, and Hastelloy C276.',
}

export default function InconelPage() {
  const data = materialsData.inconel
  return <MaterialPageLayout material={data} />
}
