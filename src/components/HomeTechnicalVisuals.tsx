import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import CarouselControls from './CarouselControls'
import type { HomePlatformCard, HomeVerificationImage } from '@/types'
import { useSiteLocale } from '@/i18n/SiteLocale'
import MotionInView from './MotionInView'
import { InlineMarkup } from './MarkupParser'

type MaterialKind = 'membrane' | 'lamination' | 'supply'

function useImagesReady(assets: readonly string[]) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    let active = true
    let readinessTimeout = 0
    let preloadTimeout = 0
    const loadImage = (src: string) => new Promise<void>((resolve) => {
      const image = new Image()
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        image.decode().catch(() => undefined).finally(resolve)
      }
      image.decoding = 'async'
      image.fetchPriority = 'low'
      image.onload = finish
      image.onerror = finish
      image.src = src
      if (image.complete) finish()
    })

    // Keep below-the-fold technical media from competing with the hero image.
    // A short defer still warms the browser cache before most users reach it.
    preloadTimeout = window.setTimeout(() => {
      readinessTimeout = window.setTimeout(() => active && setReady(true), 5000)
      Promise.all(assets.map(loadImage)).then(() => {
        window.clearTimeout(readinessTimeout)
        if (active) setReady(true)
      })
    }, 450)

    return () => {
      active = false
      window.clearTimeout(preloadTimeout)
      window.clearTimeout(readinessTimeout)
    }
  }, [assets])

  return ready
}

function useTechnicalVisualsReady() {
  const { bootstrap } = useSiteLocale()
  const config = bootstrap.home_config.technical_visuals
  const assets = useMemo(() => Object.entries(config || {}).filter(([key, value]) => key.endsWith('_image') && value).map(([, value]) => value as string), [config])
  return useImagesReady(assets)
}

type FlowPoint = { x: number; y: number; scale: number; delay: number }

const RAIN_DROPS: FlowPoint[] = [
  { x: 182, y: 25, scale: .7, delay: 0 },
  { x: 236, y: 3, scale: .88, delay: 540 },
  { x: 292, y: 7, scale: .66, delay: 1020 },
  { x: 350, y: 10, scale: .8, delay: 1560 },
  { x: 400, y: 25, scale: .62, delay: 2100 },
]

const FOG_COLUMNS: FlowPoint[] = [
  { x: 208, y: 8, scale: .82, delay: 280 },
  { x: 318, y: 2, scale: .96, delay: 1120 },
  { x: 420, y: 6, scale: .76, delay: 1980 },
]

type MaterialLayer = { src: string; className: string }

function MaterialScene({ kind, image, layers, label, children }: {
  kind: MaterialKind
  image?: string
  layers?: MaterialLayer[]
  label?: string
  children?: ReactNode
}) {
  return (
    <div className={`material-render material-render-${kind}`} role={label ? 'img' : undefined} aria-label={label || undefined}>
      <div className="material-render-stage" aria-hidden="true">
        {image && <img src={image} alt="" loading="lazy" decoding="async" fetchPriority="low" className="material-render-image" />}
        {layers?.map((layer) => (
          <img key={layer.src} src={layer.src} alt="" loading="lazy" decoding="async" fetchPriority="low" className={`material-render-layer ${layer.className}`} />
        ))}
      </div>
      {children && (
        <svg viewBox="0 0 560 220" aria-hidden="true" className="material-render-overlay" fill="none">
          {children}
        </svg>
      )}
    </div>
  )
}

