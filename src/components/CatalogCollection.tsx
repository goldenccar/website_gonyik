import type { ReactNode } from 'react'

export default function CatalogCollection({ children, label, desktopColumns = 2 }: {
  children: ReactNode
  label: string
  desktopColumns?: 2 | 3
}) {
  return (
    <div aria-label={label} className={`grid items-stretch gap-5 md:grid-cols-2 md:gap-6 ${desktopColumns === 3 ? 'lg:grid-cols-3' : ''}`}>
      {children}
    </div>
  )
}
