import { useCallback, useEffect, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import type { AxiosResponse } from 'axios'
import { getFaqs } from '@/api/client'
import { PageSection } from '@/components/PageLayout'
import ServiceFaqList from '@/components/service/ServiceFaqList'
import ServiceSectionHeader from '@/components/service/ServiceSectionHeader'
import ServiceContact from '@/components/service/ServiceContact'
import { InlineMarkup } from '@/components/MarkupParser'
import PublicContentLoader from '@/components/PublicContentLoader'
import type { CareGuide, FAQ } from '@/types'
import type { ServicesOutletContext } from './ServicesLayout'
import { useSiteLocale } from '@/i18n/SiteLocale'

interface CareServicePageProps {
  moduleType: 'material-care' | 'garment-care'
  guideRequest: () => Promise<AxiosResponse<any>>
  faqCategory: 'material-care' | 'garment-care'
}

export default function CareServicePage({ moduleType, guideRequest, faqCategory }: CareServicePageProps) {
  const { path: localePath, t } = useSiteLocale()
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
  if (status === 'error') return <PageSection tone="white"><div role="alert" className="border-l-2 border-[#69B2C1] pl-5"><p className="text-[16px] text-primary">{t('护理内容加载失败。')}</p><button type="button" onClick={load} className="mt-4 border-b border-primary text-[14px] text-primary">{t('重新加载')}</button></div></PageSection>

  const blocks = section.content_blocks?.filter(block => !block.hidden) || []
  const explanation = blocks.find(block => block.key === 'explanation')
  const guideHeader = blocks.find(block => block.key === 'guides')
  const isMaterial = moduleType === 'material-care'
  return <div className="support-body">
    <div className="support-frame">
      <ServiceSectionHeader section={section} />
      {explanation && <section className="support-explanation">
        {explanation.image_url && <div className="support-structure"><img src={explanation.image_url} alt={t(explanation.caption)} loading="lazy" decoding="async" width="1000" height="760" /></div>}
        <div className="support-explanation-copy">
          <h3><InlineMarkup text={explanation.title} /></h3><p><InlineMarkup text={explanation.content} /></p>
          <dl>{explanation.items?.map((item, index) => <div key={index}><dt><InlineMarkup text={item.title} /></dt><dd><InlineMarkup text={item.content} /></dd></div>)}</dl>
        </div>
      </section>}
      {guideHeader?.title && <h2 className="support-guide-heading"><InlineMarkup text={guideHeader.title} /></h2>}
      {!section.content_blocks?.find(block => block.key === 'guides')?.hidden && <ol className={isMaterial ? 'support-principles' : 'support-care-steps'}>
        {guides.map((item, index) => <li key={item.id}>
          {!isMaterial && item.image_url && <img src={item.image_url} alt={t(item.image_alt)} loading="lazy" decoding="async" width="900" height="600" />}
          <div className="support-guide-copy">
            {!isMaterial && <span className="support-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
            <div><h3><InlineMarkup text={item.title} /></h3><p><InlineMarkup text={item.content} /></p></div>
          </div>
        </li>)}
      </ol>}
      {!section.content_blocks?.find(block => block.key === 'faq')?.hidden && <ServiceFaqList title={blocks.find(block => block.key === 'faq')?.title} items={faqs} />}
    </div>
    <ServiceContact block={blocks.find(block => block.key === 'contact')} />
  </div>
}
