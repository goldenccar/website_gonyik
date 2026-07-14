import { useEffect, useRef, useState, type ReactNode } from 'react'

export default function MotionInView({ children, className = '', threshold = 0.18 }: {
  children: ReactNode
  className?: string
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      observer.disconnect()
    }, { threshold })
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return <div ref={ref} className={`motion-in-view ${visible ? 'is-visible' : ''} ${className}`}>{children}</div>
}
