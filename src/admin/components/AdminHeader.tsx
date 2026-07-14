import type { ReactNode } from 'react'

interface AdminHeaderProps {
  title: string
  action?: ReactNode
}

export default function AdminHeader({ title, action }: AdminHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <h1 className="min-w-0 text-[24px] font-bold leading-tight text-white sm:text-h3">{title}</h1>
      </div>
      {action && <div className="flex w-full items-center sm:w-auto sm:justify-end">{action}</div>}
    </div>
  )
}
