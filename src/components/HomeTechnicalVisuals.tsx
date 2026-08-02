import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { HomePlatformCard, HomeVerification, HomeVerificationImage } from '@/types'
import MotionInView from './MotionInView'
import { InlineMarkup } from './MarkupParser'

type MaterialKind = 'membrane' | 'lamination' | 'supply'

const TECHNICAL_VISUAL_ASSETS = [
  '/visuals/membrane-waterdrops-v3.webp',
  '/visuals/lamination-layer-backing-alpha-v3.webp',
  '/visuals/lamination-layer-membrane-alpha-v3.webp',
  '/visuals/lamination-layer-top-alpha-v3.webp',
  '/visuals/supply-chain-ribbon-v2.webp',
  '/visuals/supply-chain-node-lab-v2.webp',
  '/visuals/supply-chain-node-factory-v2.webp',
  '/visuals/supply-chain-node-retail-v2.webp',
  '/visuals/supply-chain-node-materials-v2.webp',
  '/visuals/supply-chain-node-material-v2.webp',
] as const

export const SUPPLY_CHAIN_ASSETS = [
  '/visuals/supply-chain-ribbon-v2.webp',
  '/visuals/supply-chain-node-lab-v2.webp',
  '/visuals/supply-chain-node-factory-v2.webp',
  '/visuals/supply-chain-node-retail-v2.webp',
  '/visuals/supply-chain-node-materials-v2.webp',
  '/visuals/supply-chain-node-material-v2.webp',
] as const

function useImagesReady(assets: readonly string[]) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
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
  return useImagesReady(TECHNICAL_VISUAL_ASSETS)
}

