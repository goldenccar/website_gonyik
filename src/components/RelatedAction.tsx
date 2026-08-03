import { Link } from 'react-router-dom'
import { InlineMarkup } from './MarkupParser'
import { useSiteLocale } from '@/i18n/SiteLocale'

interface RelatedActionProps {
  title: string
  description: string
  label: string
  to: string
}

export default function RelatedAction({ title, description, label, to }: RelatedActionProps) {
  const { t } = useSiteLocale()

  return (
    <section className="bg-darker px-7 py-14 text-white md:px-12 md:py-16 lg:px-20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="type-module-title text-white"><InlineMarkup text={t(title)} /></h2>
          <p className="mt-3 max-w-[640px] text-[15px] leading-7 text-white/70"><InlineMarkup text={t(description)} /></p>
        </div>
        <Link
          to={to}
          className="group inline-flex w-fit shrink-0 items-center border-b border-white/45 pb-1 text-[14px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <InlineMarkup text={t(label)} />
          <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-[var(--motion-instant)] group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  )
}
