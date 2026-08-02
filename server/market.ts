import type { Request } from 'express'
import { DEFAULT_SITE_MARKETS, type MarketVisibility, type SiteMarket } from '../src/config/markets'
import { db } from './db'

export function configuredMarkets(): SiteMarket[] {
  const markets = Array.isArray(db.markets) && db.markets.length ? db.markets : DEFAULT_SITE_MARKETS
  return [...markets].sort((a, b) => a.order_index - b.order_index)
}

export function requestMarket(req: Request): SiteMarket {
  const requested = String(req.query.market || req.get('x-gonyik-market') || '').trim().toLowerCase()
  const markets = configuredMarkets()
  return markets.find((market) => market.enabled && market.code === requested)
    || markets.find((market) => market.enabled && market.is_default)
    || markets.find((market) => market.enabled)
    || DEFAULT_SITE_MARKETS[0]
}

export function visibilityForMarket(
  item: { market_visibility?: Record<string, MarketVisibility> },
  market: SiteMarket,
) {
  const override = item.market_visibility?.[market.code]
  return !override || override === 'inherit' ? market.default_visibility : override
}

export function visibleInMarket(
  item: { market_visibility?: Record<string, MarketVisibility> },
  market: SiteMarket,
) {
  return visibilityForMarket(item, market) !== 'hidden'
}

const PAGE_LINKS: Record<string, string> = {
  '/fabrics': 'fabrics',
  '/equipment': 'equipment',
  '/pfas-free-innovation': 'pfas-free-innovation',
  '/services': 'services',
  '/contact': 'contact',
}

export function pageKeyForLink(link: string) {
  return Object.entries(PAGE_LINKS).find(([prefix]) => link === prefix || link.startsWith(`${prefix}/`))?.[1]
}

export function pageVisible(pageKey: string | undefined, market: SiteMarket) {
  if (!pageKey) return true
  const page = db.page_configs.find((item) => item.page_key === pageKey)
  return !page || visibleInMarket(page, market)
}