export function useSupplyChainReady() {
  return useImagesReady(SUPPLY_CHAIN_ASSETS)
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
  label: string
  children?: ReactNode
}) {
  return (
    <div className={`material-render material-render-${kind}`} role="img" aria-label={label}>
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
  const uid = useId().replace(/:/g, '')
  const waterId = `water-drop-${uid}`
  const fogId = `fog-volume-${uid}`
  const softId = `flow-soft-${uid}`
  const fogFilterId = `fog-filter-${uid}`
  return (
    <MaterialScene kind="membrane" image="/visuals/membrane-waterdrops-v3.webp" label="微孔膜阻挡液态水并允许湿气通过的示意图">
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

export function LaminationDiagram() {
  return (
    <MaterialScene
      kind="lamination"
      layers={[
        { src: '/visuals/lamination-layer-backing-alpha-v3.webp', className: 'material-render-lamination-backing' },
        { src: '/visuals/lamination-layer-membrane-alpha-v3.webp', className: 'material-render-lamination-membrane' },
        { src: '/visuals/lamination-layer-top-alpha-v3.webp', className: 'material-render-lamination-top' },
      ]}
      label="织物、膜层和内层压合形成完整复合面料的示意图"
    />
  )
}

const SUPPLY_CHAIN_NODES = [
  { key: 'lab', src: '/visuals/supply-chain-node-lab-v2.webp', delay: -3.316 },
  { key: 'factory', src: '/visuals/supply-chain-node-factory-v2.webp', delay: -.76 },
  { key: 'retail', src: '/visuals/supply-chain-node-retail-v2.webp', delay: -9.542 },
  { key: 'materials', src: '/visuals/supply-chain-node-materials-v2.webp', delay: -6.832 },
  { key: 'material', src: '/visuals/supply-chain-node-material-v2.webp', delay: -4.212 },
] as const

export function SupplyChainDiagram() {
  const uid = useId().replace(/:/g, '')
  const glowId = `supply-glow-${uid}`
  return (
    <div className="supply-chain-scene" role="img" aria-label="从原料、材料、实验验证、制造到终端应用的无氟供应链闭环示意图">
      <div className="supply-chain-canvas" aria-hidden="true">
        <img src="/visuals/supply-chain-ribbon-v2.webp" alt="" loading="lazy" decoding="async" fetchPriority="low" className="supply-chain-ribbon" />
        <svg viewBox="0 0 1746 901" className="supply-chain-flow" fill="none">
          <defs>
            <filter id={glowId} x="-60%" y="-80%" width="220%" height="260%">
              <feGaussianBlur stdDeviation="18" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <ellipse cx="873" cy="466" rx="642" ry="278" pathLength="100" className="supply-chain-pulse" filter={`url(#${glowId})`} />
        </svg>
        {SUPPLY_CHAIN_NODES.map((node) => (
          <div
            key={node.key}
            className={`supply-chain-node supply-chain-node-${node.key}`}
            style={{ '--supply-delay': `${node.delay}s` } as CSSProperties}
          >
            <img src={node.src} alt="" loading="lazy" decoding="async" fetchPriority="low" />
          </div>
        ))}
        <div className="supply-chain-center"><span>PFAS FREE</span></div>
      </div>
    </div>
  )
}

const MATERIAL_KINDS: MaterialKind[] = ['membrane', 'lamination', 'supply']

function MaterialDiagram({ kind }: { kind: MaterialKind }) {
  if (kind === 'membrane') return <MembraneDiagram />
  if (kind === 'lamination') return <LaminationDiagram />
  return <SupplyChainDiagram />
}

export function MaterialSystemVisual({ items, href, itemHrefs }: { items: HomePlatformCard[]; href: string; itemHrefs?: string[] }) {
  const mediaReady = useTechnicalVisualsReady()
  return (
    <MotionInView className={`material-system-visual supply-chain-motion ${mediaReady ? 'media-ready' : ''} grid border-y border-border bg-white lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:mt-[34px]`}>
      {items.slice(0, 3).map((item, index) => (
        <Link
          key={`${item.title}-${index}`}
          to={itemHrefs?.[index] || href}
          data-motion-item
          style={{ '--motion-delay': `${index * 90}ms` } as CSSProperties}
          className="material-system-row group relative isolate grid min-h-[218px] overflow-hidden border-t border-border bg-transparent px-5 py-4 first:border-t-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.35fr)] md:items-center md:gap-5 md:px-10 lg:min-h-[218px]"
        >
          <div className="relative z-10 pr-4">
            <h3 className="type-card-title text-primary"><InlineMarkup text={item.title} /></h3>
            <p className="mt-3 text-[14px] leading-6 text-secondary"><InlineMarkup text={item.subtitle || item.description || ''} /></p>
            {item.description && item.description !== item.subtitle && <p className="mt-1 text-[14px] leading-6 text-secondary"><InlineMarkup text={item.description} /></p>}
          </div>
          <div className="material-system-media relative z-0 mt-3 h-[170px] min-w-0 overflow-hidden text-primary md:mt-0 md:h-[182px]">
            <MaterialDiagram kind={MATERIAL_KINDS[index]} />
          </div>
        </Link>
      ))}
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

  if (!slides.length) return <div className="gonyik-material-placeholder h-full w-full" />

  return (
    <div
      className="group relative h-full w-full overflow-hidden bg-[#e8edf0]"
      onMouseEnter={() => setPointerPaused(true)}
      onMouseLeave={() => setPointerPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false)
      }}
    >
      {slides.map((slide, index) => (
        <img
          key={slide.id || `${slide.url}-${index}`}
          src={slide.url}
          alt={index === activeIndex ? alt : ''}
          aria-hidden={index !== activeIndex}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-apple motion-reduce:transition-none ${
            index === activeIndex ? 'scale-100 opacity-100' : 'pointer-events-none scale-[1.006] opacity-0'
          }`}
        />
      ))}
      {slides.length > 1 && (
        <>
          <span className="sr-only" aria-live="polite">正在显示第 {activeIndex + 1} 张，共 {slides.length} 张</span>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 border border-white/50 bg-primary/70 p-1 text-white shadow-sm backdrop-blur-md">
            <button type="button" onClick={() => selectSlide(activeIndex - 1)} aria-label="上一张实验室图片" className="grid h-7 w-7 place-items-center text-[16px] transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">←</button>
            <span className="min-w-[42px] text-center text-[10px] tabular-nums tracking-[0.12em]">{String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => selectSlide(activeIndex + 1)} aria-label="下一张实验室图片" className="grid h-7 w-7 place-items-center text-[16px] transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">→</button>
          </div>
        </>
      )}
    </div>
  )
}

export function MaterialValidationSummary({
  image,
  images,
  title,
  subtitle,
  items,
  linkText,
  linkTo,
}: {
  image: string | null
  images: HomeVerificationImage[]
  title: string
  subtitle: string
  items: HomeVerification[]
  linkText: string
  linkTo: string
}) {
  const internal = items[0]
  const certification = items[1]
  return (
    <MotionInView className="material-validation-summary max-w-[560px] lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:self-start">
      <div data-motion-item className="border-l-2 border-accent pl-4">
        <h3 className="text-[18px] font-medium leading-7 text-primary"><InlineMarkup text={title} /></h3>
        {subtitle && <p className="mt-1.5 text-[13px] leading-5 text-secondary"><InlineMarkup text={subtitle} /></p>}
      </div>
      <div data-motion-item style={{ '--motion-delay': '70ms' } as CSSProperties} className="mt-3 aspect-[16/6] overflow-hidden bg-[#e8edf0]">
        <VerificationGallery images={images} fallbackImage={image} alt={internal?.title || '内部实验室'} />
      </div>
      {internal && <div data-motion-item style={{ '--motion-delay': '120ms' } as CSSProperties} className="border-b border-border py-3">
        <h4 className="text-[15px] font-medium leading-6 text-primary"><InlineMarkup text={internal.title} /></h4>
        <p className="mt-1 text-[12px] leading-[1.65] text-secondary"><InlineMarkup text={internal.subtitle} /></p>
      </div>}
      {certification && <Link to={linkTo} data-motion-item style={{ '--motion-delay': '170ms' } as CSSProperties} className="group flex items-start justify-between gap-5 pt-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
        <div className="min-w-0">
          <h4 className="text-[15px] font-medium leading-6 text-primary"><InlineMarkup text={certification.title} /></h4>
          <p className="mt-1 text-[12px] leading-[1.65] text-secondary"><InlineMarkup text={certification.subtitle} /></p>
          <span className="sr-only"><InlineMarkup text={linkText} /></span>
        </div>
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-[17px] leading-6 text-primary transition-transform duration-[var(--motion-switch)] ease-apple group-hover:translate-x-1 group-focus-visible:translate-x-1">→</span>
      </Link>}
    </MotionInView>
  )
}
