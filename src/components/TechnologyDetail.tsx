import MarkupParser, { InlineMarkup } from './MarkupParser'
import type { FluorineSection } from '@/types'

export default function TechnologyDetail({ section, live = false }: { section: FluorineSection; live?: boolean }) {
  return <article className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] xl:gap-x-10 xl:gap-y-0" aria-live={live ? 'polite' : undefined}>
    <div className="min-w-0 max-w-[38em] xl:col-start-1 xl:row-start-1">
      <h2 className="text-[30px] font-semibold leading-[1.15] text-primary md:text-[38px]"><InlineMarkup text={section.title} /></h2>
      <p className="mt-2 text-body text-secondary"><InlineMarkup text={section.subtitle} /></p>
    </div>
    <div className="aspect-[4/3] max-h-[420px] w-full overflow-hidden bg-[#041F38] xl:col-start-2 xl:row-span-2 xl:row-start-1">{section.image_url ? <img src={section.image_url} alt={section.title} loading="lazy" decoding="async" className={`h-full w-full ${section.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`} /> : <div className="gonyik-material-placeholder h-full w-full" />}</div>
    <MarkupParser text={section.content} className="text-body leading-7 text-secondary xl:col-start-1 xl:row-start-2 xl:mt-7" />
  </article>
}
