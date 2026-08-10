import type { ReactNode } from 'react'

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`gonyik-page min-w-0 overflow-x-clip bg-bg ${className}`}>{children}</div>
}

export function PageSection({ children, tone = 'light', className = '', id, outerClassName = '' }: {
  children: ReactNode
  tone?: 'light' | 'white' | 'navy'
  className?: string
  id?: string
  outerClassName?: string
}) {
  const toneClass = tone === 'navy' ? 'bg-darker text-white' : tone === 'white' ? 'bg-white' : 'bg-bg'
  return <section id={id} className={`bg-bg px-4 md:px-6 ${outerClassName}`}><div className={`mx-auto w-full max-w-[1760px] px-7 py-14 md:px-12 md:py-20 lg:px-20 lg:py-20 ${toneClass} ${className}`}>{children}</div></section>
}
