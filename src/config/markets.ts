export const SITE_LOCALES = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'] as const

export type SiteLocale = typeof SITE_LOCALES[number]
export type MarketVisibility = 'inherit' | 'public' | 'hidden'

export interface SiteMarket {
  code: string
  label: string
  locale: SiteLocale
  enabled: boolean
  is_default?: boolean
  default_visibility: Exclude<MarketVisibility, 'inherit'>
  order_index: number
}

export const DEFAULT_SITE_MARKETS: SiteMarket[] = [
  {
    code: 'cn',
    label: '中国大陆',
    locale: 'zh-CN',
    enabled: true,
    is_default: true,
    default_visibility: 'public',
    order_index: 0,
  },
  {
    code: 'global',
    label: 'Global',
    locale: 'en',
    enabled: true,
    default_visibility: 'public',
    order_index: 1,
  },
]

const UNPREFIXED_PUBLIC_ROOTS = new Set([
  '', 'fabrics', 'equipment', 'pfas-free-innovation', 'fluorine-free', 'services', 'privacy-policy', 'contact', 'admin', 'api',
])

function firstPathSegment(pathname: string) {
  return pathname.split(/[?#]/)[0].split('/').filter(Boolean)[0] || ''
}

export function stripMarketPrefix(pathname: string) {
  const segment = firstPathSegment(pathname)
  if ((segment === 'en' || !UNPREFIXED_PUBLIC_ROOTS.has(segment)) && segment) {
    const withoutPrefix = pathname.slice(segment.length + 1)
    return withoutPrefix || '/'
  }
  return pathname
}

export function marketCodeFromPath(pathname: string) {
  const segment = firstPathSegment(pathname)
  if (segment === 'en') return 'global'
  return segment && !UNPREFIXED_PUBLIC_ROOTS.has(segment) ? segment : 'cn'
}

export function marketPath(href: string, marketCode: string) {
  if (!href || /^(?:https?:|mailto:|tel:|#)/.test(href) || href.startsWith('/admin')) return href
  const [pathnameAndQuery, hash = ''] = href.split('#')
  const base = stripMarketPrefix(pathnameAndQuery)
  const localized = marketCode === 'cn' ? base : `/${marketCode}${base === '/' ? '' : base}`
  return `${localized}${hash ? `#${hash}` : ''}`
}
