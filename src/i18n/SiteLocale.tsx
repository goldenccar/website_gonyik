import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getPublicBootstrap } from '@/api/client'
import { DEFAULT_SITE_MARKETS, marketCodeFromPath, marketPath, type SiteLocale, type SiteMarket } from '@/config/markets'
import type { FabricSeries, FooterConfig, HomeConfig, NavItem, SocialMedia } from '@/types'

export type { SiteLocale } from '@/config/markets'


interface SiteLocaleContextValue {
  locale: SiteLocale
  market: SiteMarket
  markets: SiteMarket[]
  t: (text?: string | null) => string
  path: (href: string) => string
  bootstrap: PublicBootstrap
}

export interface PublicBootstrap {
  site_config: Record<string, any>
  navigation: NavItem[]
  home_config: HomeConfig
  series: FabricSeries[]
  footer_config: FooterConfig
  contact_config: { email?: string; phone?: string; address?: string; response_text?: string }
  socials: SocialMedia[]
  translations: Record<string, string>
  markets: SiteMarket[]
  current_market: string
  current_locale: SiteLocale
}

const EMPTY_BOOTSTRAP = {} as PublicBootstrap

const SiteLocaleContext = createContext<SiteLocaleContextValue>({
  locale: 'zh-CN',
  market: DEFAULT_SITE_MARKETS[0],
  markets: DEFAULT_SITE_MARKETS,
  t: (text) => text || '',
  path: (href) => href,
  bootstrap: EMPTY_BOOTSTRAP,
})

export function SiteLocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const routeMarketCode = marketCodeFromPath(location.pathname)
  const [bootstrap, setBootstrap] = useState<PublicBootstrap | null>(null)
  const [loadVersion, setLoadVersion] = useState(0)
  const [failed, setFailed] = useState(false)
  const initialVisit = useRef(true)
  const [detectedMarket, setDetectedMarket] = useState<{ from: string; code: string } | null>(null)
  const markets = bootstrap?.markets?.length ? bootstrap.markets : DEFAULT_SITE_MARKETS
  const market = markets.find((item) => item.code === routeMarketCode && item.enabled)
    || markets.find((item) => item.enabled && item.is_default)
    || DEFAULT_SITE_MARKETS[0]
  const locale = market.locale
  useEffect(() => {
    let cancelled = false
    setFailed(false)
    const detect = initialVisit.current && routeMarketCode === 'cn'
    getPublicBootstrap(detect)
      .then((response) => {
        if (cancelled) return
        const data = response.data as PublicBootstrap
        initialVisit.current = false
        setDetectedMarket(detect && data.current_market !== routeMarketCode ? { from: location.key, code: data.current_market } : null)
        const configured: SiteMarket[] = Array.isArray(data.markets) && data.markets.length
          ? data.markets
          : DEFAULT_SITE_MARKETS
        setBootstrap({ ...data, markets: configured, translations: data.translations || {} })
      })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [routeMarketCode, loadVersion])

  const bootstrapMatchesRoute = bootstrap?.current_market === routeMarketCode
  const cmsCopy = bootstrapMatchesRoute ? bootstrap.translations : {}

  useEffect(() => {
    if (!bootstrapMatchesRoute) return
    document.documentElement.lang = locale
    document.title = bootstrap.translations?.['港翼科技 GONYIK'] || '港翼科技 GONYIK'
    const favicon = bootstrap.site_config?.favicon_url
    if (!favicon) return
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = favicon
  }, [bootstrap, bootstrapMatchesRoute, locale])

  const value = useMemo<SiteLocaleContextValue>(() => ({
    locale,
    market,
    markets,
    t(text) {
      if (!text) return ''
      if (locale === 'zh-CN') return text
      return cmsCopy[text.trim()] || text
    },
    path(href) {
      return marketPath(href, market.code)
    },
    bootstrap: bootstrap!,
  }), [bootstrap, cmsCopy, locale, market, markets])

  if (detectedMarket?.from === location.key && detectedMarket.code !== routeMarketCode) {
    return <Navigate to={marketPath(`${location.pathname}${location.search}${location.hash}`, detectedMarket.code)} replace />
  }

  if (bootstrap) {
    const requestedMarket = markets.find((item) => item.code === routeMarketCode)
    if (!requestedMarket) return <UnknownMarketPage />
    if (!requestedMarket.enabled) {
      const defaultMarket = markets.find((item) => item.enabled && item.is_default) || DEFAULT_SITE_MARKETS[0]
      return <Navigate to={marketPath(`${location.pathname}${location.search}${location.hash}`, defaultMarket.code)} replace />
    }
  }

  if (!bootstrapMatchesRoute) {
    return <PublicBootstrapGate failed={failed} onRetry={() => setLoadVersion((value) => value + 1)} />
  }

  return <SiteLocaleContext.Provider value={value}>{children}</SiteLocaleContext.Provider>
}

function UnknownMarketPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#041f38] px-7 text-white">
      <div className="max-w-[560px] border-l border-[#69b2c1] pl-6">
        <p className="text-[12px] font-semibold tracking-[0.14em] text-white/60">404</p>
        <h1 className="mt-3 text-[30px] font-medium tracking-[-0.02em]">页面不存在</h1>
        <p className="mt-4 text-[15px] leading-7 text-white/70">该地区站点或页面地址无效。</p>
        <a href="/" className="mt-7 inline-block border-b border-white/50 pb-1 text-[14px]">返回首页</a>
      </div>
    </main>
  )
}

function PublicBootstrapGate({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#041f38]" role={failed ? 'alert' : 'status'} aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <span className="grid h-9 w-9 place-items-center bg-white text-[11px] font-semibold tracking-[0.08em] text-[#041f38]">GY</span>
        {failed ? (
          <button type="button" onClick={onRetry} className="border border-white/35 px-5 py-2 text-[13px] text-white transition-colors hover:bg-white hover:text-[#041f38]">重新加载</button>
        ) : (
          <span className="h-px w-24 bg-white/15"><span className="block h-full w-full animate-pulse bg-[#69b2c1]" /></span>
        )}
      </div>
    </div>
  )
}

export function useSiteLocale() {
  return useContext(SiteLocaleContext)
}
