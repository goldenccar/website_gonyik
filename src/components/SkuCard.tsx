import type { FabricSku } from '@/types'
import { InlineMarkup } from './MarkupParser'

interface SkuCardProps {
  sku: FabricSku
  seriesName?: string
  sequence?: number
  onClick?: () => void
  expanded?: boolean
}

export function getSkuDisplayCode(skuCode = '', seriesName = '') {
  const parts = skuCode.split('-').filter(Boolean)
  const normalizedSeries = seriesName.replace(/<[^>]+>/g, '').trim().toUpperCase()
  if (parts[0]?.toUpperCase() === 'GY') parts.shift()
  if (normalizedSeries && parts[0]?.toUpperCase() === normalizedSeries) parts.shift()
  return parts.join('-') || skuCode || 'UNNAMED'
}

export default function SkuCard({ sku, seriesName, sequence, onClick, expanded = false }: SkuCardProps) {
  const code = getSkuDisplayCode(sku.sku_code, seriesName)
  return (
    <article className="group min-w-0 snap-start">
      <button type="button" onClick={onClick} aria-expanded={expanded} className="block w-full text-left">
        <div className="aspect-[4/3] overflow-hidden bg-white">
          {sku.image ? <img src={sku.image} alt={sku.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-[transform,filter] duration-[var(--motion-media)] ease-apple group-hover:scale-[1.022] group-hover:brightness-[1.04] group-focus-within:scale-[1.022] group-focus-within:brightness-[1.04]" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}
        </div>
        {sequence !== undefined && <p className="mt-4 text-label text-secondary">{String(sequence).padStart(2, '0')}</p>}
        <h3 className={`${sequence === undefined ? 'mt-4' : 'mt-2'} text-[30px] font-bold leading-none text-primary`}>{code}</h3>
        <p className="mt-3 min-h-6 truncate text-[15px] text-primary">{sku.card_summary ? <InlineMarkup text={sku.card_summary} /> : <span aria-hidden="true">&nbsp;</span>}</p>
        <span className="mt-4 inline-block text-[14px] font-medium text-primary underline underline-offset-4">{expanded ? '收起性能 ↑' : '查看性能 ↓'}</span>
      </button>
    </article>
  )
}