function MembraneDiagram() {
  const { bootstrap, t } = useSiteLocale()
  const config = bootstrap.home_config.technical_visuals
  const uid = useId().replace(/:/g, '')
  const waterId = `water-drop-${uid}`
  const fogId = `fog-volume-${uid}`
  const softId = `flow-soft-${uid}`
  const fogFilterId = `fog-filter-${uid}`
  return (
    <MaterialScene kind="membrane" image={config?.membrane_image} label={t(config?.membrane_label || '')}>
        <defs>
          <radialGradient id={waterId} cx="34%" cy="26%" r="72%">
            <stop offset="0" stopColor="#fff" stopOpacity=".9" />
            <stop offset=".28" stopColor="var(--color-accent)" stopOpacity=".3" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity=".7" />
          </radialGradient>
          <linearGradient id={fogId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#dcecef" stopOpacity=".1" />
            <stop offset=".38" stopColor="var(--color-accent)" stopOpacity=".72" />
            <stop offset=".74" stopColor="#b9d9df" stopOpacity=".58" />
            <stop offset="1" stopColor="#f7fbfc" stopOpacity="0" />
          </linearGradient>
          <filter id={softId} x="-80%" y="-50%" width="260%" height="220%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id={fogFilterId} x="-100%" y="-70%" width="300%" height="260%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .045" numOctaves="2" seed="7" result="fogNoise" />
            <feDisplacementMap in="SourceGraphic" in2="fogNoise" scale="12" xChannelSelector="R" yChannelSelector="G" result="fogShape" />
            <feGaussianBlur in="fogShape" stdDeviation="5.5" />
          </filter>
        </defs>
        <g className="viz-rain">
          {RAIN_DROPS.map(({ x, y, scale, delay }) => (
            <g key={x} className="viz-rain-drop" transform={`translate(${x} ${y}) scale(${scale})`} style={{ '--flow-delay': `${delay}ms` } as CSSProperties}>
              <g className="viz-rain-body">
                <ellipse cx="0" cy="52" rx="14" ry="18" fill="var(--color-accent)" filter={`url(#${softId})`} className="viz-water-drop-aura" />
                <path d="M0 30C-8 41-12 49-12 56C-12 64-7 70 0 70C7 70 12 64 12 56C12 49 8 41 0 30Z" fill={`url(#${waterId})`} className="viz-water-drop" />
                <ellipse cx="-4" cy="50" rx="2.8" ry="4.8" fill="#fff" className="viz-water-drop-highlight" />
              </g>
              <ellipse cx="0" cy="88" rx="24" ry="4.5" fill="var(--color-accent)" className="viz-rain-impact" />
            </g>
          ))}
        </g>
        <g className="viz-fog">
          {FOG_COLUMNS.map(({ x, y, scale, delay }) => (
            <g key={x} transform={`translate(${x} ${y}) scale(${scale})`} style={{ '--flow-delay': `${delay}ms` } as CSSProperties}>
              <g className="viz-fog-volume" filter={`url(#${fogFilterId})`}>
                <path d="M-15 214C-34 201-30 184-20 172C-38 155-27 137-10 128C-12 112-2 98 12 96C29 105 34 121 25 136C42 149 37 169 23 179C34 195 23 210 8 216Z" fill={`url(#${fogId})`} className="viz-fog-body" />
                <ellipse cx="-7" cy="176" rx="27" ry="19" fill={`url(#${fogId})`} className="viz-fog-aura" />
                <ellipse cx="8" cy="143" rx="31" ry="22" fill={`url(#${fogId})`} className="viz-fog-aura" />
              </g>
              <ellipse cx="0" cy="126" rx="21" ry="4.5" fill="var(--color-accent)" className="viz-fog-contact" />
            </g>
          ))}
        </g>
    </MaterialScene>
  )
}

function LaminationDiagram() {
  const { bootstrap, t } = useSiteLocale()
  const config = bootstrap.home_config.technical_visuals
  return (
    <MaterialScene
      kind="lamination"
      layers={[
        { src: config?.lamination_backing_image || '', className: 'material-render-lamination-backing' },
        { src: config?.lamination_membrane_image || '', className: 'material-render-lamination-membrane' },
        { src: config?.lamination_top_image || '', className: 'material-render-lamination-top' },
      ].filter(layer => layer.src)}
      label={t(config?.lamination_label || '')}
    />
  )
}

const SUPPLY_CHAIN_NODES = [
  { key: 'lab', delay: -3.316 },
  { key: 'factory', delay: -.76 },
  { key: 'retail', delay: -9.542 },
  { key: 'materials', delay: -6.832 },
  { key: 'material', delay: -4.212 },
] as const

function SupplyChainDiagram({ label }: { label?: string }) {
  const { bootstrap, t } = useSiteLocale()
  const config = bootstrap.home_config.technical_visuals
  const uid = useId().replace(/:/g, '')
  const glowId = `supply-glow-${uid}`
  return (
    <div className="supply-chain-scene" role={config?.supply_label ? 'img' : undefined} aria-label={config?.supply_label ? t(config.supply_label) : undefined}>
      <div className="supply-chain-canvas" aria-hidden="true">
        {config?.supply_ribbon_image && <img src={config.supply_ribbon_image} alt="" loading="lazy" decoding="async" fetchPriority="low" className="supply-chain-ribbon" />}
        <svg viewBox="0 0 1746 901" className="supply-chain-flow" fill="none">
          <defs>
            <filter id={glowId} x="-60%" y="-80%" width="220%" height="260%">
              <feGaussianBlur stdDeviation="18" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <ellipse cx="873" cy="466" rx="642" ry="278" pathLength="100" className="supply-chain-pulse" filter={`url(#${glowId})`} />
        </svg>
        {SUPPLY_CHAIN_NODES.filter(node => config?.[`supply_${node.key}_image`]).map((node) => (
          <div
            key={node.key}
            className={`supply-chain-node supply-chain-node-${node.key}`}
            style={{ '--supply-delay': `${node.delay}s` } as CSSProperties}
          >
            <img src={config?.[`supply_${node.key}_image`]} alt="" loading="lazy" decoding="async" fetchPriority="low" />
          </div>
        ))}
        {label && <div className="supply-chain-center"><span><InlineMarkup text={label} /></span></div>}
      </div>
    </div>
  )
}

export function SupplyChainVisual() {
  const { bootstrap } = useSiteLocale()
  const ready = useTechnicalVisualsReady()
  return <MotionInView className={`rpo-supply-animation supply-chain-motion ${ready ? 'media-ready' : ''}`}><SupplyChainDiagram label={bootstrap.home_config.technical_visuals?.supply_rpo_center} /></MotionInView>
}

export function MaterialTechnologyVisual({ kind }: { kind: 'membrane' | 'lamination' }) {
  const ready = useTechnicalVisualsReady()
  return <MotionInView className={`rpo-material-animation material-system-visual ${ready ? 'media-ready' : ''}`}><MaterialDiagram kind={kind} /></MotionInView>
}

function MaterialDiagram({ kind }: { kind: MaterialKind }) {
  const { bootstrap } = useSiteLocale()
  if (kind === 'membrane') return <MembraneDiagram />
  if (kind === 'lamination') return <LaminationDiagram />
  return <SupplyChainDiagram label={bootstrap.home_config.technical_visuals?.supply_home_center} />
}

export function MaterialSystemVisual({ items }: { items: HomePlatformCard[] }) {
  const { path } = useSiteLocale()
  const mediaReady = useTechnicalVisualsReady()
  return (
    <MotionInView className={`material-system-visual home-technology-list supply-chain-motion ${mediaReady ? 'media-ready' : ''}`}>
      {items.slice(0, 3).map((item, index) => {
        const content = <>
          <div className="relative z-10 min-w-0">
            <div className="home-technology-row-heading"><h3 className="type-card-title text-primary"><InlineMarkup text={item.title} /></h3>{item.link && <ArrowUpRight className="home-technology-arrow" size={18} strokeWidth={1.5} aria-hidden="true" />}</div>
            {item.subtitle && <p className="mt-2 body-copy text-secondary"><InlineMarkup text={item.subtitle} /></p>}
          </div>
          <div className="material-system-media relative z-0 h-[150px] min-w-0 overflow-hidden text-primary">
            {item.visual === 'membrane' || item.visual === 'lamination' || item.visual === 'supply' ? <MaterialDiagram kind={item.visual} /> : item.visual === 'image' && item.image_url ? <img src={item.image_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" /> : null}
          </div>
        </>
        const props = { 'data-motion-item': true, style: { '--motion-delay': `${index * 90}ms` } as CSSProperties, className: 'material-system-row home-technology-row' }
        return item.link ? <Link key={`${item.title}-${index}`} to={path(item.link)} {...props}>{content}</Link> : <article key={`${item.title}-${index}`} {...props}>{content}</article>
      })}
    </MotionInView>
  )
}

function VerificationGallery({
  images,
  fallbackImage,
  alt,
}: {
  images: HomeVerificationImage[]
  fallbackImage: string | null
  alt: string
}) {
  const slides = useMemo(() => {
    const normalized = [...images]
      .filter((item) => item?.url)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .slice(0, 5)
    if (!normalized.length && fallbackImage) {
      normalized.push({ id: 'legacy-verification-image', url: fallbackImage, order_index: 0 })
    }
    return normalized
  }, [fallbackImage, images])
  const { t } = useSiteLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [pointerPaused, setPointerPaused] = useState(false)
  const [focusPaused, setFocusPaused] = useState(false)
  const [manualPaused, setManualPaused] = useState(false)
  const manualTimer = useRef<number | null>(null)

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0)
  }, [activeIndex, slides.length])

  useEffect(() => {
    if (slides.length < 2 || pointerPaused || focusPaused || manualPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => {
      if (!document.hidden) setActiveIndex((index) => (index + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(interval)
  }, [focusPaused, manualPaused, pointerPaused, slides.length])

  useEffect(() => {
    if (slides.length < 2) return
    const nextImage = new Image()
    nextImage.decoding = 'async'
    nextImage.src = slides[(activeIndex + 1) % slides.length].url
  }, [activeIndex, slides])

  useEffect(() => () => {
    if (manualTimer.current !== null) window.clearTimeout(manualTimer.current)
  }, [])

  const selectSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length)
    setManualPaused(true)
    if (manualTimer.current !== null) window.clearTimeout(manualTimer.current)
    manualTimer.current = window.setTimeout(() => setManualPaused(false), 10000)
  }

  if (!slides.length) return <div className="gonyik-material-placeholder aspect-[8/3] w-full" />

  return (
    <div
      className="home-lab-gallery"
      onMouseEnter={() => setPointerPaused(true)}
      onMouseLeave={() => setPointerPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false)
      }}
    >
      <div className="home-lab-photo">{slides.map((slide, index) => (
        <img
          key={slide.id || `${slide.url}-${index}`}
          src={slide.url}
          alt={index === activeIndex ? t(alt) : ''}
          aria-hidden={index !== activeIndex}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-apple motion-reduce:transition-none ${
            index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
      ))}</div>
      {slides.length > 1 && (
        <div className="home-lab-controls">
          <span className="sr-only" aria-live="polite">{t('图片 {current} / {total}').replace('{current}', String(activeIndex + 1)).replace('{total}', String(slides.length))}</span>
          <span aria-hidden="true" className="home-lab-counter caption-copy tabular-nums"><span>{String(activeIndex + 1).padStart(2, '0')}</span><span className="text-secondary">/ {String(slides.length).padStart(2, '0')}</span></span>
          <CarouselControls previousLabel={t('上一张实验室图片')} nextLabel={t('下一张实验室图片')} onPrevious={() => selectSlide(activeIndex - 1)} onNext={() => selectSlide(activeIndex + 1)} />
        </div>
      )}
    </div>
  )
}

export function MaterialValidationSummary({
  image,
  images,
  title,
  subtitle,
  linkText,
  linkTo,
}: {
  image: string | null
  images: HomeVerificationImage[]
  title: string
  subtitle: string
  linkText: string
  linkTo: string
}) {
  return (
    <MotionInView className="material-validation-summary home-lab-feature">
      <div data-motion-item>
        <VerificationGallery images={images} fallbackImage={image} alt="材料测试实验室" />
      </div>
      <div className="home-lab-copy">
        <h3 className="type-card-title text-primary"><InlineMarkup text={title} /></h3>
        {subtitle && <p className="mt-3 body-copy text-secondary"><InlineMarkup text={subtitle} /></p>}
        <Link to={linkTo} className="home-technology-link home-lab-link ui-copy"><InlineMarkup text={linkText || '了解测试与验证'} /><ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" /></Link>
      </div>
    </MotionInView>
  )
}
