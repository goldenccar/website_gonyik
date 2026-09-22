import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EquipmentProduct } from '@/types'
import { InlineMarkup } from './MarkupParser'
import FeatureIcon from './FeatureIcon'
import CarouselControls from './CarouselControls'
import { useSiteLocale } from '@/i18n/SiteLocale'

function ApplicationScenes({ product }: { product: EquipmentProduct }) {
  const { t } = useSiteLocale()
  const track = useRef<HTMLDivElement>(null)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const scenes = product.scene_images || []
  const loop = scenes.length > 4
  const step = () => {
    const el = track.current
    return el?.children[1] ? el.children[1].getBoundingClientRect().left - el.children[0].getBoundingClientRect().left : 0
  }
  const normalize = () => {
    const el = track.current
    const span = step() * scenes.length
    if (!el || !span || !loop) return
    if (el.scrollLeft < span - 1 || el.scrollLeft >= span * 2 - 1) {
      el.scrollTo({ left: span + ((el.scrollLeft % span) + span) % span, behavior: 'instant' })
    }
  }
  useEffect(() => {
    const el = track.current
    if (!el || !loop) return
    let previousStep = 0
    const resize = new ResizeObserver(() => {
      const nextStep = step()
      if (nextStep === previousStep) return
      const index = previousStep ? Math.round(el.scrollLeft / previousStep) % scenes.length : 0
      el.scrollTo({ left: (scenes.length + index) * nextStep, behavior: 'instant' })
      previousStep = nextStep
    })
    resize.observe(el)
    return () => { resize.disconnect(); clearTimeout(settle.current) }
  }, [scenes.length, loop])
  const move = (direction: number) => {
    clearTimeout(settle.current)
    normalize()
    track.current?.scrollBy({ left: direction * step(), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  if (!scenes.length) return null
  return <div className="application-scenes">
    {loop && <CarouselControls className="application-scene-controls" previousLabel={t('上一张场景图')} nextLabel={t('下一张场景图')} controls={`scenes-${product.id}`} onPrevious={() => move(-1)} onNext={() => move(1)} />}
    <div id={`scenes-${product.id}`} ref={track} className="application-scene-track" tabIndex={loop ? 0 : undefined} role="region" aria-label={t(product.name)}
      onScroll={() => { clearTimeout(settle.current); if (loop) settle.current = setTimeout(normalize, 160) }}
      onKeyDown={event => { if (loop && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) } }}>
      {(loop ? [0, 1, 2] : [1]).flatMap(copy => scenes.map((scene, index) => <img key={`${copy}-${index}`} src={scene.image} alt={copy === 1 ? t(scene.alt) : ''} aria-hidden={copy !== 1 || undefined} loading="lazy" decoding="async" width="960" height="640" draggable={false} />))}
    </div>
  </div>
}

export default function ApplicationCard({ product }: { product: EquipmentProduct }) {
  const { path, t } = useSiteLocale()
  let features: string[] = []
  try { const value = JSON.parse(product.features || '[]'); if (Array.isArray(value)) features = value.filter(item => typeof item === 'string' && item.trim()) } catch { /* Empty malformed legacy features, never synthesize claims. */ }
  return <section id={`application-${product.id}`} className={`application-story ${product.image ? '' : 'application-story-text'}`} aria-labelledby={`application-title-${product.id}`}>
    {product.image && <figure className="application-media">
      <img src={product.image} alt={t(product.image_alt || product.name)} style={{ objectFit: product.image_fit || 'cover', objectPosition: product.image_position || undefined }} loading="lazy" decoding="async" />
      {product.image_caption && <figcaption><InlineMarkup text={product.image_caption} /></figcaption>}
    </figure>}
    <div className="application-copy">
      {product.case_label && <p className="applications-kicker"><InlineMarkup text={product.case_label} /></p>}
      <h2 id={`application-title-${product.id}`} className="type-module-title"><InlineMarkup text={product.name} /></h2>
      {product.card_summary && <p className="application-description"><InlineMarkup text={product.card_summary} /></p>}
      {features.length > 0 && <div className="application-features">
        {product.features_label && <p className="application-label"><InlineMarkup text={product.features_label} /></p>}
        <ul>{features.map((feature, i) => <li key={i}><FeatureIcon name={product.feature_icons?.[i]} /><InlineMarkup text={feature} /></li>)}</ul>
      </div>}
      {(product.detail_title || product.detail_body) && <div className="application-detail">
        {product.detail_title && <h3><InlineMarkup text={product.detail_title} /></h3>}
        {product.detail_body && <p><InlineMarkup text={product.detail_body} /></p>}
      </div>}
      {Boolean(product.related_series?.length) && <div className="application-series">
        {product.series_label && <p className="application-label"><InlineMarkup text={product.series_label} /></p>}
        <div>{product.related_series!.map(series => <Link key={series.id} to={path(`/fabrics#series-${series.slug}`)}><span>{series.name.toUpperCase()}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div>
      </div>}
      <div className="application-actions">
        {product.cta_label && product.cta_href && <Link className="applications-button" to={path(product.cta_href)}><InlineMarkup text={product.cta_label} /><ArrowUpRight size={18} aria-hidden="true" /></Link>}
      </div>
    </div>
    <ApplicationScenes product={product} />
  </section>
}
