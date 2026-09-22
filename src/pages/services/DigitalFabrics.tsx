import { useCallback, useEffect, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { getDigitalFabricFormats } from '@/api/client'
import ServiceSectionHeader from '@/components/service/ServiceSectionHeader'
import ServiceContact from '@/components/service/ServiceContact'
import PublicContentLoader from '@/components/PublicContentLoader'
import { InlineMarkup } from '@/components/MarkupParser'
import type { DigitalFabricFormat } from '@/types'
import type { ServicesOutletContext } from './ServicesLayout'
import { useSiteLocale } from '@/i18n/SiteLocale'

export default function DigitalFabrics() {
  const { path: localePath, t } = useSiteLocale()
  const { sections } = useOutletContext<ServicesOutletContext>()
  const section = sections.find(item => item.module_type === 'digital-fabrics')
  const [formats, setFormats] = useState<DigitalFabricFormat[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const load = useCallback(() => {
    setStatus('loading')
    getDigitalFabricFormats().then(response => { setFormats(response.data.data || []); setStatus('ready') }).catch(() => setStatus('error'))
  }, [])
  useEffect(load, [load])
  if (!section) return <Navigate to={localePath('/services')} replace />
  if (status === 'loading') return <PublicContentLoader label="正在加载数字面料内容" />
  if (status === 'error') return <div className="support-frame py-20" role="alert"><p>{t('内容加载失败。')}</p><button type="button" onClick={load} className="mt-4 underline">{t('重新加载')}</button></div>
  const blocks = section.content_blocks?.filter(block => !block.hidden) || []
  const assets = blocks.find(block => block.key === 'assets')
  const formatHeader = blocks.find(block => block.key === 'formats')
  return <div className="support-body">
    <div className="support-frame">
      <ServiceSectionHeader section={section} />
      {assets && <section className="support-digital-feature">
        {assets.image_url && <img src={assets.image_url} alt={t(assets.caption)} loading="lazy" decoding="async" width="1200" height="800" />}
        <div className="support-digital-copy">
          {assets.title && <h3><InlineMarkup text={assets.title} /></h3>}
          {assets.content && <p><InlineMarkup text={assets.content} /></p>}
          <dl>{assets.items?.map((item, index) => <div key={index}><dt><InlineMarkup text={item.title} /></dt><dd><InlineMarkup text={item.content} /></dd></div>)}</dl>
        </div>
      </section>}
      {formats.length > 0 && !section.content_blocks?.find(block => block.key === 'formats')?.hidden && <section className="support-formats">
        <div><h2><InlineMarkup text={formatHeader?.title} /></h2><p><InlineMarkup text={formatHeader?.content} /></p></div>
        <ul>{formats.map(item => <li key={item.id}><h3><InlineMarkup text={item.platform} /></h3><span className="support-format-ext"><InlineMarkup text={item.format} /></span><p><InlineMarkup text={item.description} /></p></li>)}</ul>
      </section>}
    </div>
    <ServiceContact block={blocks.find(block => block.key === 'contact')} />
  </div>
}
