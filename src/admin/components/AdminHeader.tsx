import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface AdminHeaderProps {
  title: string
  backPath?: string
  action?: ReactNode
}

export default function AdminHeader({ title, backPath = '/admin/dashboard', action }: AdminHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(backPath)} className="text-accent hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-h3 text-white">{title}</h1>
      </div>
      {action}
    </div>
  )
}
