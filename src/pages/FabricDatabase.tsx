import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getFabricCatalog } from '@/api/client'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import { InlineMarkup } from '@/components/MarkupParser'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import RailEndCard from '@/components/RailEndCard'
import SkuCard from '@/components/SkuCard'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import type { FabricSeries, FabricSku, PageConfig } from '@/types'
import { useSiteLocale } from '@/i18n/SiteLocale'
import PublicContentLoader from '@/components/PublicContentLoader'

type SeriesSlug = string
type SeriesDetail = FabricSeries & { skus: FabricSku[]; capabilities?: FabricCapabilityDefinition[] }

export default function FabricDatabase() {
  const { path: localePath, t } = useSiteLocale()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [page, setPage] = useState<PageConfig | null>(null)
  const [series, setSeries] = useState<FabricSeries[]>([])
  const [details, setDetails] = useState<Partial<Record<SeriesSlug, SeriesDetail>>>({})
  const [detailLoading, setDetailLoading] = useState(true)
  const [active, setActive] = useState<SeriesSlug>(params.get('series') || '')
  const [openSkuIds, setOpenSkuIds] = useState<Set<number>>(() => new Set())
  const seriesRefs = useRef<Partial<Record<SeriesSlug, HTMLElement | null>>>({})
  const handledRequestedSku = useRef('')
  const handledRequestedSeries = useRef('')
  const programmaticTarget = useRef<SeriesSlug | null>(null)

  useEffect(() => {
    let current = true
    setDetailLoading(true)
    getFabricCatalog().then((response) => {
      if (!current) return
      const catalog = response.data.data || {}
      const catalogSeries = (catalog.series || []) as SeriesDetail[]
      const capabilities = catalog.capabilities || []
      setPage(catalog.page || null)
      setSeries(catalogSeries)
      setDetails(Object.fromEntries(catalogSeries.map((item) => [item.slug, { ...item, capabilities }])) as Partial<Record<SeriesSlug, SeriesDetail>>)
    }).finally(() => {
      if (current) setDetailLoading(false)
    })
    return () => { current = false }
  }, [])

  const isSeriesSlug = (value: string | null): value is string => Boolean(value && series.some(item => item.slug === value))

  useEffect(() => {
    const requested = params.get('series')
    if (isSeriesSlug(requested)) setActive(requested)
  }, [params, series])

  useEffect(() => {
    if (detailLoading) return
    const requestedSeries = params.get('series')
    const requestedId = Number(params.get('sku'))
    const requestKey = `${requestedSeries}:${requestedId}`
    if (!isSeriesSlug(requestedSeries) || !requestedId || handledRequestedSku.current === requestKey) return
    const match = details[requestedSeries]?.skus?.find((sku) => sku.id === requestedId)
    if (!match) return
    handledRequestedSku.current = requestKey
    programmaticTarget.current = requestedSeries
    setActive(requestedSeries)
    setOpenSkuIds((currentIds) => new Set(currentIds).add(match.id))
    window.requestAnimationFrame(() => seriesRefs.current[requestedSeries]?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [detailLoading, details, params])

  useEffect(() => {
    if (detailLoading) return
    const requestedSeries = params.get('series')
    const expectedHash = requestedSeries ? `#series-${requestedSeries}` : ''
    if (!isSeriesSlug(requestedSeries) || location.hash !== expectedHash || handledRequestedSeries.current === expectedHash) return
    handledRequestedSeries.current = expectedHash
    programmaticTarget.current = requestedSeries
    setActive(requestedSeries)
    window.requestAnimationFrame(() => seriesRefs.current[requestedSeries]?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [detailLoading, location.hash, params])

  useEffect(() => {
    if (detailLoading) return
    let frame = 0
    const update = () => {
      frame = 0
      const anchor = 128
      const target = programmaticTarget.current
      if (target) {
        const targetTop = seriesRefs.current[target]?.getBoundingClientRect().top
        if (targetTop !== undefined && Math.abs(targetTop - anchor) < 18) programmaticTarget.current = null
        else {
          setActive(target)
          return
        }
      }
      const positions = series.map(item => item.slug)
        .map((slug) => ({ slug, top: seriesRefs.current[slug]?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY }))
        .filter((item) => Number.isFinite(item.top))
      const passed = positions.filter((item) => item.top <= anchor)
      const next = passed.length ? passed[passed.length - 1]?.slug : positions[0]?.slug
      if (next) setActive(next)
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [detailLoading, series])

  const orderedSeries = useMemo(
    () => [...series].sort((a, b) => a.order_index - b.order_index),
    [details, series],
  )

  const selectSeries = (slug: SeriesSlug) => {
    programmaticTarget.current = slug
    setActive(slug)
    setParams({ series: slug }, { replace: true })
    window.requestAnimationFrame(() => seriesRefs.current[slug]?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const openSku = (slug: SeriesSlug, sku: FabricSku) => {
    setActive(slug)
    const next = new Set(openSkuIds)
    if (next.has(sku.id)) next.delete(sku.id)
    else next.add(sku.id)
    setOpenSkuIds(next)
    // User flips keep their scroll position; only incoming SKU links scroll to a section.
    const requestedId = next.has(sku.id) ? sku.id : 0
    handledRequestedSku.current = `${slug}:${requestedId}`
    setParams(requestedId ? { series: slug, sku: String(requestedId) } : { series: slug }, { replace: true })
  }

  if (detailLoading) return <PublicContentLoader label="正在加载面料产品" />

  return (
    <PageShell className="fabric-catalog">
      <PageHero variant="editorial" title={page?.page_title || ''} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt={page?.page_title} />

      <CatalogSelectorBar label={page?.page_title || ''} groups={[{label:'',uppercase:true,items:series.map(item=>({key:item.id,label:item.name,active:active===item.slug,onSelect:()=>selectSeries(item.slug as SeriesSlug)}))}]} />

      <PageSection id="series-content" outerClassName="!px-0" className="!px-[clamp(24px,6.25vw,104px)] !pt-8 md:!pt-12">
        {detailLoading && <div className="border-t border-border py-10 text-body text-secondary">{t('正在加载面料资料…')}</div>}
        {!detailLoading && <div className="divide-y divide-border">
          {orderedSeries.map((seriesItem, index) => {
            const slug = seriesItem.slug as SeriesSlug
            const detail = details[slug]
            return (
              <section
                key={slug}
                ref={(node) => { seriesRefs.current[slug] = node }}
                data-series={slug}
                id={`series-${slug}`}
                className={`fabric-series-section scroll-mt-[124px] ${index === 0 ? 'pb-16 md:pb-20' : 'py-16 md:py-20'}`}
              >
                <div className="fabric-catalog-heading">
                  <div>
                    <h2 className="type-section-title text-primary"><InlineMarkup text={seriesItem.story_title || seriesItem.tagline} /></h2>
                    <p className="body-copy text-secondary"><InlineMarkup text={seriesItem.story_intro || seriesItem.description} /></p>
                  </div>
                    <Link
                      to={localePath(`/fabrics/series/${slug}`)}
                      className="fabric-series-story-link group"
                      aria-label={`${t('探索系列')} ${seriesItem.name}`}
                    >
                      <span>{t('探索系列')} {seriesItem.name.toUpperCase()}</span>
                      <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-[var(--motion-instant)] group-hover:translate-x-1">→</span>
                    </Link>
                </div>

                {detail?.skus?.length ? (
                  <div role="list" aria-label={`${detail.name} ${t('面料型号')}`} className="fabric-catalog-grid">
                    {detail.skus.map((sku) => (
                      <div role="listitem" key={`${sku.series_id}-${sku.id}`} className="min-w-0">
                        <SkuCard
                          sku={sku}
                          seriesName={detail.name}
                          capabilities={detail.capabilities}
                          expanded={openSkuIds.has(sku.id)}
                          detailTitle={page?.core_performance_title || '适用方向'}
                          onClick={() => openSku(slug, sku)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-w-[520px]">
                    <RailEndCard config={page || {}} />
                  </div>
                )}
              </section>
            )
          })}
        </div>}
      </PageSection>
    </PageShell>
  )
}
