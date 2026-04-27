import { Stethoscope } from 'lucide-react'
import { PlaceholderPage } from '@/components/placeholder-page'

export const metadata = {
  title: 'Medical Device Machining — ISO 13485 | Speedcut',
  description: 'Precision CNC machining for medical devices and implants. ISO 13485 compatible with biocompatible material options.',
}

export default function MedicalPage() {
  return (
    <PlaceholderPage
      title="Medical"
      category="Industry"
      description="ISO 13485 compatible precision machining for medical devices, surgical instruments, and implant components. Stainless steel, titanium, PEEK, and other biocompatible materials."
      icon={<Stethoscope size={14} />}
    />
  )
}
