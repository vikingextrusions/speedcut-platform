import { MaterialPageLayout } from '@/components/material-page-layout'
import { materialsData } from '@/utils/materials-data'

export const metadata = {
  title: 'Tool Steel Machining & EDM — H13, D2, S7 | Speedcut',
  description: 'CNC machining and Wire EDM for hardened tool steels including H13, D2, and S7. Precision die and mould tooling.',
}

export default function ToolSteelPage() {
  const data = materialsData['tool-steel']
  return <MaterialPageLayout material={data} />
}
