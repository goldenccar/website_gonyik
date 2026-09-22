import { getCareGuides } from '@/api/client'
import CareServicePage from './CareServicePage'

export default function GarmentCare() {
  return <CareServicePage moduleType="garment-care" guideRequest={getCareGuides} faqCategory="garment-care" />
}
