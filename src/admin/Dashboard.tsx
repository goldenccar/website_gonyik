import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Home, Layers, Mountain, Shirt, HelpCircle, Newspaper, Image, Palette, LogOut, Dock, ChevronDown, Settings, FileText, Briefcase, MapPin, Download, Mail, Sun
} from 'lucide-react'

interface MenuItem {
  label: string
  icon: any
  path: string
}

interface MenuGroup {
  label: string
  icon?: any
  children: MenuItem[]
}

const MENU_GROUPS: MenuGroup[] = [
  {
    label: '概览',
    icon: LayoutDashboard,
    children: [{ label: '概览', icon: LayoutDashboard, path: '/admin/dashboard' }],
  },
  {
    label: '首页',
    icon: Home,
    children: [{ label: '首页管理', icon: Home, path: '/admin/home' }],
  },
  {
    label: '面料数据库',
    icon: Layers,
    children: [
      { label: '面料系列管理', icon: Layers, path: '/admin/fabrics' },
      { label: '场景管理', icon: MapPin, path: '/admin/scenes' },
      { label: '测试报告管理', icon: Mountain, path: '/admin/reports' },
    ],
  },
  {
    label: '终端装备',
    icon: Shirt,
    children: [
      { label: '终端装备管理', icon: Shirt, path: '/admin/equipment' },
      { label: '数字资产管理', icon: Download, path: '/admin/digital-assets' },
    ],
  },
  {
    label: 'RPO材料平台',
    icon: Sun,
    children: [{ label: 'RPO材料平台管理', icon: Sun, path: '/admin/fluorine' }],
  },
  {
    label: '服务与支持',
    icon: HelpCircle,
    children: [{ label: '服务与支持管理', icon: HelpCircle, path: '/admin/services' }],
  },
  {
    label: '联系我们',
    icon: Mail,
    children: [
      { label: '联系配置', icon: Mail, path: '/admin/contact-config' },
      { label: '咨询主题管理', icon: Mail, path: '/admin/inquiry-subjects' },
    ],
  },
  {
    label: '框架管理',
    icon: Settings,
    children: [
      { label: '品牌设置', icon: Palette, path: '/admin/brand' },
      { label: 'Header 管理', icon: Settings, path: '/admin/header' },
      { label: 'Footer 管理', icon: Dock, path: '/admin/footer' },
    ],
  },
  {
    label: '内容运营',
    icon: Newspaper,
    children: [{ label: '新闻管理', icon: Newspaper, path: '/admin/news' }],
  },
  {
    label: '资源库',
    icon: Image,
    children: [{ label: '多媒体资源库', icon: Image, path: '/admin/media' }],
  },
]

const ALL_ITEMS = MENU_GROUPS.flatMap((g) => g.children)

interface DashboardProps {
  children?: React.ReactNode
}

export default function AdminDashboard({ children }: DashboardProps = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('Admin')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin')
    }
  }, [navigate])

  // Auto-expand the group containing current path
  useEffect(() => {
    const currentPath = location.pathname
    const group = MENU_GROUPS.find((g) => g.children.some((c) => c.path === currentPath))
    if (group) {
      setExpanded((prev) => new Set(prev).add(group.label))
    }
  }, [location.pathname])

  const toggleGroup = (label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  return (
    <div className="h-screen bg-darker flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-dark flex-shrink-0 flex flex-col h-screen">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-white text-[16px] font-bold">港翼科技 CMS</h2>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {MENU_GROUPS.map((group) => {
            const GroupIcon = group.icon
            const isSingle = group.children.length === 1
            const isExpanded = expanded.has(group.label)
            const hasActiveChild = group.children.some((c) => isActive(c.path))

            if (isSingle) {
              const item = group.children[0]
              const ItemIcon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 text-[13px] transition-colors ${
                    isActive(item.path)
                      ? 'text-white bg-white/10'
                      : 'text-accent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ItemIcon size={18} />
                  {item.label}
                </Link>
              )
            }

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-6 py-3 text-[13px] transition-colors ${
                    hasActiveChild ? 'text-white' : 'text-accent hover:text-white'
                  } hover:bg-white/5`}
                >
                  <div className="flex items-center gap-3">
                    {GroupIcon && <GroupIcon size={18} />}
                    <span>{group.label}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {isExpanded && (
                  <div className="pb-1">
                    {group.children.map((item) => {
                      const ItemIcon = item.icon
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 pl-[52px] pr-6 py-2.5 text-[13px] transition-colors ${
                            isActive(item.path)
                              ? 'text-white bg-white/10'
                              : 'text-muted hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <ItemIcon size={16} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
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
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        {children || (
          <>
            <h1 className="text-h2 text-white mb-8">概览</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALL_ITEMS.slice(1).map((item) => {
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
