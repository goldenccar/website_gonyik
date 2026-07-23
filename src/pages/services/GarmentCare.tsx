import { useEffect, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { getCareGuides, getFaqs } from '@/api/client'
import { PageSection } from '@/components/PageLayout'
import ServiceFaqList from '@/components/service/ServiceFaqList'
import ServiceSectionHeader from '@/components/service/ServiceSectionHeader'
import { InlineMarkup } from '@/components/MarkupParser'
import type { CareGuide, FAQ } from '@/types'
import type { ServicesOutletContext } from './ServicesLayout'

export default function GarmentCare() {
  const { sections } = useOutletContext<ServicesOutletContext>()
  const section = sections.find((item) => item.module_type === 'garment-care')
  const [guides, setGuides] = useState<CareGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    Promise.all([getCareGuides(), getFaqs('garment-care')]).then(([guideResponse, faqResponse]) => {
      setGuides(guideResponse.data.data || [])
      setFaqs(faqResponse.data.data || [])
    })
  }, [])

  if (!section) return <Navigate to="/services" replace />

  return (
    <PageSection tone="white" className="space-y-16 md:space-y-20">
      <ServiceSectionHeader section={section} />
      <ol className="border-t border-border">
        {guides.map((item, index) => (
          <li key={item.id} className="grid gap-3 border-b border-border py-7 sm:grid-cols-[64px_180px_minmax(0,1fr)] sm:gap-6 md:py-9">
            <span className="label-en pt-1 text-[#4e9bab]">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="text-[18px] font-medium leading-7 text-primary"><InlineMarkup text={item.title} /></h2>
            <p className="max-w-[700px] text-[14px] leading-7 text-secondary"><InlineMarkup text={item.content} /></p>
          </li>
        ))}
      </ol>
      <ServiceFaqList items={faqs} />
    </PageSection>
  )
}
