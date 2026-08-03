import { Link } from 'react-router-dom'
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

export function getSkuDisplayCode(skuCode = '', seriesName = '') {
  const parts = skuCode.split('-').filter(Boolean)
  const normalizedSeries = seriesName.replace(/<[^>]+>/g, '').trim().toUpperCase()
  if (parts[0]?.toUpperCase() === 'GY') parts.shift()
  if (normalizedSeries && parts[0]?.toUpperCase() === normalizedSeries) parts.shift()
  return parts.join('-') || skuCode || 'UNNAMED'
}

function clampPosition(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.min(9, Math.max(1, Math.round(value)))
}

function PositionAxis({ label, start, end, value }: { label: string; start: string; end: string; value: number }) {
  const { t } = useSiteLocale()
  const position = ((value - 1) / 8) * 100
  return (
    <div aria-label={`${label}：${value}/9，${start}到${end}`}>
      <div className="mb-2.5 flex items-center justify-between text-[10px] leading-none tracking-[0.035em] text-secondary">
        <span>{t(start)}</span>
        <span>{t(end)}</span>
      </div>
      <div className="relative h-[5px]" aria-hidden="true">
        <span className="absolute inset-x-0 top-0.5 h-px bg-[#d1dbe0]" />
        <span
          className="absolute top-0 h-[3px] w-3.5 -translate-x-1/2 bg-[#31586d]"
          style={{ left: `${position}%` }}
        />
      </div>
    </div>
  )
}

function parseSpecs(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, string>
  if (typeof value !== 'string') return {}
  try { return JSON.parse(value) as Record<string, string> } catch { return {} }
}

export default function SkuCard({ sku, seriesName, capabilities, onClick, expanded = false, detailTitle = '核心性能' }: SkuCardProps) {
  const { t, path: localePath } = useSiteLocale()
  const code = sku.public_name || getSkuDisplayCode(sku.sku_code, seriesName)
  const positions = [
    { label: '性能', start: '日常', end: '专业', value: clampPosition(sku.position_performance) },
    { label: '重量', start: '轻盈', end: '强韧', value: clampPosition(sku.position_durability) },
    { label: '手感', start: '柔软', end: '挺括', value: clampPosition(sku.position_handfeel) },
  ].filter((item): item is { label: string; start: string; end: string; value: number } => item.value !== null)
  const detailSpecs = Object.entries(parseSpecs(sku.specifications)).slice(0, 3)
  const inquiryHref = `/contact?source=${encodeURIComponent('/fabrics')}&sku=${encodeURIComponent(code)}${seriesName ? `&series=${encodeURIComponent(seriesName)}` : ''}`

  return (
    <CatalogCardShell selected={expanded} interactive className="sku-card sku-flip-card !h-auto self-start !border-border/80 !bg-white/55 !shadow-none hover:!translate-y-0 hover:!border-[#afbec6] hover:!bg-white/70 hover:!shadow-none">
      <div className={`sku-flip-inner ${expanded ? 'is-flipped' : ''}`}>
        <div className="sku-flip-face sku-flip-front" aria-hidden={expanded} inert={expanded}>
          <button type="button" onClick={onClick} aria-expanded={expanded} tabIndex={expanded ? -1 : 0} className="sku-card-layout relative grid h-full w-full text-left focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#69B2C1]">
            <span aria-hidden="true" className="sku-card-active-line absolute left-5 top-[-1px] z-10 h-0.5 w-10 origin-left scale-x-0 bg-[#69B2C1]" />
            <CatalogCardMedia
              src={sku.image}
              alt={sku.public_name || sku.name}
              placeholder={<div className="gonyik-fabric-placeholder relative h-full w-full"><span className="absolute bottom-4 left-4 text-[10px] font-medium tracking-[0.18em] text-white/65">SAMPLE IMAGE PENDING</span></div>}
              ratio="compact"
              className="sku-card-media"
            />
            <div className="sku-card-content grid min-w-0 gap-y-6 p-5">
              <div className="sku-card-info min-w-0">
                <h3 className="whitespace-nowrap text-[26px] font-bold leading-none tracking-[-0.025em] text-primary">{code}</h3>
                <p className="mt-2 text-[14px] font-medium text-secondary">{t(sku.product_type || sku.name)}</p>
                <div className="mt-5 min-h-5">
                  <FabricCapabilityTags features={sku.features} legacySummary={sku.card_summary} capabilities={capabilities} align="start" limit={3} variant="editorial" />
                </div>
              </div>
              {positions.length > 0 && <div className="sku-card-axes grid w-full content-center gap-5 border-y border-border/80 py-5">
                {positions.map((axis) => <PositionAxis key={axis.label} {...axis} />)}
              </div>}
              <span className="sku-card-cta inline-flex items-center gap-1.5 text-[12px] font-medium text-primary">
                <span className="border-b border-primary/35 pb-0.5">{t('翻面查看性能')}</span>
                <span aria-hidden="true">↗</span>
              </span>
            </div>
          </button>
        </div>

        <div className="sku-flip-face sku-flip-back relative flex cursor-pointer flex-col bg-white p-5 md:p-6" aria-hidden={!expanded} inert={!expanded}>
          <button
            type="button"
            aria-label={`返回 ${code} 正面`}
            tabIndex={expanded ? 0 : -1}
            onClick={onClick}
            className="absolute inset-0 z-0 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#69B2C1]"
          />

          <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="label-en text-secondary">{seriesName} / {code}</p>
              <h3 className="mt-3 text-[25px] font-semibold tracking-[-.025em] text-primary">{t(detailTitle)}</h3>
            </div>
            <span className="shrink-0 border-b border-primary/30 pb-1 text-[12px] font-medium text-primary">{t('返回正面')} ↙</span>
          </div>

          <div className="pointer-events-none relative z-10 mt-6 grid flex-1 content-start gap-x-6 gap-y-5 sm:grid-cols-3 md:mt-8">
            {detailSpecs.map(([label, value]) => (
              <div key={label} className="border-t border-border pt-3">
                <p className="text-[11px] font-medium text-secondary">{t(label)}</p>
                <p className="mt-2 text-[16px] font-medium leading-6 text-primary"><InlineMarkup text={value} /></p>
              </div>
            ))}
          </div>

          <div className="pointer-events-none relative z-10 mt-6 border-t border-border pt-4">
            <p className="text-[11px] leading-5 text-secondary">{t('代表性样品典型值，具体结构、测试方法和适用条件以对应 TDS 为准。')}</p>
            <Link
              to={localePath(inquiryHref)}
              tabIndex={expanded ? 0 : -1}
              onClick={(event) => event.stopPropagation()}
              className="pointer-events-auto mt-3 inline-block text-[13px] font-medium text-primary underline underline-offset-4"
            >
              {t('索取 TDS 与样品')} →
            </Link>
          </div>
        </div>
      </div>
    </CatalogCardShell>
  )
}
