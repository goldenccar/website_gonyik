import type { FabricSku } from '@/types'
import { FabricCapabilityTags } from './FabricCapabilities'

interface SkuCardProps {
  sku: FabricSku
  seriesName?: string
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

export default function SkuCard({ sku, seriesName, onClick, expanded = false }: SkuCardProps) {
  const code = getSkuDisplayCode(sku.sku_code, seriesName)
  return (
    <article className="group min-w-0 snap-start">
      <button type="button" onClick={onClick} aria-expanded={expanded} className="block w-full text-left">
        <div className="aspect-[4/3] overflow-hidden bg-white">
          {sku.image ? <img src={sku.image} alt={sku.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-[transform,filter] duration-[var(--motion-media)] ease-apple group-hover:scale-[1.022] group-hover:brightness-[1.04] group-focus-within:scale-[1.022] group-focus-within:brightness-[1.04]" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}
        </div>
        <h3 className="mt-4 text-[30px] font-bold leading-none text-primary">{code}</h3>
        <div className="mt-3"><FabricCapabilityTags features={sku.features} legacySummary={sku.card_summary} /></div>
        <span className="mt-3 inline-block text-[14px] font-medium text-primary underline underline-offset-4">{expanded ? '收起性能 ↑' : '查看性能 ↓'}</span>
      </button>
    </article>
  )
}
