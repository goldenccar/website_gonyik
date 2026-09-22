import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { InlineMarkup } from '@/components/MarkupParser'
import { useSiteLocale } from '@/i18n/SiteLocale'
import type { TechnologyContentBlock } from '@/types'

export default function ServiceContact({ block }: { block?: TechnologyContentBlock }) {
  const { path } = useSiteLocale()
  if (!block || block.hidden) return null
  return <section className="support-contact">
    <div className="support-frame support-contact-inner">
      <div><h2><InlineMarkup text={block.title} /></h2><p><InlineMarkup text={block.content} /></p></div>
      <div className="support-contact-links">{block.links?.filter(link => link.href && link.label).map(link => <Link key={link.href} to={path(link.href)} className="support-button"><InlineMarkup text={link.label} /><ArrowUpRight size={17} aria-hidden="true" /></Link>)}</div>
    </div>
  </section>
}
