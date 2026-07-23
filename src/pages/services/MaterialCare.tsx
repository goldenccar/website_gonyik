import { useEffect, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { getFaqs, getMaterialCareGuides } from '@/api/client'
import { PageSection } from '@/components/PageLayout'
import ServiceFaqList from '@/components/service/ServiceFaqList'
import ServiceSectionHeader from '@/components/service/ServiceSectionHeader'
import { InlineMarkup } from '@/components/MarkupParser'
import type { CareGuide, FAQ } from '@/types'
import type { ServicesOutletContext } from './ServicesLayout'

export default function MaterialCare() {
  const { sections } = useOutletContext<ServicesOutletContext>()
  const section = sections.find((item) => item.module_type === 'material-care')
  const [guides, setGuides] = useState<CareGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    Promise.all([getMaterialCareGuides(), getFaqs('material-care')]).then(([guideResponse, faqResponse]) => {
      setGuides(guideResponse.data.data || [])
      setFaqs(faqResponse.data.data || [])
    })
  }, [])

  if (!section) return <Navigate to="/services" replace />

  return (
    <PageSection tone="white" className="space-y-16 md:space-y-20">
      <ServiceSectionHeader section={section} />
      <ol className="grid gap-px border border-border/80 bg-border/80 sm:grid-cols-2">
        {guides.map((item, index) => (
          <li key={item.id} className="min-w-0 bg-white px-6 py-7 md:px-8 md:py-9">
            <span className="label-en text-[#4e9bab]">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="mt-5 text-[18px] font-medium leading-7 text-primary"><InlineMarkup text={item.title} /></h2>
            <p className="mt-3 max-w-[580px] text-[14px] leading-7 text-secondary"><InlineMarkup text={item.content} /></p>
          </li>
        ))}
      </ol>
      <ServiceFaqList items={faqs} />
    </PageSection>
  )
}
