import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { InlineMarkup } from './MarkupParser'

export function CatalogCardShell({ children, selected = false, interactive = false, className = '', railEndCard = false }: {
  children: ReactNode
  selected?: boolean
  interactive?: boolean
  className?: string
  railEndCard?: boolean
}) {
  return (
    <article data-rail-end-card={railEndCard || undefined} className={`catalog-card group relative flex h-full min-w-0 flex-col border bg-white/60 transition-[border-color,background-color,box-shadow,transform] duration-[var(--motion-instant)] ease-apple ${selected ? 'border-[#69B2C1] bg-white shadow-[0_10px_30px_rgba(15,45,70,0.07)]' : 'border-border/80'} ${interactive ? 'hover:-translate-y-0.5 hover:border-[#9dcbd4] hover:bg-white hover:shadow-[0_12px_34px_rgba(15,45,70,0.065)] focus-within:border-[#69B2C1]' : ''} ${className}`}>
      {children}
    </article>
  )
}

export function CatalogCardMedia({ src, alt, placeholder, ratio = 'fabric', fit = 'cover', className = '' }: {
  src?: string | null
  alt: string
  placeholder: ReactNode
  ratio?: 'fabric' | 'application' | 'compact' | 'portrait'
  fit?: 'cover' | 'contain'
  className?: string
}) {
  const ratioClass = ratio === 'application'
    ? 'aspect-[16/10]'
    : ratio === 'compact'
      ? 'aspect-[16/7] md:aspect-auto md:min-h-[248px]'
      : ratio === 'portrait'
        ? 'aspect-[4/3] md:aspect-[3/4] md:h-full'
        : 'aspect-[4/3]'
  return (
    <div className={`relative overflow-hidden bg-[#f4f7f8] ${ratioClass} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`h-full w-full ${fit === 'contain' ? 'object-contain p-3 md:p-4' : 'object-cover'} transition-[transform,filter] duration-[var(--motion-media)] ease-apple group-hover:scale-[1.018] group-hover:brightness-[1.035] group-focus-within:scale-[1.018] group-focus-within:brightness-[1.035]`}
        />
      ) : placeholder}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#69B2C1] transition-transform duration-[var(--motion-switch)] ease-apple group-hover:scale-x-100 group-focus-within:scale-x-100" />
    </div>
  )
}

export function CatalogCardSkeleton({ ratio = 'fabric' }: { ratio?: 'fabric' | 'application' | 'equipment' }) {
  if (ratio === 'equipment') return (
    <div aria-hidden="true" className="overflow-hidden border border-border/80 bg-white/55 md:grid md:min-h-[340px] md:grid-cols-[38%_1fr]">
      <div className="aspect-[4/3] animate-pulse bg-[#e9eef1] md:aspect-auto md:h-full" />
      <div className="space-y-3 p-5 md:p-6">
        <div className="h-3 w-20 animate-pulse bg-[#e2e8eb]" />
        <div className="h-6 w-2/3 animate-pulse bg-[#dce4e8]" />
        <div className="h-4 w-4/5 animate-pulse bg-[#e7ecef]" />
      </div>
    </div>
  )
  return (
    <div aria-hidden="true" className="overflow-hidden border border-border/80 bg-white/55">
      <div className={`${ratio === 'application' ? 'aspect-[16/10]' : 'aspect-[4/3]'} animate-pulse bg-[#e9eef1]`} />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse bg-[#e2e8eb]" />
        <div className="h-6 w-2/3 animate-pulse bg-[#dce4e8]" />
        <div className="h-4 w-4/5 animate-pulse bg-[#e7ecef]" />
      </div>
    </div>
  )
}

export function CatalogEndCta({ title, description, label, href = '/contact' }: {
  title: string
  description?: string
  label?: string
  href?: string
}) {
  return (
    <aside className="mt-5 flex flex-col gap-5 border-y border-border bg-white/45 px-5 py-5 md:mt-6 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold text-primary"><InlineMarkup text={title} /></h3>
        {description && <p className="mt-1.5 text-[13px] leading-6 text-secondary"><InlineMarkup text={description} /></p>}
      </div>
      {label && <Link to={href} className="shrink-0 text-[14px] font-medium text-primary underline underline-offset-4"><InlineMarkup text={label} /> →</Link>}
    </aside>
  )
}
