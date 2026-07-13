import MarkupParser from './MarkupParser'
import type { FluorineSection } from '@/types'

export default function TechnologyDetail({ section, live = false }: { section: FluorineSection; live?: boolean }) {
  return <article className="grid items-start gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] xl:gap-10" aria-live={live ? 'polite' : undefined}>
    <div className="min-w-0 max-w-[38em]">
      <h2 className="text-[30px] font-semibold leading-[1.15] text-primary md:text-[38px]">{section.title}</h2>
      <p className="mt-2 text-body text-secondary">{section.subtitle}</p>
      <MarkupParser text={section.content} className="mt-7 text-body leading-7 text-secondary" />
    </div>
    <div className="aspect-[4/3] max-h-[420px] w-full overflow-hidden bg-[#041F38]">{section.image_url ? <img src={section.image_url} alt={section.title} className={`h-full w-full ${section.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`} /> : <div className="gonyik-material-placeholder h-full w-full" />}</div>
  </article>
}
