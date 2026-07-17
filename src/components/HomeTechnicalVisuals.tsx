import { useId, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { HomePlatformCard, HomeVerification } from '@/types'
import MotionInView from './MotionInView'
import { InlineMarkup } from './MarkupParser'

type MaterialKind = 'membrane' | 'lamination' | 'finishing'

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

const ADHESIVE_POINTS = [160, 205, 250, 295, 340, 385, 430]

type MaterialLayer = { src: string; className: string }

function MaterialScene({ kind, image, layers, label, children }: {
  kind: MaterialKind
  image?: string
  layers?: MaterialLayer[]
  label: string
  children: ReactNode
}) {
  return (
    <div className={`material-render material-render-${kind}`} role="img" aria-label={label}>
      {image && <img src={image} alt="" loading="lazy" decoding="async" className="material-render-image" />}
      {layers?.map((layer) => (
        <img key={layer.src} src={layer.src} alt="" loading="lazy" decoding="async" className={`material-render-layer ${layer.className}`} />
      ))}
      <svg viewBox="0 0 560 220" aria-hidden="true" className="material-render-overlay" fill="none">
        {children}
      </svg>
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
    <MaterialScene kind="membrane" image="/visuals/membrane-waterdrops-v2.png" label="微孔膜阻挡液态水并允许湿气通过的示意图">
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
  const uid = useId().replace(/:/g, '')
  const glowId = `adhesive-glow-${uid}`
  return (
    <MaterialScene
      kind="lamination"
      layers={[
        { src: '/visuals/lamination-layer-backing-alpha-v2.png', className: 'material-render-lamination-backing' },
        { src: '/visuals/lamination-layer-membrane-alpha-v2.png', className: 'material-render-lamination-membrane' },
        { src: '/visuals/lamination-layer-top-alpha-v1.png', className: 'material-render-lamination-top' },
      ]}
      label="织物、膜层和内层压合形成完整复合面料的示意图"
    >
        <defs>
          <filter id={glowId} x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>
        <g className="material-render-adhesive">
          {ADHESIVE_POINTS.map((x, index) => (
            <g key={x} style={{ '--flow-delay': `${index * 110}ms` } as CSSProperties}>
              <circle cx={x} cy={index % 2 ? 127 : 122} r="7" filter={`url(#${glowId})`} className="viz-adhesive-halo" />
              <circle cx={x} cy={index % 2 ? 127 : 122} r="2.2" className="viz-adhesive-core" />
            </g>
          ))}
        </g>
    </MaterialScene>
  )
}

function FinishingDiagram() {
  const uid = useId().replace(/:/g, '')
  const trailId = `finish-trail-${uid}`
  const beadId = `finish-bead-${uid}`
  const vaporId = `finish-vapor-${uid}`
  const softId = `finish-soft-${uid}`
  return (
    <MaterialScene kind="finishing" image="/visuals/finishing-material-alpha-v2.png" label="单层功能织物表面导湿并逐渐干燥的示意图">
        <defs>
          <linearGradient id={trailId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0" />
            <stop offset=".68" stopColor="var(--color-accent)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity=".52" />
          </linearGradient>
          <radialGradient id={beadId} cx="35%" cy="28%" r="68%">
            <stop offset="0" stopColor="#fff" stopOpacity=".78" />
            <stop offset=".38" stopColor="var(--color-accent)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--color-primary)" stopOpacity=".16" />
          </radialGradient>
          <linearGradient id={vaporId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0" />
            <stop offset=".55" stopColor="var(--color-accent)" stopOpacity=".15" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
          <filter id={softId} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <g className="viz-finish-bead">
          <ellipse cx="139" cy="108" rx="17" ry="12" fill={`url(#${beadId})`} />
          <ellipse cx="134" cy="104" rx="5" ry="3" fill="#fff" opacity=".72" />
        </g>
        <g className="viz-finish-trail">
          <path d="M137 122C181 116 222 119 266 112C294 108 318 108 342 105" stroke={`url(#${trailId})`} strokeWidth="10" filter={`url(#${softId})`} />
          <path d="M139 120C190 115 230 118 275 111C299 107 320 107 346 103" stroke={`url(#${trailId})`} strokeWidth="2.2" />
          <path d="M338 96L352 102L340 111Z" fill="var(--color-accent)" className="viz-finish-trail-head" />
        </g>
        <g className="viz-dry-vapor">
          {[420, 476].map((x, index) => (
            <path key={x} style={{ '--flow-delay': `${index * 820}ms` } as CSSProperties} d={`M${x} 143C${x - 12} 127 ${x + 11} 112 ${x} 96C${x - 8} 84 ${x + 6} 72 ${x} 57`} stroke={`url(#${vaporId})`} strokeWidth="14" filter={`url(#${softId})`} />
          ))}
        </g>
    </MaterialScene>
  )
}

const MATERIAL_KINDS: MaterialKind[] = ['membrane', 'lamination', 'finishing']

function MaterialDiagram({ kind }: { kind: MaterialKind }) {
  if (kind === 'membrane') return <MembraneDiagram />
  if (kind === 'lamination') return <LaminationDiagram />
  return <FinishingDiagram />
}

export function MaterialSystemVisual({ items, href }: { items: HomePlatformCard[]; href: string }) {
  return (
    <MotionInView className="material-system-visual grid border-y border-border bg-white lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:mt-[34px]">
      {items.slice(0, 3).map((item, index) => (
        <Link
          key={`${item.title}-${index}`}
          to={href}
          data-motion-item
          style={{ '--motion-delay': `${index * 90}ms` } as CSSProperties}
          className="material-system-row group grid min-h-[218px] border-t border-border bg-transparent px-5 py-4 first:border-t-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.35fr)] md:items-center md:gap-5 md:px-6 lg:min-h-[218px]"
        >
          <div className="relative z-10 pr-4">
            <h3 className="type-card-title text-primary"><InlineMarkup text={item.title} /></h3>
            <p className="mt-3 text-[14px] leading-6 text-secondary"><InlineMarkup text={item.subtitle || item.description || ''} /></p>
            {item.description && item.description !== item.subtitle && <p className="mt-1 text-[14px] leading-6 text-secondary"><InlineMarkup text={item.description} /></p>}
          </div>
          <div className="material-system-media mt-3 h-[170px] min-w-0 text-primary md:mt-0 md:h-[182px]">
            <MaterialDiagram kind={MATERIAL_KINDS[index]} />
          </div>
        </Link>
      ))}
    </MotionInView>
  )
}

export function MaterialValidationSummary({
  image,
  title,
  subtitle,
  items,
  linkText,
  linkTo,
}: {
  image: string | null
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
        {image
          ? <img src={image} alt={internal?.title || '内部实验室'} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          : <div className="gonyik-material-placeholder h-full w-full" />}
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
