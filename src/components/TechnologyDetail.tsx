import MarkupParser from './MarkupParser'
import type { FluorineSection } from '@/types'

export default function TechnologyDetail({ section, index, live = false }: { section: FluorineSection; index: number; live?: boolean }) {
  return <article aria-live={live ? 'polite' : undefined}>
    <p className="text-label uppercase text-secondary">TECHNOLOGY {String(index + 1).padStart(2, '0')}</p>
    <h2 className="mt-3 text-[30px] font-bold leading-tight text-primary md:text-[38px]">{section.title}</h2>
    <p className="mt-3 text-body text-secondary">{section.subtitle}</p>
    <div className="mt-8 grid gap-8 xl:grid-cols-2">
      <div><MarkupParser text={section.content} className="text-body text-secondary" /></div>
      <div className="min-h-[280px]">{section.image_url ? <img src={section.image_url} alt={section.title} className={`h-full w-full ${section.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`} /> : <div className="gonyik-material-placeholder h-full min-h-[280px] w-full" />}</div>
    </div>
  </article>
}
