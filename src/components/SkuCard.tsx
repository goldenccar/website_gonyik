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

function clampPosition(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.min(9, Math.max(1, Math.round(value)))
}

function PositionAxis({ label, start, end, value }: { label: string; start: string; end: string; value: number }) {
  const position = ((value - 1) / 8) * 100
  return (
    <div aria-label={`${label}：${value}/9，${start}到${end}`}>
      <div className="mb-2.5 flex items-center justify-between text-[10px] leading-none tracking-[0.035em] text-secondary">
        <span>{start}</span>
        <span>{end}</span>
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

export default function SkuCard({ sku, seriesName, capabilities, onClick, expanded = false }: SkuCardProps) {
  const code = sku.public_name || getSkuDisplayCode(sku.sku_code, seriesName)
  const positions = [
    { label: '性能', start: '日常', end: '专业', value: clampPosition(sku.position_performance) },
    { label: '重量', start: '轻盈', end: '强韧', value: clampPosition(sku.position_durability) },
    { label: '手感', start: '柔软', end: '挺括', value: clampPosition(sku.position_handfeel) },
  ].filter((item): item is { label: string; start: string; end: string; value: number } => item.value !== null)
  return (
    <CatalogCardShell selected={expanded} interactive className="!h-auto self-start snap-start !border-border/80 !bg-white/55 !shadow-none hover:!translate-y-0 hover:!border-[#afbec6] hover:!bg-white/70 hover:!shadow-none">
      <button type="button" onClick={onClick} aria-expanded={expanded} className="relative grid h-full w-full text-left focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#69B2C1] md:grid-cols-[27%_1fr]">
        <span aria-hidden="true" className={`absolute left-5 top-[-1px] z-10 h-0.5 w-10 origin-left bg-[#69B2C1] transition-transform duration-[var(--motion-switch)] md:left-[calc(27%+24px)] ${expanded ? 'scale-x-100' : 'scale-x-0'}`} />
        <CatalogCardMedia
          src={sku.image}
          alt={sku.public_name || sku.name}
          placeholder={<div className="gonyik-fabric-placeholder relative h-full w-full"><span className="absolute bottom-4 left-4 text-[10px] font-medium tracking-[0.18em] text-white/65">SAMPLE IMAGE PENDING</span></div>}
          ratio="compact"
          className="aspect-[16/7] md:h-full"
        />
        <div className="grid min-w-0 gap-y-6 p-5 md:grid-cols-[minmax(140px,1fr)_175px] md:grid-rows-[1fr_auto] md:gap-x-6 md:gap-y-0 md:p-6">
          <div className="min-w-0 md:col-start-1 md:row-start-1">
            <h3 className="whitespace-nowrap text-[26px] font-bold leading-none tracking-[-0.025em] text-primary">{code}</h3>
            <p className="mt-2 text-[14px] font-medium text-secondary">{sku.product_type || sku.name}</p>
            <div className="mt-5 min-h-5">
              <FabricCapabilityTags features={sku.features} legacySummary={sku.card_summary} capabilities={capabilities} align="start" limit={3} variant="editorial" />
            </div>
          </div>
          {positions.length > 0 && <div className="grid w-full content-center gap-5 border-y border-border/80 py-5 md:col-start-2 md:row-span-2 md:row-start-1 md:max-w-none md:gap-6 md:border-0 md:py-0">
            {positions.map((axis) => <PositionAxis key={axis.label} {...axis} />)}
          </div>}
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary md:col-start-1 md:row-start-2 md:pt-7">
            <span className="border-b border-primary/35 pb-0.5">{expanded ? '收起详细性能' : '查看详细性能'}</span>
            <span aria-hidden="true" className={`transition-transform duration-[var(--motion-instant)] ${expanded ? 'rotate-180' : ''}`}>↓</span>
          </span>
        </div>
      </button>
    </CatalogCardShell>
  )
}
