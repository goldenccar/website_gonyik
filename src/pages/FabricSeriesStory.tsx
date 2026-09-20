import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import FeatureIcon from '@/components/FeatureIcon'
import { InlineMarkup } from '@/components/MarkupParser'
import { useSiteLocale } from '@/i18n/SiteLocale'
import '@/styles/fabric-series.css'


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
      const selectorEdge = 125
      const current = series.find(item => {
        const rect = sections.current[item.slug]?.getBoundingClientRect()
        return rect && rect.top <= selectorEdge && rect.bottom > selectorEdge
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

  return <div className="fabric-platforms" data-active-series={active || series[0]?.slug}>
    <h1 className="sr-only">{t('面料系列')}</h1>
    <CatalogSelectorBar label={t('面料系列')} groups={[{label:'',uppercase:true,items:series.map(item=>({key:item.id,label:item.name,active:(active || series[0]?.slug)===item.slug,href:path('/fabrics')+'#series-'+item.slug}))}]} />
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
            return <li key={`${i}-${feature}`}><FeatureIcon name={item.story_icons?.[i]} size={32} /><span><InlineMarkup text={feature} /></span></li>
          })}</ul>
        </aside>}
        </div>
      </div>
    </section>)}
  </div>
}
