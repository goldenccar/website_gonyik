import type { Request } from 'express'
import geoip from 'geoip-country'
import { LANGUAGE_COOKIE, type SiteMarket } from '../src/config/markets'

// Lookup stays on the server. No visitor IP is sent to an external service.
export function preferredLanguageMarket(req: Request, markets: SiteMarket[]) {
  const enabled = markets.filter(market => market.enabled)
  const saved = (req.get('cookie') || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(`${LANGUAGE_COOKIE}=`))?.slice(LANGUAGE_COOKIE.length + 1)
  const chosen = enabled.find(market => market.code === saved)
  if (chosen) return chosen

  // req.ip only trusts forwarded headers when the application's proxy setting is enabled.
  const country = geoip.lookup(req.ip || req.socket?.remoteAddress || '')?.country
  let locale = country === 'CN' ? 'zh-CN' : ['HK', 'MO', 'TW'].includes(country || '') ? 'zh-TW' : country ? 'en' : ''
  if (!locale) {
    for (const language of req.acceptsLanguages()) {
      if (/^zh-(?:TW|HK|MO|Hant)(?:-|$)/i.test(language)) { locale = 'zh-TW'; break }
      if (/^zh(?:-|$)/i.test(language)) { locale = 'zh-CN'; break }
      if (/^en(?:-|$)/i.test(language)) { locale = 'en'; break }
    }
  }
  return enabled.find(market => market.locale === locale)
    || enabled.find(market => market.is_default) || enabled[0]
}
