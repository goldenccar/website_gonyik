import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Globe2, Menu, X } from 'lucide-react'
import { useSiteLocale } from '@/i18n/SiteLocale'
import { marketPath, stripMarketPrefix } from '@/config/markets'
import type { NavItem } from '@/types'
import { InlineMarkup } from './MarkupParser'

interface MegaMenuLink {
  label: string
  href: string
}

interface MegaMenuGroup {
  title: string
  href?: string
  links: MegaMenuLink[]
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null)
  const [renderedDesktopMenu, setRenderedDesktopMenu] = useState<string | null>(null)
  const [desktopPanelVisible, setDesktopPanelVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const desktopMenuWasOpenRef = useRef(false)
  const desktopMegaPanelRef = useRef<HTMLDivElement>(null)
  const desktopMarketRef = useRef<HTMLDetailsElement>(null)
  const mobileMarketRef = useRef<HTMLDetailsElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { locale, market, markets, path: localePath, bootstrap } = useSiteLocale()
  const navItems: NavItem[] = bootstrap.navigation || []
  const siteConfig = bootstrap.site_config || {}
  const publicPath = stripMarketPrefix(location.pathname)
  const currentPublicLocation = `${publicPath}${location.search}${location.hash}`

  useEffect(() => {
    setMobileOpen(false)
    setMobileExpanded(null)
    setDesktopMenu(null)
    if (desktopMarketRef.current) desktopMarketRef.current.open = false
    if (mobileMarketRef.current) mobileMarketRef.current.open = false
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    const closeOpenHeaderPanels = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      const targetElement = target instanceof Element ? target : target.parentElement
      const clickedMegaTrigger = Boolean(targetElement?.closest('[data-mega-menu-trigger]'))
      const clickedMegaPanel = Boolean(desktopMegaPanelRef.current?.contains(target))

      if (!clickedMegaTrigger && !clickedMegaPanel) setDesktopMenu(null)
      if (desktopMarketRef.current?.open && !desktopMarketRef.current.contains(target)) desktopMarketRef.current.open = false
      if (mobileMarketRef.current?.open && !mobileMarketRef.current.contains(target)) mobileMarketRef.current.open = false
    }
    const closeOpenHeaderPanelsOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setDesktopMenu(null)
      if (desktopMarketRef.current) desktopMarketRef.current.open = false
      if (mobileMarketRef.current) mobileMarketRef.current.open = false
    }

    document.addEventListener('pointerdown', closeOpenHeaderPanels, true)
    window.addEventListener('keydown', closeOpenHeaderPanelsOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOpenHeaderPanels, true)
      window.removeEventListener('keydown', closeOpenHeaderPanelsOnEscape)
    }
  }, [])

  useEffect(() => {
    if (desktopMenu) {
      setRenderedDesktopMenu(desktopMenu)
      if (desktopMenuWasOpenRef.current) return
      desktopMenuWasOpenRef.current = true
      setDesktopPanelVisible(false)
      let secondFrame = 0
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setDesktopPanelVisible(true))
      })
      return () => {
        window.cancelAnimationFrame(firstFrame)
        if (secondFrame) window.cancelAnimationFrame(secondFrame)
      }
    }
    desktopMenuWasOpenRef.current = false
    setDesktopPanelVisible(false)
    const timer = window.setTimeout(() => setRenderedDesktopMenu(null), 380)
    return () => window.clearTimeout(timer)
  }, [desktopMenu])

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
    const target = localePath(link)
    if (location.pathname === target) {
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    } else {
      navigate(target, { state: { smoothScroll: !reduceMotion } })
    }
  }

  const megaMenus = useMemo<Record<string, MegaMenuGroup[]>>(() => {
    return Object.fromEntries(navItems.map((item) => [
      item.link,
      [...(item.mega_menu || [])]
        .sort((a, b) => a.order_index - b.order_index)
        .map((group) => ({
          title: group.title,
          href: group.link,
          links: [...group.items]
            .sort((a, b) => a.order_index - b.order_index)
            .map((link) => ({ label: link.label, href: link.link })),
        }))
        .filter((group) => group.title && (group.href || group.links.length)),
    ]))
  }, [navItems])

  const activeMenuItem = navItems.find((item) => item.link === renderedDesktopMenu)
  const activeMenuGroups = renderedDesktopMenu ? megaMenus[renderedDesktopMenu] || [] : []
  const menuOpen = Boolean(desktopPanelVisible && desktopMenu && activeMenuItem && activeMenuGroups.length)
  const menuMounted = Boolean(activeMenuItem && activeMenuGroups.length)
  const menuWidthClass = activeMenuGroups.length >= 4
    ? 'max-w-[920px]'
    : activeMenuGroups.length === 3
      ? 'max-w-[760px]'
      : activeMenuGroups.length === 2
        ? 'max-w-[560px]'
        : 'max-w-[360px]'
  const menuGridClass = activeMenuGroups.length >= 4
    ? 'grid-cols-4'
    : activeMenuGroups.length === 3
      ? 'grid-cols-3'
      : activeMenuGroups.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-1'

  return (
    <header className={`fixed left-0 top-0 z-50 h-[60px] w-screen px-6 transition-colors duration-300 ${menuMounted || scrolled ? 'border-b border-white/15 bg-[#041F38]' : 'border-b border-transparent bg-transparent'}`}>
      <div className="mx-auto flex h-full w-full max-w-[1760px] items-center px-0 lg:px-10">
        <Link to={localePath('/')} className="flex shrink-0 items-center" aria-label={locale === 'en' ? 'GONYIK home' : '港翼科技首页'}>
          {siteConfig.logo_url ? <img src={siteConfig.logo_url} alt="GONYIK" className="mr-2 h-7 w-auto" /> : <span className="mr-2 grid h-7 w-7 place-items-center bg-white text-[10px] font-semibold text-[#041F38]">GY</span>}
          <span className="text-[15px] font-semibold text-white"><InlineMarkup text={siteConfig.logo_text || '港翼科技'} /></span>
        </Link>

        <nav className="ml-auto hidden h-full items-center gap-8 md:flex" aria-label="主导航">
          {navItems.map((item) => {
            const active = publicPath === item.link || (item.link !== '/' && publicPath.startsWith(`${item.link}/`))
            const groups = megaMenus[item.link] || []
            const expanded = desktopMenu === item.link
            const commonClass = `group/nav relative -mx-3 flex h-full items-center gap-1.5 px-3 text-[13px] font-medium tracking-[0.05em] transition-colors duration-[var(--motion-instant)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-[#69B2C1] ${
              menuOpen
                ? expanded ? 'bg-white/10 text-white' : active ? 'text-white' : 'text-white/65 hover:text-white'
                : active ? 'text-white' : 'text-white/75 hover:text-white'
            }`
            if (groups.length > 0) {
              return <button
                key={item.id}
                type="button"
                data-mega-menu-trigger
                aria-current={active ? 'page' : undefined}
                aria-expanded={expanded}
                aria-controls={`mega-menu-${item.id}`}
                onClick={() => setDesktopMenu(expanded ? null : item.link)}
                className={commonClass}
              >
                <InlineMarkup text={item.label} />
                <span className={`absolute inset-x-0 bottom-0 h-[3px] bg-[#69B2C1] transition-opacity duration-[var(--motion-instant)] ${active ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            }
            return <Link key={item.id} to={localePath(item.link)} aria-current={active ? 'page' : undefined} className={commonClass}><InlineMarkup text={item.label} /><span className={`absolute inset-x-0 bottom-0 h-[3px] bg-[#69B2C1] transition-opacity duration-[var(--motion-instant)] ${active ? 'opacity-100' : 'opacity-0'}`} /></Link>
          })}
        </nav>

        <details ref={desktopMarketRef} className="group/market relative ml-5 hidden border-l border-white/20 pl-5 md:block">
          <summary className="flex h-9 cursor-pointer list-none items-center gap-2 text-[11px] font-medium tracking-[0.04em] text-white/75 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
            <Globe2 size={15} strokeWidth={1.6} className="text-white/55" aria-hidden="true" />
            <span>{market.label}</span>
            <ChevronDown size={13} className="text-white/45 transition-transform duration-200 group-open/market:rotate-180" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-[43px] min-w-44 border border-border bg-[#fbfcfd] py-1.5 shadow-[0_16px_36px_rgba(4,31,56,0.16)]">
            {markets.filter((item) => item.enabled).map((item) => <Link key={item.code} to={marketPath(currentPublicLocation, item.code)} aria-current={item.code === market.code ? 'page' : undefined} className={`flex min-h-10 items-center justify-between gap-5 px-4 text-[12px] transition-colors ${item.code === market.code ? 'bg-[#e9f3f5] font-semibold text-primary' : 'text-secondary hover:bg-[#f0f5f6] hover:text-primary'}`}><span>{item.label}</span><span className="text-[10px] uppercase tracking-[0.08em] opacity-55">{item.locale}</span></Link>)}
          </div>
        </details>
        <details ref={mobileMarketRef} className="group/mobile-market relative ml-auto md:hidden">
          <summary className="flex h-11 cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium text-white/75 [&::-webkit-details-marker]:hidden">
            <Globe2 size={17} strokeWidth={1.6} className="text-white/55" aria-hidden="true" />
            <span>{market.label}</span>
          </summary>
          <div className="absolute right-0 top-11 min-w-40 border border-border bg-[#fbfcfd] py-1.5 shadow-[0_16px_36px_rgba(4,31,56,0.16)]">
            {markets.filter((item) => item.enabled).map((item) => <Link key={item.code} to={marketPath(currentPublicLocation, item.code)} className={`block min-h-10 px-4 py-3 text-[12px] ${item.code === market.code ? 'bg-[#e9f3f5] font-semibold text-primary' : 'text-secondary'}`}>{item.label}</Link>)}
          </div>
        </details>
        <button type="button" aria-label={locale === 'en' ? 'Open navigation' : '打开导航'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="ml-1 flex h-11 w-11 items-center justify-center text-white md:hidden" onClick={() => setMobileOpen(true)}><Menu size={25} /></button>
      </div>

      {menuMounted && activeMenuItem && <>
        <button
          type="button"
          aria-label="关闭下拉导航"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setDesktopMenu(null)}
          className={`fixed inset-x-0 bottom-0 top-[60px] z-40 hidden cursor-default bg-[#041f38]/12 transition-opacity duration-[300ms] ease-apple motion-reduce:transition-none md:block ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        />
        <section
          id={`mega-menu-${activeMenuItem.id}`}
          aria-label={`${activeMenuItem.label}下拉导航`}
          aria-hidden={!menuOpen}
          className={`fixed inset-x-0 top-[60px] z-50 hidden px-6 md:block ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div className="mx-auto flex w-full max-w-[1760px] justify-end px-0 lg:px-10">
          <div ref={desktopMegaPanelRef} className={`w-full ${menuWidthClass} origin-top overflow-hidden border-b border-border bg-[#fbfcfd] shadow-[0_22px_52px_rgba(4,31,56,0.13)] transition-[clip-path] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${menuOpen ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(0_0_100%_0)]'}`}>
            <div className={`transition-[opacity,transform] ease-out motion-reduce:transition-none ${menuOpen ? 'translate-y-0 opacity-100 delay-[90ms] duration-[420ms]' : '-translate-y-1 opacity-0 delay-0 duration-[120ms]'}`}>
            <div className="px-6 pb-3 pt-3 lg:px-7">
              <div className="mb-3 flex min-h-8 items-start justify-end border-b border-border pb-2">
                <Link to={localePath(activeMenuItem.link)} onClick={() => setDesktopMenu(null)} className="shrink-0 text-[13px] font-semibold leading-6 tracking-[0.02em] text-primary transition-colors duration-[var(--motion-instant)] hover:text-[#2f8191] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#69B2C1]">{locale === 'en' ? 'View all ' : '查看全部'}<InlineMarkup text={activeMenuItem.label} /> →</Link>
              </div>
              <div className={`grid gap-x-8 gap-y-5 ${menuGridClass}`}>
                {activeMenuGroups.map((group) => (
                  <div key={group.title}>
                    <div className="mb-1.5 border-b border-border pb-2 text-[12px] font-medium leading-[18px] tracking-[0.06em] text-secondary">
                      {group.href
                        ? <Link to={localePath(group.href)} onClick={() => setDesktopMenu(null)} className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#2f8191] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#69B2C1]"><InlineMarkup text={group.title} /><span aria-hidden="true">→</span></Link>
                        : <InlineMarkup text={group.title} />}
                    </div>
                    <div>
                      {group.links.map((link) => (
                        <Link key={link.href} to={localePath(link.href)} onClick={() => setDesktopMenu(null)} className="group/link relative flex min-h-9 items-center text-[14px] font-medium leading-5 tracking-[0.01em] text-primary transition-colors duration-200 ease-out hover:text-[#2f8191] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-[#69B2C1]">
                          <InlineMarkup text={link.label} />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              aria-label={`收起${activeMenuItem.label}导航`}
              onClick={() => setDesktopMenu(null)}
              className="mx-auto flex h-10 w-14 items-center justify-center text-secondary transition-colors duration-[var(--motion-instant)] hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-[#69B2C1]"
            >
              <ChevronUp aria-hidden="true" size={17} strokeWidth={1.5} />
            </button>
            </div>
          </div>
          </div>
        </section>
      </>}

      <div aria-hidden={!mobileOpen} className={`fixed inset-0 z-[60] md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button type="button" tabIndex={mobileOpen ? 0 : -1} aria-label="关闭导航" onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-[#041F38]/55 transition-opacity duration-[var(--motion-switch)] ease-apple ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="主导航" className={`absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col bg-[#041F38] px-6 shadow-[-18px_0_50px_rgba(4,31,56,0.2)] transition-transform duration-[320ms] ease-apple ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-[60px] items-center justify-between border-b border-white/15">
            <span className="label-en text-white/75">MENU</span>
            <button type="button" tabIndex={mobileOpen ? 0 : -1} aria-label="关闭导航" className="flex h-11 w-11 items-center justify-center text-white" onClick={() => setMobileOpen(false)}><X size={24} /></button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-8 pt-5" aria-label="移动端主导航">
            {navItems.map((item, index) => {
            const active = publicPath === item.link || (item.link !== '/' && publicPath.startsWith(`${item.link}/`))
              const groups = megaMenus[item.link] || []
              const expanded = mobileExpanded === item.link
              return <div key={item.id} style={{ transitionDelay: mobileOpen ? `${80 + index * 35}ms` : '0ms' } as CSSProperties} className={`border-b border-white/10 transition-[opacity,transform] duration-[var(--motion-switch)] ease-apple ${mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'}`}>
                <div className="flex items-center">
                  <Link to={localePath(item.link)} tabIndex={mobileOpen ? 0 : -1} onClick={(event) => handleMobileNavigation(event, item.link)} className={`flex min-h-16 flex-1 items-center text-[18px] font-medium tracking-[0.04em] ${active ? 'text-white' : 'text-white/75'}`}><InlineMarkup text={item.label} /></Link>
                  {groups.length > 0 ? <button type="button" tabIndex={mobileOpen ? 0 : -1} aria-label={`${expanded ? '收起' : '展开'}${item.label}`} aria-expanded={expanded} onClick={() => setMobileExpanded(expanded ? null : item.link)} className="grid size-12 place-items-center text-white/75">
                    <ChevronDown aria-hidden="true" size={18} className={`transition-transform duration-[var(--motion-switch)] ${expanded ? 'rotate-180' : ''}`} />
                  </button> : active && <span aria-hidden="true" className="mr-3 h-px w-6 bg-[#69B2C1]" />}
                </div>
                <div className={`grid transition-[grid-template-rows] duration-[var(--motion-switch)] ease-apple ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="space-y-5 pb-5 pl-4">
                      {groups.map((group) => (
                        <div key={group.title}>
                          <div className="mb-2 text-[10px] font-medium tracking-[0.12em] text-white/45">
                            {group.href
                              ? <Link to={localePath(group.href)} tabIndex={mobileOpen && expanded ? 0 : -1} onClick={(event) => handleMobileNavigation(event, group.href || '/')} className="inline-flex items-center gap-1.5"><InlineMarkup text={group.title} /><span aria-hidden="true">→</span></Link>
                              : <InlineMarkup text={group.title} />}
                          </div>
                          <div className="flex flex-col">
                            {group.links.map((link) => <Link key={link.href} to={localePath(link.href)} tabIndex={mobileOpen && expanded ? 0 : -1} onClick={(event) => handleMobileNavigation(event, link.href)} className="py-2 text-[14px] text-white/75"><InlineMarkup text={link.label} /></Link>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
