import type { ReactNode } from 'react'

export default function HorizontalRail({ children, label }: { children: ReactNode; label: string }) {
  return <div aria-label={label} className="gonyik-rail grid auto-cols-[82%] grid-flow-col gap-6 overflow-x-auto pb-9 sm:auto-cols-[46%] lg:auto-cols-[calc((100%-4.5rem)/3.85)]">{children}</div>
}
