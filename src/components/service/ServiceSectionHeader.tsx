import type { ContentSection } from '@/types'
import MarkupParser, { InlineMarkup } from '@/components/MarkupParser'

export default function ServiceSectionHeader({ section }: { section: ContentSection }) {
  return (
    <header className="max-w-[820px]">
      <h2 className="type-section-title text-primary"><InlineMarkup text={section.title} /></h2>
      {section.subtitle && <p className="body-copy mt-4 max-w-[720px] text-secondary"><InlineMarkup text={section.subtitle} /></p>}
      {section.content && <MarkupParser text={section.content} className="mt-6 max-w-[720px] border-l-2 border-[#69B2C1] pl-5 text-[13px] leading-6 text-secondary" />}
    </header>
  )
}
