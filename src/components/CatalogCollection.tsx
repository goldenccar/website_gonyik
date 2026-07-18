import type { ReactNode } from 'react'

export default function CatalogCollection({ children, label }: {
  children: ReactNode
  label: string
}) {
  return (
    <div aria-label={label} className="grid items-stretch gap-5 md:grid-cols-2 md:gap-6">
      {children}
    </div>
  )
}
