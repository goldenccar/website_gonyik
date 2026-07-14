import type { FabricSku } from '@/types'
import { FabricCapabilityTags } from './FabricCapabilities'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'

interface SkuCardProps {
  sku: FabricSku
  seriesName?: string
  capabilities?: FabricCapabilityDefinition[]
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

export default function SkuCard({ sku, seriesName, capabilities, onClick, expanded = false }: SkuCardProps) {
  const code = getSkuDisplayCode(sku.sku_code, seriesName)
  return (
    <article className="group min-w-0 snap-start">
      <button type="button" onClick={onClick} aria-expanded={expanded} className="block w-full text-left">
        <div className="aspect-[4/3] overflow-hidden bg-white">
          {sku.image ? <img src={sku.image} alt={sku.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-[transform,filter] duration-[var(--motion-media)] ease-apple group-hover:scale-[1.022] group-hover:brightness-[1.04] group-focus-within:scale-[1.022] group-focus-within:brightness-[1.04]" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}
        </div>
        <div className="mt-4 flex min-h-8 items-center justify-between gap-4">
          <h3 className="shrink-0 text-[30px] font-bold leading-none text-primary">{code}</h3>
          <FabricCapabilityTags features={sku.features} legacySummary={sku.card_summary} capabilities={capabilities} />
        </div>
        <span className="mt-4 inline-block text-[14px] font-medium text-primary underline underline-offset-4">{expanded ? '收起性能 ↑' : '查看性能 ↓'}</span>
      </button>
    </article>
  )
}
