import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getFabricSeries, getFabricSeriesDetail, getPageConfig } from '@/api/client'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import { InlineMarkup } from '@/components/MarkupParser'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import RailEndCard from '@/components/RailEndCard'
import SkuCard from '@/components/SkuCard'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import type { FabricSeries, FabricSku, PageConfig } from '@/types'
import { useSiteLocale } from '@/i18n/SiteLocale'

const SERIES_ORDER = ['otter', 'rayo', 'kais'] as const
type SeriesSlug = typeof SERIES_ORDER[number]
type SeriesDetail = FabricSeries & { skus: FabricSku[]; capabilities?: FabricCapabilityDefinition[] }

function isSeriesSlug(value: string | null): value is SeriesSlug {
  return Boolean(value && SERIES_ORDER.includes(value as SeriesSlug))
}

export default function FabricDatabase() {
  const { path: localePath } = useSiteLocale()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [page, setPage] = useState<PageConfig | null>(null)
  const [series, setSeries] = useState<FabricSeries[]>([])
  const [details, setDetails] = useState<Partial<Record<SeriesSlug, SeriesDetail>>>({})
  const [detailLoading, setDetailLoading] = useState(true)
  const [active, setActive] = useState<SeriesSlug>(isSeriesSlug(params.get('series')) ? params.get('series') as SeriesSlug : 'otter')
  const [openSkuIds, setOpenSkuIds] = useState<Set<number>>(() => new Set())
  const seriesRefs = useRef<Partial<Record<SeriesSlug, HTMLElement | null>>>({})
  const handledRequestedSku = useRef('')
  const handledRequestedSeries = useRef('')
  const programmaticTarget = useRef<SeriesSlug | null>(null)

  useEffect(() => {
    let current = true
    setDetailLoading(true)
    Promise.all([
      getPageConfig('fabrics'),
      getFabricSeries(),
      ...SERIES_ORDER.map((slug) => getFabricSeriesDetail(slug)),
    ]).then(([config, list, ...responses]) => {
      if (!current) return
      setPage(config.data.data)
      setSeries(list.data.data || [])
      setDetails(Object.fromEntries(SERIES_ORDER.map((slug, index) => [slug, responses[index].data.data])) as Record<SeriesSlug, SeriesDetail>)
    }).finally(() => {
      if (current) setDetailLoading(false)
    })
    return () => { current = false }
  }, [])

  useEffect(() => {
    const requested = params.get('series')
    if (isSeriesSlug(requested)) setActive(requested)
  }, [params])

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
      const positions = SERIES_ORDER
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
  }, [detailLoading])

  const orderedSeries = useMemo(
    () => SERIES_ORDER.map((slug) => series.find((item) => item.slug === slug) || details[slug]).filter(Boolean) as FabricSeries[],
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
    setOpenSkuIds((currentIds) => {
      const next = new Set(currentIds)
      if (next.has(sku.id)) next.delete(sku.id)
      else next.add(sku.id)
      const remaining = [...next]
      setParams(remaining.length ? { series: slug, sku: String(remaining[remaining.length - 1]) } : { series: slug }, { replace: true })
      return next
    })
  }

  return (
    <PageShell>
      <PageHero title={page?.page_title || '按使用环境，找到合适的材料'} subtitle={page?.page_subtitle || '从日常与户外使用到特种专业场景，查看材料系列、具体型号与验证依据。'} image={page?.hero_background} imageAlt="复合面料与膜层结构微距" />

      <CatalogSelectorBar
        label="面料系列"
        groups={[
          {
            label: '日常与户外使用',
            uppercase: true,
            items: ['otter', 'rayo'].map((slug) => ({ key: slug, label: slug, active: active === slug, onSelect: () => selectSeries(slug as SeriesSlug) })),
          },
          {
            label: '特种场景',
            uppercase: true,
            items: [{ key: 'kais', label: 'kais', active: active === 'kais', onSelect: () => selectSeries('kais') }],
          },
        ]}
      />

      <PageSection id="series-content" className="!pt-8 md:!pt-12">
        {detailLoading && <div className="border-t border-border py-10 text-body text-secondary">正在加载面料资料…</div>}
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
                className={`fabric-series-section scroll-mt-[118px] ${index === 0 ? 'pb-16 md:pb-20' : 'py-16 md:py-20'}`}
              >
                <div className="mb-8 grid gap-4 md:mb-10 md:grid-cols-[minmax(220px,0.65fr)_minmax(320px,1fr)] md:items-end md:gap-12">
                  <div>
                    <p className="label-en -ml-px text-secondary"><InlineMarkup text={seriesItem.name || slug} /></p>
                    <h2 className="type-section-title mt-3 text-primary"><InlineMarkup text={seriesItem.tagline || '面向真实使用环境的功能材料'} /></h2>
                    <Link
                      to={localePath(`/fabrics/series/${slug}`)}
                      className="fabric-series-story-link group mt-5 inline-flex items-center pb-1 text-[13px] font-medium text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      aria-label={`探索 ${seriesItem.name} 系列`}
                    >
                      <span>探索 {seriesItem.name.toUpperCase()} 系列</span>
                      <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-[var(--motion-instant)] group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                  <p className="body-copy max-w-[680px] text-secondary"><InlineMarkup text={seriesItem.description} /></p>
                </div>

                {detail?.skus?.length ? (
                  <div role="list" aria-label={`${detail.name} 面料型号`} className="grid max-w-[1384px] items-start gap-5 md:grid-cols-2 md:gap-6">
                    {detail.skus.map((sku) => (
                      <div role="listitem" key={`${sku.series_id}-${sku.id}`} className="min-w-0">
                        <SkuCard
                          sku={sku}
                          seriesName={detail.name}
                          capabilities={detail.capabilities}
                          expanded={openSkuIds.has(sku.id)}
                          detailTitle={page?.core_performance_title || '核心性能'}
                          onClick={() => openSku(slug, sku)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-w-[520px]">
                    <RailEndCard config={page || {}} fallbackTitle="新面料开发" fallbackDescription="如有明确的使用环境与性能目标，欢迎提交材料需求。" />
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
