import type { ReactNode } from 'react'

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`gonyik-page min-w-0 overflow-x-clip bg-bg ${className}`}>{children}</div>
}

export function PageSection({ children, tone = 'light', className = '', id, outerClassName = '', variant = 'default' }: {
  children: ReactNode
  variant?: 'default' | 'home'
  tone?: 'light' | 'white' | 'navy'
  className?: string
  id?: string
  outerClassName?: string
}) {
  const toneClass = tone === 'navy' ? 'bg-darker text-white' : tone === 'white' ? 'bg-white' : 'bg-bg'
  if (variant === 'home') return <section id={id} className={`${toneClass} px-5 md:px-8 ${outerClassName}`}><div className={`mx-auto w-full max-w-[1200px] py-16 md:py-24 ${className}`}>{children}</div></section>
  return <section id={id} className={`bg-bg md:px-6 ${outerClassName}`}><div className={`mx-auto w-full max-w-[1760px] px-6 py-10 md:px-12 md:py-20 lg:px-20 lg:py-20 ${toneClass} ${className}`}>{children}</div></section>
}
