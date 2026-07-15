import { useLayoutEffect, useRef, type ReactNode } from 'react'

export default function AnimatedDisclosure({ open, children, className = '', replayKey, scrollOnExpand = false }: {
  open: boolean
  children: ReactNode
  className?: string
  replayKey?: string | number
  scrollOnExpand?: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const replayingExpansion = open && replayKey !== undefined

  useLayoutEffect(() => {
    if (!open || !scrollOnExpand) return

    rootRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [open, replayKey, scrollOnExpand])

  return (
    <div
      ref={rootRef}
      className={`[overflow-anchor:none] ${className}`}
    >
      <div
        key={replayKey}
        aria-hidden={!open}
        className={`grid ${replayingExpansion ? '' : 'transition-[grid-template-rows,opacity] duration-[240ms] ease-apple'} ${open ? `grid-rows-[1fr] opacity-100 ${replayingExpansion ? 'motion-disclosure-expand' : ''}` : 'pointer-events-none grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
