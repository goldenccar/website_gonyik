import type { EquipmentProduct } from '@/types'
import { Link } from 'react-router-dom'
import { InlineMarkup } from './MarkupParser'
import { CatalogCardMedia, CatalogCardShell } from './CatalogCard'

function parseFeatures(value: string) {
  try { return JSON.parse(value) as string[] } catch { return [] }
}

export default function ApplicationCard({ product, categoryName }: { product: EquipmentProduct; categoryName?: string }) {
  const summary = product.card_summary || parseFeatures(product.features).slice(0, 3).join(' · ')
  const fallback = (
    <div className="gonyik-application-placeholder flex h-full w-full flex-col justify-end p-5">
      <p className="text-[10px] font-medium tracking-[0.18em] text-secondary/70">APPLICATION STUDY</p>
      <p className="mt-2 text-[17px] font-semibold text-primary"><InlineMarkup text={product.name} /></p>
    </div>
  )

  return <CatalogCardShell interactive className="snap-start md:grid md:min-h-[340px] md:grid-cols-[38%_1fr]">
    <CatalogCardMedia src={product.image} alt={product.name} placeholder={fallback} ratio="portrait" fit="contain" className="!bg-white md:!aspect-auto md:h-full" />
    <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
      <p className="label-zh text-secondary"><InlineMarkup text={categoryName} /></p>
      <h3 className="type-card-title mt-2 text-primary"><InlineMarkup text={product.name} /></h3>
      <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-secondary"><InlineMarkup text={summary} /></p>
      {Boolean(product.related_skus?.length) && <div className="mt-10 border-t border-border/80 pt-4 md:mt-12">
        <p className="text-[11px] font-medium tracking-[0.08em] text-secondary">采用面料</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {product.related_skus?.map((sku) => <Link key={sku.id} to={`/fabrics?series=${encodeURIComponent(sku.series_slug)}&sku=${sku.id}`} className="text-[13px] font-medium text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">{sku.public_name || sku.name}</Link>)}
        </div>
      </div>}
    </div>
  </CatalogCardShell>
}
