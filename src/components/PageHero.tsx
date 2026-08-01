import type { CSSProperties, ReactNode } from 'react'
import { headingLanguageClass } from '@/utils/typography'
import { InlineMarkup } from './MarkupParser'

interface PageHeroProps {
  tag?: string
  title: string
  subtitle?: string
  image?: string | null
  mobileImage?: string | null
  imageAlt?: string
  variant?: 'home' | 'section'
  className?: string
  children?: ReactNode
  scrollLabel?: string
  scrollTarget?: string
}

export default function PageHero({ tag, title, subtitle, image, mobileImage, imageAlt = '', variant = 'section', className = '', children, scrollLabel, scrollTarget }: PageHeroProps) {
  const home = variant === 'home'
  const video = Boolean(image && /\.(mp4|webm|mov)(?:\?.*)?$/i.test(image))
  const height = home ? 'h-[100svh] min-h-[600px]' : 'min-h-[260px] lg:h-[300px]'
  const mediaClass = `absolute inset-0 -z-20 h-full w-full object-cover ${home ? 'motion-hero-media' : ''} ${home && !mobileImage ? 'object-[68%_center]' : 'object-center'} sm:object-center`

  return (
    <section className={`overflow-hidden bg-dark ${className}`}>
      <div className={`relative isolate flex w-full items-center overflow-hidden bg-dark ${height}`}>
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
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-[#03182b]/45 to-transparent" />
        <div className="mx-auto w-full max-w-[1760px]">
          <div className={`w-full px-7 text-white md:px-12 lg:px-16 ${home ? 'home-hero-copy max-w-[920px] pb-32 pt-16 md:pb-36' : 'max-w-[720px] py-12'}`}>
            {home && tag && <p style={{ '--motion-delay': '70ms' } as CSSProperties} className="motion-hero-item label-en mb-6 text-white/80 md:mb-7"><InlineMarkup text={tag} /></p>}
            <h1 style={home ? { '--motion-delay': '140ms' } as CSSProperties : undefined} className={`whitespace-pre-line ${headingLanguageClass(title)} ${home ? 'motion-hero-item type-hero leading-[1.12] tracking-[-.02em]' : 'type-page-title'}`}><InlineMarkup text={title} /></h1>
            {subtitle && <p style={home ? { '--motion-delay': '220ms' } as CSSProperties : undefined} className={`body-copy mt-6 max-w-[540px] text-white/85 md:mt-7 ${home ? 'motion-hero-item text-balance leading-[1.75] md:leading-[1.85]' : ''}`}><InlineMarkup text={subtitle} /></p>}
            {home && children && <div style={{ '--motion-delay': '300ms' } as CSSProperties} className="motion-hero-item mt-9 md:mt-10">{children}</div>}
            {!home && children}
          </div>
        </div>
        {home && scrollLabel && <a href={scrollTarget || '#main-content'} className="pfas-hero-scroll">
          <span><InlineMarkup text={scrollLabel} /></span>
          <span aria-hidden="true" className="pfas-scroll-cue">↓</span>
        </a>}
      </div>
    </section>
  )
}
