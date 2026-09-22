import { InlineMarkup } from '@/components/MarkupParser'
import type { FAQ } from '@/types'

export default function ServiceFaqList({ items, title }: { items: FAQ[]; title?: string }) {
  if (!items.length) return null
  const groups = [...new Set(items.map(item => item.group || ''))]
  return <section className="support-faq">
    {title && <h2 className="type-section-title"><InlineMarkup text={title} /></h2>}
    <div className="support-faq-groups">
      {groups.map(group => <div key={group} className="support-faq-group">
        {group && <h3><InlineMarkup text={group} /></h3>}
        <div className="support-faq-questions">
          {items.filter(item => (item.group || '') === group).map(item => <details key={item.id}>
            <summary><span><InlineMarkup text={item.question} /></span><span className="support-faq-plus" aria-hidden="true" /></summary>
            <p><InlineMarkup text={item.answer} /></p>
          </details>)}
        </div>
      </div>)}
    </div>
  </section>
}
