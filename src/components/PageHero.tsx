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
  const home = variant === 'home'
  const video = Boolean(image && /\.(mp4|webm|mov)(?:\?.*)?$/i.test(image))
  const height = home ? 'min-h-[560px] lg:h-[620px]' : 'min-h-[260px] lg:h-[300px]'

  return (
    <section className={`overflow-hidden bg-bg px-4 md:px-6 ${className}`}>
      <div className={`relative isolate mx-auto flex w-full max-w-[1760px] items-center overflow-hidden bg-dark ${height}`}>
        {video && image ? (
          <video src={image} autoPlay muted loop playsInline preload="auto" aria-label={imageAlt} className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        ) : image ? (
          <img src={image} alt={imageAlt} loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        ) : (
          <div className="gonyik-material-placeholder absolute inset-0 -z-20" role="img" aria-label={imageAlt || '材料结构示意'} />
        )}
        <div className={`absolute inset-0 -z-10 bg-gradient-to-r from-[#03182b]/95 ${home ? 'via-[#03182b]/55' : 'via-[#03182b]/50'} to-transparent`} />
        <div className={`w-full max-w-[720px] px-7 text-white md:px-12 lg:px-16 ${home ? 'py-16' : 'py-12'}`}>
          {tag && <p className={`uppercase tracking-[0.2em] text-white/70 ${home ? 'mb-5 text-label' : 'mb-4 text-label'}`}>{tag}</p>}
          <h1 className={`whitespace-pre-line font-semibold tracking-[-0.025em] ${home ? 'text-[40px] leading-[1.1] md:text-[56px]' : 'text-[34px] leading-[1.12] md:text-[44px]'}`}>{title}</h1>
          {subtitle && <p className="mt-5 max-w-[600px] text-body text-white/80">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
