import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getHomeConfig } from '@/api/client'
import type { HomeConfig } from '@/types'

function DefaultBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    function draw() {
      if (!ctx) return
      ctx.fillStyle = '#0D0D0D'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 1
      const gridSize = 60
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Particles
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(time * 0.001 + p.y * 0.01) * 0.1
        p.y += p.vy + Math.cos(time * 0.001 + p.x * 0.01) * 0.1

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.fill()
      })

      // Gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(0,0,0,0.3)')
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.7)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time++
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
    <section className="relative w-full h-[100dvh] overflow-hidden">
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
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
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
            to={config?.primary_btn_link || '/fluorine-free'}
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

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  )
}
