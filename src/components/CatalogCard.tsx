import type { ReactNode } from 'react'




export function CatalogCardShell({ children, selected = false, interactive = false, className = '' }: {
  children: ReactNode
  selected?: boolean
  interactive?: boolean
  className?: string
}) {
  return (
    <article className={`catalog-card group relative flex h-full min-w-0 flex-col border bg-white/60 transition-[border-color,background-color,box-shadow,transform] duration-[var(--motion-instant)] ease-apple ${selected ? 'border-[#69B2C1] bg-white shadow-[0_10px_30px_rgba(15,45,70,0.07)]' : 'border-border/80'} ${interactive ? 'hover:-translate-y-0.5 hover:border-[#9dcbd4] hover:bg-white hover:shadow-[0_12px_34px_rgba(15,45,70,0.065)] focus-within:border-[#69B2C1]' : ''} ${className}`}>
      {children}
    </article>
  )
}

export function CatalogCardMedia({ src, alt, placeholder, ratio = 'fabric', fit = 'cover', className = '' }: {
  src?: string | null
  alt: string
  placeholder: ReactNode
  ratio?: 'fabric' | 'compact' | 'portrait'
  fit?: 'cover' | 'contain'
  className?: string
}) {
  const ratioClass = ratio === 'compact'
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
