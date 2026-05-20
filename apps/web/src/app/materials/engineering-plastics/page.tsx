import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Engineering Plastics — PEEK, Acetal, Nylon | Speedcut',
  description: 'CNC machining of engineering plastics including PEEK, Acetal, Nylon, and PTFE for precision components.',
}

export default function EngineeringPlasticsPage() {
  const data = materialsData['engineering-plastics']
  return <MaterialPageLayout material={data} />
}
