import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface AdminHeaderProps {
  title: string
  backPath?: string | null
  action?: ReactNode
}

export default function AdminHeader({ title, backPath = '/admin/home', action }: AdminHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {backPath && (
          <button onClick={() => navigate(backPath)} className="text-accent hover:text-white" aria-label="返回">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-h3 text-white">{title}</h1>
      </div>
      {action}
    </div>
  )
}
