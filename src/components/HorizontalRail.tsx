import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import ReadingProgress from './ReadingProgress'

export default function HorizontalRail({ children, label, mobileStack = false, variant = 'default' }: { children: ReactNode; label: string; mobileStack?: boolean; variant?: 'default' | 'fabric' }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const layout = mobileStack
      ? 'grid-cols-1 gap-8 sm:grid-cols-none sm:auto-cols-[46%] sm:grid-flow-col sm:gap-6 sm:overflow-x-auto sm:pb-9 lg:auto-cols-[calc((100%-4.5rem)/3.85)]'
      : 'auto-cols-[82%] grid-flow-col gap-6 overflow-x-auto pb-9 sm:auto-cols-[46%] lg:auto-cols-[calc((100%-4.5rem)/3.85)]'

  const updateProgress = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    setProgress(rail.scrollWidth > rail.clientWidth ? (rail.scrollLeft + rail.clientWidth) / rail.scrollWidth : 1)
  }, [])

  useEffect(() => {
    updateProgress()
    const rail = railRef.current
    if (!rail) return
    const observer = new ResizeObserver(updateProgress)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [updateProgress, children])

  const railClass = variant === 'fabric'
    ? 'gonyik-rail flex items-stretch gap-5 overflow-x-auto pb-9 sm:gap-6 [&>*]:w-[86%] [&>*]:shrink-0 sm:[&>*]:w-[68%] lg:[&>*]:w-[clamp(560px,42%,680px)] [&>[data-rail-end-card]]:w-[72%] sm:[&>[data-rail-end-card]]:w-[52%] lg:[&>[data-rail-end-card]]:w-[clamp(320px,29%,400px)]'
    : `gonyik-rail grid ${layout}`

  return <div>
    <div ref={railRef} onScroll={updateProgress} aria-label={label} className={railClass}>{children}</div>
    <ReadingProgress progress={progress} className={`mt-[-22px] ${mobileStack && variant !== 'fabric' ? 'hidden sm:block' : 'block'}`} />
  </div>
}
