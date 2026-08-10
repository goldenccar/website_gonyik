import { useEffect, useRef } from 'react'

export default function PageScrollProgress() {
  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateProgress = () => {
      const scrollRange = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const progress = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 1
      if (rootRef.current) {
        rootRef.current.style.opacity = scrollRange > 1 ? '1' : '0'
        rootRef.current.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
      }
      if (barRef.current) barRef.current.style.transform = `scaleY(${progress})`
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    const observer = new ResizeObserver(updateProgress)
    observer.observe(document.documentElement)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      observer.disconnect()
    }
  }, [])

  return <div ref={rootRef} role="progressbar" aria-label="页面阅读进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} className="pointer-events-none fixed bottom-0 right-0 top-[60px] z-40 w-px overflow-hidden bg-transparent opacity-0 transition-opacity duration-[var(--motion-instant)]"><span ref={barRef} className="block h-full w-full origin-top bg-[#69B2C1]" /></div>
}
