import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Home, Layers, Mountain, Shirt, HelpCircle, Newspaper, Image, Palette, LogOut } from 'lucide-react'

const MENU = [
  { label: '概览', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: '品牌设置', icon: Palette, path: '/admin/brand' },
  { label: '首页管理', icon: Home, path: '/admin/home' },
  { label: '面料系列管理', icon: Layers, path: '/admin/fabrics' },
  { label: '测试报告管理', icon: Mountain, path: '/admin/reports' },
  { label: '终端装备管理', icon: Shirt, path: '/admin/equipment' },
  { label: '服务与支持管理', icon: HelpCircle, path: '/admin/services' },
  { label: '新闻管理', icon: Newspaper, path: '/admin/news' },
  { label: '多媒体资源库', icon: Image, path: '/admin/media' },
]

interface DashboardProps {
  children?: React.ReactNode
}

export default function AdminDashboard({ children }: DashboardProps = {}) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('Admin')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-darker flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-dark flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-white text-[16px] font-bold">港翼科技 CMS</h2>
        </div>
        <nav className="flex-1 py-4">
          {MENU.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-6 py-3 text-[13px] text-accent hover:text-white hover:bg-white/5 transition-colors"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-accent">{username}</span>
            <button onClick={handleLogout} className="text-accent hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10 overflow-auto">
        {children || (
          <>
            <h1 className="text-h2 text-white mb-8">概览</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MENU.slice(1).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="bg-dark p-8 hover:bg-white/5 transition-colors group"
                  >
                    <Icon size={32} className="text-accent mb-4 group-hover:text-white transition-colors" />
                    <h3 className="text-white text-[16px] font-medium">{item.label}</h3>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
