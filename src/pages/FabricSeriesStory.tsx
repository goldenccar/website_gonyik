import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ArrowUpRight, Droplets, Wind, Waves, CloudRain, CloudSun, ShieldCheck, Sun, Feather, Shield, Layers, Scissors } from 'lucide-react'
import { InlineMarkup } from '@/components/MarkupParser'
import { useSiteLocale } from '@/i18n/SiteLocale'
import '@/styles/fabric-series.css'

const FEATURE_ICONS = { droplets: Droplets, wind: Wind, waves: Waves, 'cloud-rain': CloudRain, 'cloud-sun': CloudSun, 'shield-check': ShieldCheck, sun: Sun, feather: Feather, shield: Shield, layers: Layers, scissors: Scissors }

export default function FabricSeriesStory() {
  const { bootstrap, path, t } = useSiteLocale()
  const { seriesSlug } = useParams()
  const location = useLocation()
  const sections = useRef<Record<string, HTMLElement | null>>({})
  const series = useMemo(() => [...bootstrap.series].sort((a, b) => a.order_index - b.order_index), [bootstrap.series])
  const [active, setActive] = useState('')
  const params = new URLSearchParams(location.search)
  // Preserve existing model links while /fabrics becomes the series entrance.
  const catalogRequest = params.has('series') || params.has('sku')

  useEffect(() => {
    if (seriesSlug || catalogRequest) return
    const slug = series.find(item => location.hash === `#series-${item.slug}`)?.slug
    if (!slug) return
    const frame = requestAnimationFrame(() => sections.current[slug]?.scrollIntoView({ block: 'start', behavior: 'instant' }))
    return () => cancelAnimationFrame(frame)
  }, [location.hash, series, seriesSlug, catalogRequest])

  useEffect(() => {
    if (seriesSlug || catalogRequest) return
    let frame = 0
    const update = () => {
      frame = 0
      const midpoint = 112 + (window.innerHeight - 112) / 2
      const current = series.find(item => {
        const rect = sections.current[item.slug]?.getBoundingClientRect()
        return rect && rect.top <= midpoint && rect.bottom > midpoint
      })
      if (current) setActive(current.slug)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [series, seriesSlug, catalogRequest])

  if (seriesSlug) return <Navigate replace to={path(`/fabrics${series.some(item => item.slug === seriesSlug) ? `#series-${seriesSlug}` : ''}`)} />
  if (catalogRequest) return <Navigate replace to={path(`/fabrics/catalog${location.search}${location.hash}`)} />

  return <div className="fabric-platforms">
    <h1 className="sr-only">{t('面料系列')}</h1>
    <nav className="fabric-platforms-nav" aria-label={t('面料系列')}>
      <div className="fabric-platforms-nav-inner">
        <div className="fabric-platforms-nav-links">
          {series.map(item => <a key={item.id} href={`#series-${item.slug}`} aria-current={(active || series[0]?.slug) === item.slug ? 'location' : undefined}>
            {item.name.toUpperCase()}
          </a>)}
        </div>
      </div>
    </nav>
    {series.map((item, index) => <section
      key={item.id} id={`series-${item.slug}`} data-series={item.slug}
      className={`fabric-platform-screen fabric-platform-screen--${item.slug}`}
      aria-labelledby={`fabric-title-${item.id}`} ref={node => { sections.current[item.slug] = node }}
    >
      {item.home_image && <img className="fabric-platform-image" src={item.home_image} alt="" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} />}
      <div className="fabric-platform-shade" />
      <div className="fabric-platform-inner">
        <div className="fabric-platform-content">
        <div className="fabric-platform-copy">
          <div>
          <h2 id={`fabric-title-${item.id}`} className="fabric-platform-name">{item.name.toUpperCase()}</h2>
          {item.story_title && <p className="fabric-platform-position"><InlineMarkup text={item.story_title} /></p>}
          </div>
          {item.story_intro && <p className="fabric-platform-description"><InlineMarkup text={item.story_intro} /></p>}
          <div className="fabric-platform-actions">
            {item.story_primary_label && item.story_primary_link && <Link className="fabric-platform-primary" to={path(item.story_primary_link)}><InlineMarkup text={item.story_primary_label} /><ArrowUpRight size={18} aria-hidden="true" /></Link>}
            {item.story_secondary_label && item.story_secondary_link && <Link className="fabric-platform-consult" to={path(item.story_secondary_link)}><InlineMarkup text={item.story_secondary_label} /><ArrowUpRight size={18} aria-hidden="true" /></Link>}
          </div>
        </div>
        {Boolean(item.story_highlights?.length) && <aside className="fabric-platform-features" aria-label={t(item.story_features_label || item.name)}>
          {item.story_features_label && <p className="fabric-platform-features-label"><InlineMarkup text={item.story_features_label} /></p>}
          <ul>{item.story_highlights!.map((feature, i) => {
            const Icon = FEATURE_ICONS[item.story_icons?.[i] as keyof typeof FEATURE_ICONS]
            return <li key={`${i}-${feature}`}>{Icon && <Icon size={32} strokeWidth={1.5} aria-hidden="true" />}<span><InlineMarkup text={feature} /></span></li>
          })}</ul>
        </aside>}
        </div>
      </div>
    </section>)}
  </div>
}
