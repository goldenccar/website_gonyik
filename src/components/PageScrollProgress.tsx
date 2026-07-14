import { useCallback, useEffect, useState } from 'react'
import ReadingProgress from './ReadingProgress'

export default function PageScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [scrollable, setScrollable] = useState(false)

  const updateProgress = useCallback(() => {
    const documentHeight = document.documentElement.scrollHeight
    const scrollRange = Math.max(0, documentHeight - window.innerHeight)
    setScrollable(scrollRange > 1)
    setProgress(scrollRange > 0 ? window.scrollY / scrollRange : 1)
  }, [])

  useEffect(() => {
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
  }, [updateProgress])

  return <ReadingProgress
    progress={progress}
    orientation="vertical"
    label="页面阅读进度"
    className={`pointer-events-none fixed bottom-0 right-0 top-[60px] z-40 transition-opacity duration-[var(--motion-instant)] ${scrollable ? 'opacity-100' : 'opacity-0'}`}
  />
}
