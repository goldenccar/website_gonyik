import type { ReactNode } from 'react'

interface PageHeroProps {
  tag?: string
  title: string
  subtitle?: string
  dark?: boolean
  className?: string
  children?: ReactNode
}

export default function PageHero({
  tag,
  title,
  subtitle,
  dark = true,
  className = '',
  children,
}: PageHeroProps) {
  return (
    <section
      className={`px-6 lg:px-12 pt-[60px] ${dark ? 'bg-darker' : 'bg-bg'} ${className}`}
    >
      <div className="max-w-[1440px] mx-auto w-full py-8">
        {tag && <p className="text-label text-accent uppercase mb-4">{tag}</p>}
        <h1 className="text-h1 text-white mb-4">{title}</h1>
        {subtitle && (
          <p className="text-body text-accent max-w-[600px]">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  )
}
