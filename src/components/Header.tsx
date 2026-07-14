import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getPublicBootstrap } from '@/api/client'
import type { NavItem } from '@/types'
import { InlineMarkup } from './MarkupParser'

export default function Header() {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [siteConfig, setSiteConfig] = useState<any>({})
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    getPublicBootstrap().then((response) => {
      setNavItems(response.data.navigation || [])
      setSiteConfig(response.data.site_config || {})
    })
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileOpen])

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const handleMobileNavigation = (event: MouseEvent<HTMLAnchorElement>, link: string) => {
    event.preventDefault()
    setMobileOpen(false)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (location.pathname === link) {
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    } else {
      navigate(link, { state: { smoothScroll: !reduceMotion } })
    }
  }

  return (
    <header className={`fixed left-0 top-0 z-50 h-[60px] w-screen px-6 transition-colors duration-300 ${scrolled ? 'border-b border-white/15 bg-[#041F38]' : 'border-b border-transparent bg-transparent'}`}>
      <div className="mx-auto flex h-full w-full max-w-[1760px] items-center px-0 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center" aria-label="港翼科技首页">
          {siteConfig.logo_url ? <img src={siteConfig.logo_url} alt="GONYIK" className="mr-2 h-7 w-auto" /> : <span className="mr-2 grid h-7 w-7 place-items-center bg-white text-[10px] font-semibold text-[#041F38]">GY</span>}
          <span className="text-[15px] font-semibold text-white"><InlineMarkup text={siteConfig.logo_text || '港翼科技'} /></span>
        </Link>

        <nav className="ml-auto hidden h-full items-center gap-8 md:flex" aria-label="主导航">
          {navItems.map((item) => {
            const active = location.pathname === item.link || (item.link !== '/' && location.pathname.startsWith(`${item.link}/`))
            return <Link key={item.id} to={item.link} className={`group/nav relative flex h-full items-center text-[13px] font-medium tracking-[0.06em] transition-colors duration-[var(--motion-instant)] ${active ? 'text-white' : 'text-white/75 hover:text-white'}`}><InlineMarkup text={item.label} /><span className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[#69B2C1] transition-transform duration-[var(--motion-instant)] ease-apple ${active ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100'}`} /></Link>
          })}
        </nav>

        <button type="button" aria-label="打开导航" aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="ml-auto flex h-11 w-11 items-center justify-center text-white md:hidden" onClick={() => setMobileOpen(true)}><Menu size={25} /></button>
      </div>

      <div aria-hidden={!mobileOpen} className={`fixed inset-0 z-[60] md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button type="button" tabIndex={mobileOpen ? 0 : -1} aria-label="关闭导航" onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-[#041F38]/55 transition-opacity duration-[var(--motion-switch)] ease-apple ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="主导航" className={`absolute inset-y-0 right-0 w-[min(86vw,360px)] bg-[#041F38] px-6 shadow-[-18px_0_50px_rgba(4,31,56,0.2)] transition-transform duration-[320ms] ease-apple ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-[60px] items-center justify-between border-b border-white/15">
            <span className="label-en text-white/75">MENU</span>
            <button type="button" tabIndex={mobileOpen ? 0 : -1} aria-label="关闭导航" className="flex h-11 w-11 items-center justify-center text-white" onClick={() => setMobileOpen(false)}><X size={24} /></button>
          </div>
          <nav className="flex flex-col pt-5" aria-label="移动端主导航">
            {navItems.map((item, index) => {
              const active = location.pathname === item.link || (item.link !== '/' && location.pathname.startsWith(`${item.link}/`))
              return <Link key={item.id} to={item.link} tabIndex={mobileOpen ? 0 : -1} onClick={(event) => handleMobileNavigation(event, item.link)} style={{ transitionDelay: mobileOpen ? `${80 + index * 35}ms` : '0ms' } as CSSProperties} className={`flex items-center justify-between border-b border-white/10 py-5 text-[18px] font-medium tracking-[0.04em] transition-[opacity,transform,color] duration-[var(--motion-switch)] ease-apple ${mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'} ${active ? 'text-white' : 'text-white/75'}`}><span><InlineMarkup text={item.label} /></span>{active && <span aria-hidden="true" className="h-px w-6 bg-[#69B2C1]" />}</Link>
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
