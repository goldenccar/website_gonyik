import { useEffect, useState } from 'react'
import { ChevronDown, LogOut, PanelLeft, PanelLeftClose, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ADMIN_MENU_GROUPS } from '../navigation'

interface AdminSidebarProps {
  pathname: string
  mobileOpen: boolean
  onClose: () => void
  onLogout: () => void
  username: string
}

export default function AdminSidebar({ pathname, mobileOpen, onClose, onLogout, username }: AdminSidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const currentGroup = ADMIN_MENU_GROUPS.find((group) => group.children.some((item) => item.path === pathname))
    if (currentGroup) setExpanded((previous) => new Set(previous).add(currentGroup.label))
  }, [pathname])

  const toggleGroup = (label: string) => {
    if (collapsed) {
      setCollapsed(false)
      setExpanded((previous) => new Set(previous).add(label))
      return
    }
    setExpanded((previous) => {
      const next = new Set(previous)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  return (
    <aside
      aria-label="后台导航"
      className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(86vw,300px)] flex-shrink-0 flex-col border-r border-white/10 bg-dark shadow-2xl transition-[transform,width] duration-300 md:relative md:z-auto md:translate-x-0 md:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}`}
    >
      <div className={`flex min-h-[68px] items-center border-b border-white/10 ${collapsed ? 'justify-between px-5 md:justify-center md:px-2' : 'justify-between px-5'}`}>
        <h2 className={`text-[16px] font-semibold text-white ${collapsed ? 'md:hidden' : ''}`}>港翼科技 CMS</h2>
        <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center text-white/60 hover:text-white md:hidden" aria-label="关闭导航"><X size={20} /></button>
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="hidden h-10 w-10 items-center justify-center text-white/55 transition-colors hover:bg-white/5 hover:text-white md:flex" title={collapsed ? '展开侧栏' : '收起侧栏'} aria-label={collapsed ? '展开侧栏' : '收起侧栏'}>{collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}</button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <div className="space-y-1">
          {ADMIN_MENU_GROUPS.map((group) => {
            const isSingle = group.children.length === 1
            const isExpanded = expanded.has(group.label)
            const hasActiveChild = group.children.some((item) => item.path === pathname)
            const GroupIcon = group.icon

            if (isSingle) {
              const item = group.children[0]
              return <Link key={item.path} to={item.path} onClick={onClose} title={collapsed ? item.label : undefined} className={`relative flex min-h-12 items-center gap-3 px-3 text-[14px] transition-colors ${collapsed ? 'md:justify-center md:px-0' : ''} ${pathname === item.path ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}><GroupIcon size={19} className="shrink-0" /><span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>{pathname === item.path && <span className="absolute inset-y-2 left-0 w-0.5 bg-accent" />}</Link>
            }

            return <div key={group.label}>
              <button type="button" onClick={() => toggleGroup(group.label)} title={collapsed ? group.label : undefined} aria-expanded={isExpanded} className={`flex min-h-12 w-full items-center gap-3 px-3 text-[14px] transition-colors ${collapsed ? 'md:justify-center md:px-0' : ''} ${hasActiveChild ? 'text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}>
                <GroupIcon size={19} className="shrink-0" />
                <span className={`min-w-0 flex-1 truncate text-left ${collapsed ? 'md:hidden' : ''}`}>{group.label}</span>
                <ChevronDown size={15} className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''} ${collapsed ? 'md:hidden' : ''}`} />
              </button>
              {isExpanded && <div className={collapsed ? 'md:hidden' : ''}>{group.children.map((item) => <Link key={item.path} to={item.path} onClick={onClose} className={`relative flex min-h-11 items-center pl-[46px] pr-3 text-[13px] transition-colors ${pathname === item.path ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>{item.label}{pathname === item.path && <span className="absolute inset-y-2 left-0 w-0.5 bg-accent" />}</Link>)}</div>}
            </div>
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={onLogout} title="退出登录" className={`flex min-h-11 w-full items-center gap-3 px-3 text-[13px] text-white/55 transition-colors hover:bg-white/5 hover:text-white ${collapsed ? 'md:justify-center md:px-0' : ''}`}><LogOut size={17} /><span className={collapsed ? 'md:hidden' : ''}>{username} · 退出</span></button>
      </div>
    </aside>
  )
}
