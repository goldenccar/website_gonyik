import type { ReactNode } from 'react'

interface PageHeroProps {
  tag?: string
  title: string
  subtitle?: string
  image?: string | null
  imageAlt?: string
  variant?: 'home' | 'section' | 'detail'
  className?: string
  children?: ReactNode
}

export default function PageHero({ tag, title, subtitle, image, imageAlt = '', variant = 'section', className = '', children }: PageHeroProps) {
  const height = variant === 'home' ? 'min-h-[580px] lg:min-h-[660px]' : 'min-h-[260px] lg:h-[300px] lg:min-h-0'
  return (
    <section className={`overflow-hidden bg-bg px-6 ${className}`}>
      <div className={`mx-auto grid w-full min-w-0 max-w-[1440px] items-stretch lg:grid-cols-12 ${height}`}>
        <div className="flex min-w-0 flex-col justify-center py-12 lg:col-span-5 lg:py-16 lg:pr-16">
          {tag && <p className="-ml-px mb-4 text-label uppercase text-secondary">{tag}</p>}
          <h1 className={`whitespace-pre-line font-semibold leading-[1.12] tracking-[-0.025em] text-primary ${variant === 'home' ? 'text-[38px] md:text-[52px]' : 'text-[34px] md:text-[44px]'}`}>{title}</h1>
          {subtitle && <p className="mt-5 max-w-[600px] text-body text-secondary">{subtitle}</p>}
          {children}
        </div>
        <div className="relative min-w-0 max-w-full min-h-[220px] overflow-hidden bg-white lg:col-span-7 lg:min-h-0">
          {image ? <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full max-w-full object-cover" /> : <div className="gonyik-material-placeholder absolute inset-0" role="img" aria-label={imageAlt || '材料结构示意'} />}
        </div>
      </div>
    </section>
  )
}
