import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { headingLanguageClass } from '@/utils/typography'
import { InlineMarkup } from './MarkupParser'

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`gonyik-page min-w-0 overflow-x-clip bg-bg ${className}`}>{children}</div>
}

export function PageSection({ children, tone = 'light', className = '', id }: {
  children: ReactNode
  tone?: 'light' | 'white' | 'navy'
  className?: string
  id?: string
}) {
  const toneClass = tone === 'navy' ? 'bg-darker text-white' : tone === 'white' ? 'bg-white' : 'bg-bg'
  return <section id={id} className="bg-bg px-4 md:px-6"><div className={`mx-auto w-full max-w-[1760px] px-7 py-14 md:px-12 md:py-20 lg:px-20 lg:py-20 ${toneClass} ${className}`}>{children}</div></section>
}

export function SectionHeader({ tag, title, subtitle, linkText, linkTo, light = false }: {
  tag?: string
  title: string
  subtitle?: string
  linkText?: string
  linkTo?: string
  light?: boolean
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-[720px]">
        {tag && <p className={`label-en mb-3 ${light ? 'text-white/75' : 'text-secondary'}`}><InlineMarkup text={tag} /></p>}
        <h2 className={`type-section-title ${headingLanguageClass(title)} ${light ? 'text-white' : 'text-primary'}`}><InlineMarkup text={title} /></h2>
        {subtitle && <p className={`body-copy mt-4 max-w-[620px] ${light ? 'text-white/80' : 'text-secondary'}`}><InlineMarkup text={subtitle} /></p>}
      </div>
      {linkText && linkTo && <Link to={linkTo} className={`text-[14px] font-medium underline underline-offset-4 ${light ? 'text-white' : 'text-primary'}`}><InlineMarkup text={linkText} /> →</Link>}
    </div>
  )
}
