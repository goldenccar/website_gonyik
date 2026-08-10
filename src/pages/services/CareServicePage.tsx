import { useCallback, useEffect, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import type { AxiosResponse } from 'axios'
import { getFaqs } from '@/api/client'
import { PageSection } from '@/components/PageLayout'
import ServiceFaqList from '@/components/service/ServiceFaqList'
import ServiceSectionHeader from '@/components/service/ServiceSectionHeader'
import { InlineMarkup } from '@/components/MarkupParser'
import PublicContentLoader from '@/components/PublicContentLoader'
import type { CareGuide, FAQ } from '@/types'
import type { ServicesOutletContext } from './ServicesLayout'
import { useSiteLocale } from '@/i18n/SiteLocale'

interface CareServicePageProps {
  moduleType: 'material-care' | 'garment-care'
  guideRequest: () => Promise<AxiosResponse<any>>
  faqCategory: 'material-care' | 'garment-care'
  layout: 'grid' | 'editorial-list'
}

export default function CareServicePage({ moduleType, guideRequest, faqCategory, layout }: CareServicePageProps) {
  const { path: localePath } = useSiteLocale()
  const { sections } = useOutletContext<ServicesOutletContext>()
  const section = sections.find((item) => item.module_type === moduleType)
  const [guides, setGuides] = useState<CareGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(() => {
    setStatus('loading')
    Promise.all([guideRequest(), getFaqs(faqCategory)])
      .then(([guideResponse, faqResponse]) => {
        setGuides(guideResponse.data.data || [])
        setFaqs(faqResponse.data.data || [])
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [faqCategory, guideRequest])

  useEffect(load, [load])

  if (!section) return <Navigate to={localePath('/services')} replace />
  if (status === 'loading') return <PublicContentLoader label="正在加载护理内容" />
  if (status === 'error') return <PageSection tone="white"><div role="alert" className="border-l-2 border-[#69B2C1] pl-5"><p className="text-[16px] text-primary">护理内容加载失败。</p><button type="button" onClick={load} className="mt-4 border-b border-primary text-[14px] text-primary">重新加载</button></div></PageSection>

  return (
    <PageSection tone="white" className="space-y-16 md:space-y-20">
      <ServiceSectionHeader section={section} />
      {layout === 'grid' ? (
        <ol className="grid gap-px border border-border/80 bg-border/80 sm:grid-cols-2">
          {guides.map((item, index) => <li key={item.id} className="min-w-0 bg-white px-6 py-7 md:px-8 md:py-9"><span className="label-en text-[#4e9bab]">{String(index + 1).padStart(2, '0')}</span><h2 className="mt-5 text-[18px] font-medium leading-7 text-primary"><InlineMarkup text={item.title} /></h2><p className="mt-3 max-w-[580px] text-[16px] leading-[1.75] text-secondary"><InlineMarkup text={item.content} /></p></li>)}
        </ol>
      ) : (
        <ol className="border-t border-border">
          {guides.map((item, index) => <li key={item.id} className="grid gap-3 border-b border-border py-7 sm:grid-cols-[64px_180px_minmax(0,1fr)] sm:gap-6 md:py-9"><span className="label-en pt-1 text-[#4e9bab]">{String(index + 1).padStart(2, '0')}</span><h2 className="text-[18px] font-medium leading-7 text-primary"><InlineMarkup text={item.title} /></h2><p className="max-w-[700px] text-[16px] leading-[1.75] text-secondary"><InlineMarkup text={item.content} /></p></li>)}
        </ol>
      )}
      <ServiceFaqList items={faqs} />
    </PageSection>
  )
}
