import type { ReactNode } from 'react'

export default function AnimatedDisclosure({ open, children, className = '' }: {
  open: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div aria-hidden={!open} className={`grid transition-[grid-template-rows,opacity] duration-[240ms] ease-apple ${open ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'} ${className}`}>
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
