import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getHomeConfig, getFabricSeries } from '@/api/client'
import DynamicIcon from '@/components/DynamicIcon'
import type { HomeConfig, FabricSeries } from '@/types'

function createMembranePattern(width: number, height: number, density: number, brightnessBase: number) {
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')!

  ctx.fillStyle = '#080808'
  ctx.fillRect(0, 0, width, height)

  // Dense fiber network
  for (let i = 0; i < density; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const angle = Math.random() * Math.PI * 2
    const len = 150 + Math.random() * 350
    const thick = 0.25 + Math.random() * 1.8
    const alpha = 0.06 + Math.random() * 0.28
    const brightness = brightnessBase + Math.random() * 50

    const x1 = x - Math.cos(angle) * len * 0.5
    const y1 = y - Math.sin(angle) * len * 0.5
    const x2 = x + Math.cos(angle) * len * 0.5
    const y2 = y + Math.sin(angle) * len * 0.5

    // Control point for slight curve
    const cx = (x1 + x2) / 2 + (Math.random() - 0.5) * 30
    const cy = (y1 + y2) / 2 + (Math.random() - 0.5) * 30

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(cx, cy, x2, y2)
    ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness + 8}, ${alpha})`
    ctx.lineWidth = thick
    ctx.lineCap = 'round'
    ctx.stroke()

    // Secondary thinner highlight inside thick fibers
    if (thick > 1) {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.quadraticCurveTo(cx, cy, x2, y2)
      ctx.strokeStyle = `rgba(${brightness + 30}, ${brightness + 30}, ${brightness + 35}, ${alpha * 0.25})`
      ctx.lineWidth = thick * 0.35
      ctx.stroke()
    }
  }

  // Bundling: add clusters of parallel fibers
  const bundleCount = Math.floor(density * 0.08)
  for (let b = 0; b < bundleCount; b++) {
    const bx = Math.random() * width
    const by = Math.random() * height
    const bAngle = Math.random() * Math.PI * 2
    const bLen = 200 + Math.random() * 300
    const fibersInBundle = 4 + Math.floor(Math.random() * 6)

    for (let f = 0; f < fibersInBundle; f++) {
      const offset = (f - fibersInBundle / 2) * 3
      const ox = bx + Math.cos(bAngle + Math.PI / 2) * offset
      const oy = by + Math.sin(bAngle + Math.PI / 2) * offset
      const angle = bAngle + (Math.random() - 0.5) * 0.15
      const thick = 0.4 + Math.random() * 1.2
      const alpha = 0.1 + Math.random() * 0.25
      const brightness = brightnessBase + 20 + Math.random() * 40

      const x1 = ox - Math.cos(angle) * bLen * 0.5
      const y1 = oy - Math.sin(angle) * bLen * 0.5
      const x2 = ox + Math.cos(angle) * bLen * 0.5
      const y2 = oy + Math.sin(angle) * bLen * 0.5
      const cx = (x1 + x2) / 2 + (Math.random() - 0.5) * 20
      const cy = (y1 + y2) / 2 + (Math.random() - 0.5) * 20

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.quadraticCurveTo(cx, cy, x2, y2)
      ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness + 8}, ${alpha})`
      ctx.lineWidth = thick
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }

  // Intersection glows
  for (let i = 0; i < density * 0.12; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const r = 2 + Math.random() * 6
    const alpha = 0.04 + Math.random() * 0.18
    const brightness = brightnessBase + 30
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${brightness}, ${brightness}, ${brightness + 5}, ${alpha})`)
    g.addColorStop(1, `rgba(${brightness}, ${brightness}, ${brightness + 5}, 0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // Surface texture noise
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 16) {
    const noise = (Math.random() - 0.5) * 8
    data[i] = Math.min(255, Math.max(0, data[i] + noise))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  return offscreen
}

function DefaultBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    function resize() {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const tileW = 600
    const tileH = 600
    const layer1 = createMembranePattern(tileW, tileH, 380, 170)
    const layer2 = createMembranePattern(tileW, tileH, 280, 110)

    let offset1x = 0
    let offset1y = 0
    let offset2x = 0
    let offset2y = 0

    function draw() {
      if (!ctx) return

      offset1x += 0.12
      offset1y += 0.07
      offset2x += 0.28
      offset2y += 0.16

      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Far layer
      ctx.globalAlpha = 0.55
      const pat2 = ctx.createPattern(layer2, 'repeat')!
      ctx.save()
      ctx.translate(-(offset2x % tileW), -(offset2y % tileH))
      ctx.fillStyle = pat2
      ctx.fillRect(offset2x % tileW, offset2y % tileH, canvas.width + tileW, canvas.height + tileH)
      ctx.restore()

      // Near layer
      ctx.globalAlpha = 1
      const pat1 = ctx.createPattern(layer1, 'repeat')!
      ctx.save()
      ctx.translate(-(offset1x % tileW), -(offset1y % tileH))
      ctx.fillStyle = pat1
      ctx.fillRect(offset1x % tileW, offset1y % tileH, canvas.width + tileW, canvas.height + tileH)
      ctx.restore()

      // Vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.22,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      )
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const fadeUp = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

function SectionHeader({
  tag,
  title,
  subtitle,
  linkText,
  linkTo,
  light,
}: {
  tag?: string
  title: string
  subtitle?: string
  linkText?: string
  linkTo?: string
  light?: boolean
}) {
  return (
    <div className="max-w-[340px]">
      {tag && (
        <p className={`text-label uppercase mb-4 ${light ? 'text-white/60' : 'text-secondary'}`}>{tag}</p>
      )}
      <h2 className={`text-h2 mb-4 ${light ? 'text-white' : 'text-primary'}`}>{title}</h2>
      {subtitle && (
        <p className={`text-body mb-6 ${light ? 'text-white/70' : 'text-secondary'}`}>{subtitle}</p>
      )}
      {linkText && linkTo && (
        <Link
          to={linkTo}
          className={`inline-flex items-center gap-2 text-[14px] font-medium group ${
            light ? 'text-white/80 hover:text-white' : 'text-secondary hover:text-primary'
          }`}
        >
          {linkText}
          <DynamicIcon
            name="ArrowRight"
            size={14}
            className={`transition-transform group-hover:translate-x-1 ${light ? 'text-white/60' : 'text-accent'}`}
          />
        </Link>
      )}
    </div>
  )
}

function HeroSection({ config }: { config: HomeConfig }) {
  const titleLines = (config.hero_title || '以固纳 RPO 无氟材料科技\n创造更安全的高性能织物').split('\n')
  const features = Array.isArray(config.hero_features) ? config.hero_features : []

  return (
    <section className="relative w-full overflow-hidden bg-darker aspect-video min-h-[460px]">
      {/* Background */}
      {config.hero_background ? (
        <>
          <motion.img
            src={config.hero_background}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </>
      ) : (
        <>
          <DefaultBackground />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-[60px] pb-16">
        <div className="py-8 max-w-[720px]">
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="text-label text-accentWarm uppercase mb-4"
          >
            {config.hero_tag || 'PFAS-FREE PERFORMANCE MATERIALS'}
          </motion.p>

          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.35 }}
            className="text-[28px] sm:text-h1 text-white mb-4 leading-[1.12]"
          >
            {titleLines.map((line, i) => (
              <span key={i} className="block">
                {line.split('RPO').map((part, j, arr) => (
                  <span key={j}>
                    {part}
                    {j < arr.length - 1 && <span className="text-accentWarm">RPO</span>}
                  </span>
                ))}
              </span>
            ))}
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.5 }}
            className="text-body text-white/75 max-w-[520px] mb-8"
          >
            {config.hero_slogan || '固纳 RPO 无氟材料平台，融合先进复合技术与结构设计，赋予面料持久防护、舒适透气与多功能表现。'}
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to={config.primary_btn_link || '/fabrics'}
              className="px-6 sm:px-9 py-3 bg-accentWarm text-white text-[14px] font-medium hover:bg-accentWarm/90 transition-all duration-250 hover:scale-[1.02] active:scale-[0.98] text-center w-full sm:w-auto"
            >
              {config.primary_btn_text || '探索材料平台'}
            </Link>
            <Link
              to={config.secondary_btn_link || '/fluorine-free'}
              className="px-6 sm:px-9 py-3 bg-white/10 text-white text-[14px] font-medium border border-white/25 hover:bg-white/20 hover:border-white/40 transition-all duration-250 text-center w-full sm:w-auto"
            >
              {config.secondary_btn_text || '了解无氟未来'}
            </Link>
          </motion.div>
        </div>

        {/* Hero features */}
        {features.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-8 lg:gap-12 py-4"
          >
            {features.map((f, idx) => (
              <div key={idx} className="flex items-start gap-3 max-w-[200px]">
                <div className="mt-0.5 text-white/80">
                  <DynamicIcon name={f.icon} size={20} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">{f.title}</p>
                  <p className="text-[13px] text-white/60 mt-0.5">{f.subtitle}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

function PlatformSection({ config }: { config: HomeConfig }) {
  const cards = Array.isArray(config.platform_cards) ? config.platform_cards : []
  return (
    <section className="bg-bg py-10 lg:py-12">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          <SectionHeader
            title={config.platform_section_title || '技术来源与材料平台'}
            subtitle={config.platform_section_subtitle || '源自科研，成就可靠材料解决方案。'}
            linkText={config.platform_section_link_text || '了解更多'}
            linkTo={config.platform_section_link || '/fluorine-free'}
          />

          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white border border-border p-5 group hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="p-2.5 bg-bg text-primary">
                    <DynamicIcon name={card.icon} size={20} />
                  </div>
                </div>
                <h3 className="text-h5 text-primary mb-1">{card.title}</h3>
                <p className="text-[13px] text-secondary mb-3 leading-snug">{card.subtitle}</p>
                <div className="space-y-1 mb-4">
                  {(card.description || '').split('\n').filter(Boolean).slice(0, 2).map((line, i) => (
                    <p key={i} className="text-[13px] text-muted leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="text-label text-accent">{card.footer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SeriesSection({ config, series }: { config: HomeConfig; series: FabricSeries[] }) {
  const displaySeries = series
    .filter((s) => s.order_index < 3)
    .sort((a, b) => a.order_index - b.order_index)
    .slice(0, 3)

  return (
    <section className="bg-darker py-10 lg:py-12">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          <SectionHeader
            title={config.series_section_title || '核心面料平台'}
            subtitle={config.series_section_subtitle || '面向多元应用的材料平台，让高性能更可持续。'}
            linkText={config.series_section_link_text || '查看全部系列'}
            linkTo={config.series_section_link || '/fabrics'}
            light
          />

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {displaySeries.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={`/fabrics?series=${s.slug}`}
                  className="group relative block h-[180px] lg:h-[200px] overflow-hidden border border-white/10 bg-dark"
                >
                  {s.home_image ? (
                    <img
                      src={s.home_image}
                      alt={s.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-h4 text-white mb-1">{s.name}</h3>
                      <p className="text-[13px] text-white/80 font-medium mb-2">{s.tagline}</p>
                      <p className="text-[12px] text-white/60 leading-relaxed line-clamp-2">{s.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/50 uppercase tracking-wider">{s.slug}</span>
                      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-primary transition-all">
                        <DynamicIcon name="ArrowRight" size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ScenariosSection({ config }: { config: HomeConfig }) {
  const scenarios = Array.isArray(config.scenarios) ? config.scenarios : []
  return (
    <Link to="/equipment" className="block bg-bg py-5 lg:py-6 border-b border-border hover:bg-[var(--gray-4)] transition-colors">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <h3 className="text-label text-primary whitespace-nowrap">
            {config.scenarios_section_title || '应用场景提示'}
          </h3>
          <div className="flex-1 flex flex-wrap gap-5 lg:gap-8">
            {scenarios.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-secondary group"
              >
                <DynamicIcon
                  name={item.icon}
                  size={18}
                  className="text-accent group-hover:text-accentWarm transition-colors"
                />
                <span className="text-[14px]">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[14px] text-secondary group">
            <span>查看终端装备</span>
            <DynamicIcon name="ArrowRight" size={14} className="text-accent" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function VerificationSection({ config }: { config: HomeConfig }) {
  const items = Array.isArray(config.verifications) ? config.verifications : []
  return (
    <section className="bg-bg py-10 lg:py-14">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          <SectionHeader
            title={config.verification_section_title || '验证与标准'}
            subtitle={config.verification_section_subtitle || '平台级验证，安心选择。'}
            linkText={config.verification_section_link_text || '具体指标见系列'}
            linkTo={config.verification_section_link || '/fabrics'}
          />

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3"
              >
                <div className="p-2 bg-white border border-border text-primary shrink-0">
                  <DynamicIcon name={item.icon} size={18} />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-primary mb-0.5">{item.title}</h4>
                  <p className="text-[12px] text-secondary">{item.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [config, setConfig] = useState<HomeConfig | null>(null)
  const [series, setSeries] = useState<FabricSeries[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getHomeConfig(), getFabricSeries()])
      .then(([homeRes, seriesRes]) => {
        setConfig(homeRes.data.data || null)
        setSeries(seriesRes.data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !config) {
    return (
      <section className="relative w-full flex-1 overflow-hidden min-h-[calc(100dvh-60px)] bg-darker">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col">
      <HeroSection config={config} />
      <PlatformSection config={config} />
      <SeriesSection config={config} series={series} />
      <ScenariosSection config={config} />
    </div>
  )
}
