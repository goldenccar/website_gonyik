import type { CSSProperties, ReactNode } from 'react'
import { InlineMarkup } from './MarkupParser'

interface PageHeroProps {
  tag?: string
  title: string
  subtitle?: string
  image?: string | null
  mobileImage?: string | null
  imageAlt?: string
  variant?: 'home' | 'section' | 'detail'
  className?: string
  children?: ReactNode
}

export default function PageHero({ tag, title, subtitle, image, mobileImage, imageAlt = '', variant = 'section', className = '', children }: PageHeroProps) {
  const home = variant === 'home'
  const video = Boolean(image && /\.(mp4|webm|mov)(?:\?.*)?$/i.test(image))
  const height = home ? 'h-[560px] min-h-[560px] sm:h-[620px] sm:min-h-[620px]' : 'min-h-[260px] lg:h-[300px]'
  const mediaClass = `absolute inset-0 -z-20 h-full w-full object-cover ${home ? 'motion-hero-media' : ''} ${home && !mobileImage ? 'object-[68%_center]' : 'object-center'} sm:object-center`

  return (
    <section className={`overflow-hidden bg-bg px-4 md:px-6 ${className}`}>
      <div className={`relative isolate mx-auto flex w-full max-w-[1760px] items-center overflow-hidden bg-dark ${height}`}>
        {video && image ? (
          <>
            {mobileImage && <img src={mobileImage} alt={imageAlt} loading="eager" fetchPriority="high" decoding="async" className={`${mediaClass} sm:hidden`} />}
            <video src={image} autoPlay muted loop playsInline preload="auto" aria-label={imageAlt} className={`absolute inset-0 -z-20 h-full w-full object-cover object-center ${home ? 'motion-hero-media' : ''} ${mobileImage ? 'hidden sm:block' : ''}`} />
          </>
        ) : image || mobileImage ? (
          <picture>
            {mobileImage && <source media="(max-width: 639px)" srcSet={mobileImage} />}
            <img src={image || mobileImage || ''} alt={imageAlt} loading="eager" fetchPriority="high" decoding="async" className={mediaClass} />
          </picture>
        ) : (
          <div className="gonyik-material-placeholder absolute inset-0 -z-20" role="img" aria-label={imageAlt || '材料结构示意'} />
        )}
        <div className={`absolute inset-0 -z-10 bg-[#03182b]/55 sm:bg-transparent sm:bg-gradient-to-r sm:from-[#03182b]/95 ${home ? 'sm:via-[#03182b]/55' : 'sm:via-[#03182b]/50'} sm:to-transparent`} />
        <div className={`w-full max-w-[720px] px-7 text-white md:px-12 lg:px-16 ${home ? 'py-16' : 'py-12'}`}>
          {tag && <p style={home ? { '--motion-delay': '70ms' } as CSSProperties : undefined} className={`uppercase tracking-[0.2em] text-white/70 ${home ? 'motion-hero-item mb-5 text-label' : 'mb-4 text-label'}`}><InlineMarkup text={tag} /></p>}
          <h1 style={home ? { '--motion-delay': '140ms' } as CSSProperties : undefined} className={`whitespace-pre-line font-semibold tracking-[-0.025em] ${home ? 'motion-hero-item text-[40px] leading-[1.1] md:text-[56px]' : 'text-[34px] leading-[1.12] md:text-[44px]'}`}><InlineMarkup text={title} /></h1>
          {subtitle && <p style={home ? { '--motion-delay': '220ms' } as CSSProperties : undefined} className={`mt-5 max-w-[600px] text-body text-white/80 ${home ? 'motion-hero-item' : ''}`}><InlineMarkup text={subtitle} /></p>}
          {children && <div style={home ? { '--motion-delay': '300ms' } as CSSProperties : undefined} className={home ? 'motion-hero-item' : ''}>{children}</div>}
        </div>
      </div>
    </section>
  )
}
