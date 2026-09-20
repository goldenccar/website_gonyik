import { Link } from 'react-router-dom'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import type { FabricSku } from '@/types'
import { FabricCapabilityTags } from './FabricCapabilities'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import { CatalogCardMedia, CatalogCardShell } from './CatalogCard'
import { useSiteLocale } from '@/i18n/SiteLocale'
import { InlineMarkup } from './MarkupParser'

interface SkuCardProps {
  sku: FabricSku
  seriesName?: string
  capabilities?: FabricCapabilityDefinition[]
  onClick?: () => void
  expanded?: boolean
  detailTitle?: string
}

export default function SkuCard({ sku, seriesName, capabilities, onClick, expanded = false, detailTitle }: SkuCardProps) {
  const { t, path: localePath } = useSiteLocale()
  const code = sku.public_name || sku.name || sku.sku_code
  const inquiryHref = `/contact?source=${encodeURIComponent('/fabrics/catalog')}&sku=${encodeURIComponent(code)}${seriesName ? `&series=${encodeURIComponent(seriesName)}` : ''}`
  const axes = [
    { start: '日常', end: '专业', value: sku.position_performance },
    { start: '轻薄', end: '厚实', value: sku.position_durability },
    { start: '柔软', end: '挺括', value: sku.position_handfeel },
  ].filter(axis => typeof axis.value === 'number' && Number.isFinite(axis.value))
  return (
    <CatalogCardShell selected={expanded} interactive className="sku-card sku-flip-card !bg-white !shadow-none hover:!translate-y-0">
      <div className={`sku-flip-inner ${expanded ? 'is-flipped' : ''}`}>
        <div className="sku-flip-face sku-flip-front" aria-hidden={expanded} inert={expanded}>
          <button type="button" onClick={onClick} aria-expanded={expanded} className="sku-card-layout w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-accent">
            <CatalogCardMedia src={sku.image} alt={code} className="sku-card-media" placeholder={<div aria-hidden="true" className="sku-media-placeholder h-full w-full" />} />
            <div className="sku-card-content">
              <h3>{code}</h3>
              <p className="sku-card-type"><InlineMarkup text={sku.product_type || sku.name} /></p>
              <div className="sku-card-features"><FabricCapabilityTags features={sku.features} legacySummary={sku.card_summary} capabilities={capabilities} align="start" limit={4} variant="editorial" /></div>
              {axes.length > 0 && <div className="sku-card-axes">{axes.map(axis => <div key={axis.start} aria-label={`${t(axis.start)}—${t(axis.end)}：${axis.value}/9`}>
                <div className="sku-axis-labels"><span>{t(axis.start)}</span><span>{t(axis.end)}</span></div>
                <div className="sku-axis-track" aria-hidden="true"><span style={{ left: `${((Math.min(9, Math.max(1, axis.value!)) - 1) / 8) * 100}%` }} /></div>
              </div>)}</div>}
              <span className="sku-card-cta">{t('翻面了解面料')}<ArrowUpRight size={18} aria-hidden="true" /></span>
            </div>
          </button>
        </div>
        <div className="sku-flip-face sku-flip-back" aria-hidden={!expanded} inert={!expanded}>
          <div className="sku-back-heading">
            <h3>{code}</h3>
            <button type="button" onClick={onClick} aria-label={`${t('返回正面')} ${code}`} className="sku-return"><RotateCcw size={19} aria-hidden="true" /></button>
          </div>
          <p className="sku-card-type"><InlineMarkup text={sku.product_type || sku.name} /></p>
          <div className="sku-back-copy">
            {sku.public_description && <p><InlineMarkup text={sku.public_description} /></p>}
            {sku.application_notes && <div className="sku-back-applications"><h4>{t(detailTitle || '适用方向')}</h4><p><InlineMarkup text={sku.application_notes} /></p></div>}
            {!sku.public_description && !sku.application_notes && <FabricCapabilityTags features={sku.features} capabilities={capabilities} align="start" limit={4} variant="editorial" />}
          </div>
          <Link to={localePath(inquiryHref)} className="sku-card-cta sku-inquiry">{t('咨询这款面料')}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </CatalogCardShell>
  )
}