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
  if (variant === 'home') {
    return (
      <section className={`min-h-[560px] overflow-hidden bg-bg px-6 lg:h-[620px] ${className}`}>
        <div className="relative isolate mx-auto flex h-full min-h-[560px] w-full max-w-[1440px] items-center overflow-hidden bg-dark lg:min-h-0">
          {image ? <img src={image} alt={imageAlt} className="absolute inset-0 -z-20 h-full w-full object-cover object-center" /> : <div className="gonyik-material-placeholder absolute inset-0 -z-20" role="img" aria-label={imageAlt || '材料结构示意'} />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#03182b]/95 via-[#03182b]/55 to-transparent" />
          <div className="w-full max-w-[640px] py-16 text-white">
            {tag && <p className="mb-5 text-label uppercase tracking-[0.2em] text-white/75">{tag}</p>}
            <h1 className="whitespace-pre-line text-[40px] font-semibold leading-[1.1] tracking-[-0.025em] md:text-[56px]">{title}</h1>
            {subtitle && <p className="mt-6 max-w-[580px] text-body text-white/80">{subtitle}</p>}
            {children}
          </div>
        </div>
      </section>
    )
  }

  const height = 'min-h-[260px] lg:h-[300px] lg:min-h-0'
  return (
    <section className={`overflow-hidden bg-bg px-6 ${className}`}>
      <div className={`mx-auto grid w-full min-w-0 max-w-[1440px] items-stretch lg:grid-cols-12 ${height}`}>
        <div className="flex min-w-0 flex-col justify-center py-12 lg:col-span-5 lg:py-16 lg:pr-16">
          {tag && <p className="-ml-px mb-4 text-label uppercase text-secondary">{tag}</p>}
          <h1 className="whitespace-pre-line text-[34px] font-semibold leading-[1.12] tracking-[-0.025em] text-primary md:text-[44px]">{title}</h1>
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
