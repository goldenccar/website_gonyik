import type { FabricSku } from '@/types'
import { FabricCapabilityTags } from './FabricCapabilities'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import { CatalogCardMedia, CatalogCardShell } from './CatalogCard'

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

function getCardSpecifications(value: unknown) {
  let specifications: Record<string, string> = {}
  if (value && typeof value === 'object' && !Array.isArray(value)) specifications = value as Record<string, string>
  if (typeof value === 'string') {
    try { specifications = JSON.parse(value) as Record<string, string> } catch { specifications = {} }
  }
  const entries = Object.entries(specifications)
  const preferred = [
    entries.find(([label]) => label === '结构'),
    entries.find(([label]) => /成品克重|理论.*克重/.test(label)),
    entries.find(([label]) => /面层|面料/.test(label)),
  ].filter(Boolean) as Array<[string, string]>
  return [...preferred, ...entries.filter(([label]) => !preferred.some(([selected]) => selected === label))].slice(0, 3)
}

export default function SkuCard({ sku, seriesName, capabilities, onClick, expanded = false }: SkuCardProps) {
  const code = getSkuDisplayCode(sku.sku_code, seriesName)
  const cardSpecifications = getCardSpecifications(sku.specifications)
  return (
    <CatalogCardShell selected={expanded} interactive className="snap-start">
      <button type="button" onClick={onClick} aria-expanded={expanded} className="grid h-full w-full text-left focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#69B2C1] md:grid-cols-[34%_1fr]">
        <CatalogCardMedia
          src={sku.image}
          alt={sku.name}
          placeholder={<div className="gonyik-fabric-placeholder relative h-full w-full"><span className="absolute bottom-4 left-4 text-[10px] font-medium tracking-[0.18em] text-white/65">SAMPLE IMAGE PENDING</span></div>}
          ratio="compact"
          className="md:h-full"
        />
        <div className="flex min-w-0 flex-col p-5 md:p-6">
          <h3 className="text-[24px] font-bold leading-none tracking-[-0.02em] text-primary">{code}</h3>
          <div className="mt-3 min-h-7">
            <FabricCapabilityTags features={sku.features} legacySummary={sku.card_summary} capabilities={capabilities} align="start" />
          </div>
          {Boolean(cardSpecifications.length) && <dl className="mt-4 grid gap-2 border-t border-border pt-4">
            {cardSpecifications.map(([label, value]) => <div key={label} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 text-[12px] leading-5"><dt className="text-secondary">{label}</dt><dd className="truncate font-medium text-primary">{value}</dd></div>)}
          </dl>}
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-medium text-primary">
            <span className="border-b border-primary/55 pb-0.5">{expanded ? '收起性能' : '查看性能'}</span>
            <span aria-hidden="true" className={`transition-transform duration-[var(--motion-instant)] ${expanded ? 'rotate-180' : ''}`}>↓</span>
          </span>
        </div>
      </button>
    </CatalogCardShell>
  )
}
