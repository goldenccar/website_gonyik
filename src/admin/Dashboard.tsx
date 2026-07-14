import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from './components/AdminSidebar'
import { getAdminPageLabel } from './navigation'

interface DashboardProps {
  children?: React.ReactNode
}

export default function AdminDashboard({ children }: DashboardProps = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) navigate('/admin')
  }, [navigate])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileOpen])

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  return (
    <div className="admin-shell flex min-h-[100dvh] overflow-hidden bg-darker dark">
      {mobileOpen && <button type="button" aria-label="关闭导航" className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />}
      <AdminSidebar pathname={location.pathname} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={logout} username="Admin" />
      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-white/10 bg-dark/95 px-4 backdrop-blur md:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="-ml-2 flex h-11 w-11 items-center justify-center text-white" aria-label="打开导航"><Menu size={22} /></button>
          <span className="min-w-0 truncate text-[15px] font-medium text-white">{getAdminPageLabel(location.pathname)}</span>
        </header>
        <main className="h-[calc(100dvh-3.5rem)] min-w-0 flex-1 overflow-y-auto px-4 py-5 md:h-[100dvh] md:p-10">{children}</main>
      </div>
    </div>
  )
}
