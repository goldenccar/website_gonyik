import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getNavigation, getSiteConfig } from '@/api/client'
import type { NavItem } from '@/types'

export default function Header() {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [siteConfig, setSiteConfig] = useState<any>({})
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    Promise.all([getNavigation(), getSiteConfig()]).then(([navigation, site]) => {
      setNavItems(navigation.data.data || [])
      setSiteConfig(site.data.data || {})
    })
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 h-[60px] px-6 transition-colors duration-300 ${scrolled ? 'border-b border-white/15 bg-[#041F38]' : 'border-b border-transparent bg-transparent'}`}>
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center px-0 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center" aria-label="港翼科技首页">
          {siteConfig.logo_url ? <img src={siteConfig.logo_url} alt="GONYIK" className="mr-2 h-7 w-auto" /> : <span className="mr-2 grid h-7 w-7 place-items-center bg-white text-[10px] font-bold text-[#041F38]">GY</span>}
          <span className="text-[15px] font-bold text-white">{siteConfig.logo_text || '港翼科技'}</span>
        </Link>

        <nav className="ml-auto hidden h-full items-center gap-8 md:flex" aria-label="主导航">
          {navItems.map((item) => {
            const active = location.pathname === item.link || (item.link !== '/' && location.pathname.startsWith(`${item.link}/`))
            return <Link key={item.id} to={item.link} className={`relative flex h-full items-center text-[12px] font-normal tracking-[0.06em] ${active ? 'text-white' : 'text-white/70 hover:text-white'}`}>{item.label}{active && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#69B2C1]" />}</Link>
          })}
        </nav>

        <button aria-label="打开导航" className="ml-auto text-white md:hidden" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
      </div>

      {mobileOpen && <div className="fixed inset-0 z-[60] bg-[#041F38] px-6"><div className="flex h-[60px] items-center justify-end"><button aria-label="关闭导航" className="text-white" onClick={() => setMobileOpen(false)}><X size={24} /></button></div><nav className="flex flex-col border-t border-white/15 pt-8">{navItems.map((item) => <Link key={item.id} to={item.link} className="border-b border-white/10 py-5 text-[20px] text-white">{item.label}</Link>)}</nav></div>}
    </header>
  )
}
