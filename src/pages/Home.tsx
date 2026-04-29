import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getHomeConfig } from '@/api/client'
import type { HomeConfig } from '@/types'

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
    const canvas = canvasRef.current
    if (!canvas) return
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

export default function Home() {
  const [config, setConfig] = useState<HomeConfig | null>(null)

  useEffect(() => {
    getHomeConfig().then((res) => setConfig(res.data.data))
  }, [])

  const titleLines = (config?.hero_title || '科技面料\n定义未来').split('\n')

  return (
    <section className="relative w-full flex-1 overflow-hidden">
      {/* Background */}
      {config?.hero_background ? (
        <>
          <motion.img
            src={config.hero_background}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
        </>
      ) : (
        <DefaultBackground />
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-[20vh] text-center px-6">
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-label text-accent uppercase mb-6"
        >
          {config?.hero_tag || 'TECHNOLOGY FABRIC'}
        </motion.p>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-[32px] sm:text-[40px] md:text-hero text-white mb-6"
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[18px] text-light max-w-[480px] leading-relaxed mb-10"
        >
          {config?.hero_slogan || '以创新材料科技，重塑户外与运动的边界'}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to={config?.primary_btn_link || '/fabrics'}
            className="px-6 sm:px-9 py-3.5 bg-white text-primary text-[14px] font-medium hover:bg-bg transition-all duration-250 hover:scale-[1.02] active:scale-[0.98] text-center w-full sm:w-auto"
          >
            {config?.primary_btn_text || '探索无氟科技面料'}
          </Link>
          <Link
            to={config?.secondary_btn_link || '/equipment'}
            className="px-6 sm:px-9 py-3.5 bg-white/12 text-white text-[14px] font-medium border border-white/25 hover:bg-white/20 hover:border-white/40 transition-all duration-250 text-center w-full sm:w-auto"
          >
            {config?.secondary_btn_text || '探索终端装备'}
          </Link>
        </motion.div>
      </div>

    </section>
  )
}
