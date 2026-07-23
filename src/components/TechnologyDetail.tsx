import MarkupParser, { InlineMarkup } from './MarkupParser'
import type { FluorineSection } from '@/types'

export default function TechnologyDetail({ section, index = 0, live = false }: { section: FluorineSection; index?: number; live?: boolean }) {
  const overview = index === 0
  const mediaLeft = !overview && index % 2 === 1
  const grid = overview
    ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]'
    : 'lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]'
  const textOrder = mediaLeft ? 'lg:order-2 lg:justify-self-end' : 'lg:order-1'
  const mediaOrder = mediaLeft ? 'lg:order-1' : 'lg:order-2'

  return <article className={`grid items-center gap-8 lg:gap-12 xl:gap-16 ${grid}`} aria-live={live ? 'polite' : undefined}>
    <div className={`min-w-0 max-w-[520px] ${textOrder}`}>
      <h2 className="type-section-title text-primary"><InlineMarkup text={section.title} /></h2>
      <p className="body-copy mt-2 text-secondary"><InlineMarkup text={section.subtitle} /></p>
      <MarkupParser text={section.content} className="technical-copy mt-7 text-secondary" />
    </div>
    <div className={`aspect-[4/3] max-h-[520px] w-full overflow-hidden bg-[#041F38] ${mediaOrder}`}>{section.image_url ? <img src={section.image_url} alt={section.title} loading="lazy" decoding="async" className={`h-full w-full ${section.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`} /> : <div className="gonyik-material-placeholder h-full w-full" />}</div>
  </article>
}
