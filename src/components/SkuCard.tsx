import type { FabricSku } from '@/types'

interface SkuCardProps {
  sku: FabricSku
  seriesName?: string
  seriesTagline?: string
  onClick?: () => void
  expanded?: boolean
}

export default function SkuCard({ sku, seriesName, seriesTagline, onClick, expanded = false }: SkuCardProps) {
  const code = sku.sku_code.replace(/^GY-[A-Z]+-/, '')
  return (
    <article className="group min-w-0 snap-start">
      <button type="button" onClick={onClick} aria-expanded={expanded} className="block w-full text-left">
        <div className="aspect-[4/3] overflow-hidden bg-white">
          {sku.image ? <img src={sku.image} alt={sku.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}
        </div>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-[2px] text-secondary">{seriesName}</p>
        <h3 className="mt-1 text-[30px] font-bold leading-none text-primary">{code}</h3>
        <p className="mt-3 truncate text-[15px] text-primary">{sku.card_summary || seriesTagline || sku.name}</p>
        <span className="mt-4 inline-block text-[14px] font-medium text-primary underline underline-offset-4">{expanded ? '收起性能 ↑' : '查看性能 ↓'}</span>
      </button>
    </article>
  )
}
