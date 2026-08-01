import type { EquipmentProduct } from '@/types'
import { Link } from 'react-router-dom'
import { InlineMarkup } from './MarkupParser'
import { CatalogCardMedia, CatalogCardShell } from './CatalogCard'
import { materialPlatformLabel } from '@/config/materialPlatforms'
import { useSiteLocale } from '@/i18n/SiteLocale'

function parseFeatures(value: string) {
  try { return JSON.parse(value) as string[] } catch { return [] }
}

export default function ApplicationCard({ product, categoryName }: { product: EquipmentProduct; categoryName?: string }) {
  const { path: localePath } = useSiteLocale()
  const summary = product.card_summary || parseFeatures(product.features).slice(0, 3).join(' · ')
  const fallback = (
    <div className="gonyik-application-placeholder flex h-full w-full flex-col justify-end p-5">
      <p className="text-[10px] font-medium tracking-[0.18em] text-secondary/70">APPLICATION STUDY</p>
      <p className="mt-2 text-[17px] font-semibold text-primary"><InlineMarkup text={product.name} /></p>
    </div>
  )

  return <CatalogCardShell interactive className="snap-start md:grid md:min-h-[340px] md:grid-cols-[44%_1fr] xl:grid-cols-[48%_1fr]">
    <CatalogCardMedia src={product.image} alt={product.name} placeholder={fallback} ratio="portrait" fit="contain" className="!bg-white md:!aspect-auto md:h-full" />
    <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="label-zh text-secondary"><InlineMarkup text={categoryName} /></p>
        {product.material_platforms.map((platform) => <span key={platform} className="border border-[#8fc6d1] bg-[#eef8fa] px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#235d69]">{materialPlatformLabel(platform, 'badge')}</span>)}
      </div>
      <h3 className="type-card-title mt-2 text-primary"><InlineMarkup text={product.name} /></h3>
      <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-secondary"><InlineMarkup text={summary} /></p>
      {Boolean(product.related_skus?.length) && <div className="mt-10 border-t border-border/80 pt-4 md:mt-12">
        <p className="text-[11px] font-medium tracking-[0.08em] text-secondary">采用面料</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {product.related_skus?.map((sku) => <Link key={sku.id} to={localePath(`/fabrics?series=${encodeURIComponent(sku.series_slug)}&sku=${sku.id}`)} className="text-[13px] font-medium text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">{sku.public_name || sku.name}</Link>)}
        </div>
      </div>}
    </div>
  </CatalogCardShell>
}
