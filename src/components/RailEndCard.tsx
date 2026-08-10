import { InlineMarkup } from './MarkupParser'
import { CatalogCardShell } from './CatalogCard'

export interface RailEndCardConfig {
  rail_end_card_visible?: boolean
  rail_end_card_title?: string
  rail_end_card_description?: string
  rail_end_card_cta_label?: string
  rail_end_card_cta_href?: string
}

interface RailEndCardProps {
  config: RailEndCardConfig
  fallbackTitle: string
  fallbackDescription: string
  preview?: boolean
}

export default function RailEndCard({ config, fallbackTitle, fallbackDescription, preview = false }: RailEndCardProps) {
  if (config.rail_end_card_visible === false) return null
  const cta = config.rail_end_card_cta_label
  return (
    <CatalogCardShell className="min-h-[260px] snap-start">
      <div className="flex h-full flex-1 items-end p-6 md:p-7">
        <div>
        <p className="label-en text-secondary">IN DEVELOPMENT</p>
        <h3 className="mt-3 text-h4 text-primary"><InlineMarkup text={config.rail_end_card_title || fallbackTitle} /></h3>
        <p className="mt-3 text-body text-secondary"><InlineMarkup text={config.rail_end_card_description || fallbackDescription} /></p>
        {cta && (preview
          ? <span className="mt-6 inline-block text-[14px] underline underline-offset-4"><InlineMarkup text={cta} /> →</span>
          : <a href={config.rail_end_card_cta_href || '/contact'} className="mt-6 inline-block text-[14px] underline underline-offset-4"><InlineMarkup text={cta} /> →</a>)}
        </div>
      </div>
    </CatalogCardShell>
  )
}
