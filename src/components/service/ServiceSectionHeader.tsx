import type { ContentSection } from '@/types'
import MarkupParser, { InlineMarkup } from '@/components/MarkupParser'

export default function ServiceSectionHeader({ section }: { section: ContentSection }) {
  return (
    <header className="support-intro">
      <h2 className="type-section-title text-primary"><InlineMarkup text={section.title} /></h2>
      <div>
        {section.subtitle && <p className="support-lead"><InlineMarkup text={section.subtitle} /></p>}
        {section.content && <MarkupParser text={section.content} className="support-note" />}
      </div>
    </header>
  )
}
