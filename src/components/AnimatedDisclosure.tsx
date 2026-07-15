import { useRef, type AnimationEvent, type ReactNode } from 'react'

export default function AnimatedDisclosure({ open, children, className = '', replayKey, scrollOnExpand = false }: {
  open: boolean
  children: ReactNode
  className?: string
  replayKey?: string | number
  scrollOnExpand?: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (
      !open
      || !scrollOnExpand
      || event.currentTarget !== event.target
      || event.animationName !== 'gonyik-disclosure-expand'
    ) return

    rootRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <div
      key={replayKey}
      ref={rootRef}
      aria-hidden={!open}
      onAnimationEnd={handleAnimationEnd}
      className={`grid transition-[grid-template-rows,opacity] duration-[240ms] ease-apple ${open ? `grid-rows-[1fr] opacity-100 ${replayKey === undefined ? '' : 'motion-disclosure-expand'}` : 'pointer-events-none grid-rows-[0fr] opacity-0'} ${className}`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
