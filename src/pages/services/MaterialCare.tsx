import { getMaterialCareGuides } from '@/api/client'
import CareServicePage from './CareServicePage'

export default function MaterialCare() {
  return <CareServicePage moduleType="material-care" guideRequest={getMaterialCareGuides} faqCategory="material-care" layout="grid" />
}
