import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getFabricSeries, getFabricSeriesDetail, getPageConfig } from '@/api/client'
import CatalogCollection from '@/components/CatalogCollection'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import SkuCard, { getSkuDisplayCode } from '@/components/SkuCard'
import type { FabricSeries, FabricSku, PageConfig } from '@/types'
import AnimatedDisclosure from '@/components/AnimatedDisclosure'
import { InlineMarkup } from '@/components/MarkupParser'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import { CatalogEndCta } from '@/components/CatalogCard'

function parseSpecs(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, string>
  if (typeof value !== 'string') return {}
  try { return JSON.parse(value) as Record<string, string> } catch { return {} }
}

export default function FabricDatabase() {
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState<PageConfig | null>(null)
  const [series, setSeries] = useState<FabricSeries[]>([])
  const [active, setActive] = useState(params.get('series') || 'otter')
  const [detail, setDetail] = useState<(FabricSeries & { skus: FabricSku[]; capabilities?: FabricCapabilityDefinition[] }) | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedSku, setSelectedSku] = useState<FabricSku | null>(null)
  const [skuOpen, setSkuOpen] = useState(false)
  const handledRequestedSku = useRef('')

  useEffect(() => {
    Promise.all([getPageConfig('fabrics'), getFabricSeries()]).then(([config, list]) => {
      setPage(config.data.data)
      setSeries(list.data.data || [])
    })
  }, [])

  useEffect(() => {
    let current = true
    setSelectedSku(null)
    setSkuOpen(false)
    setDetailLoading(true)
    getFabricSeriesDetail(active).then((res) => {
      if (current) setDetail(res.data.data)
    }).finally(() => {
      if (current) setDetailLoading(false)
    })
    return () => { current = false }
  }, [active])

  useEffect(() => {
    const requested = params.get('series')
    if (requested && ['otter', 'rayo', 'kais'].includes(requested) && requested !== active) setActive(requested)
  }, [active, params])

  useEffect(() => {
    const requestedId = Number(params.get('sku'))
    const requestKey = `${active}:${requestedId}`
    if (!requestedId || !detail?.skus?.length || handledRequestedSku.current === requestKey) return
    const match = detail.skus.find((sku) => sku.id === requestedId)
    if (!match) return
    handledRequestedSku.current = requestKey
    setSelectedSku(match)
    setSkuOpen(true)
  }, [active, detail, params])

  const activeSeries = series.find((item) => item.slug === active)
  const isSpecial = active === 'kais'
  const endCardVisible = page?.rail_end_card_visible !== false
  const selectSeries = (slug: string) => {
    setActive(slug)
    setParams({ series: slug }, { replace: true })
  }
  const openSku = (sku: FabricSku) => {
    if (selectedSku?.id === sku.id && skuOpen) {
      setSkuOpen(false)
      return
    }
    setSelectedSku(sku)
    setSkuOpen(true)
  }

  return (
    <PageShell>
      <PageHero tag={page?.page_tag || 'FABRIC DATABASE'} title={page?.page_title || '按使用环境，找到合适的材料'} subtitle={page?.page_subtitle || '从日常与户外使用到特种专业场景，查看材料系列、具体型号与验证依据。'} image={page?.hero_background} imageAlt="复合面料与膜层结构微距" />

      <div className="sticky top-[60px] z-40 bg-white">
      <PageSection tone="white" className="!py-5 shadow-[0_1px_0_rgba(13,38,61,0.08)] md:!py-6">
        <nav aria-label="面料系列" className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <div className="flex items-center gap-5">
            <span className="shrink-0 text-[12px] text-secondary">日常与户外使用</span>
            <div className="flex items-center gap-5">
              {['otter', 'rayo'].map((slug) => <button key={slug} onClick={() => selectSeries(slug)} className={`relative py-2 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors duration-[var(--motion-instant)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-[#69B2C1] after:transition-transform after:duration-[var(--motion-switch)] ${active === slug ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'}`}>{slug}</button>)}
            </div>
          </div>
          <div className="flex items-center gap-5 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <span className="shrink-0 text-[12px] text-secondary">特种场景</span>
            <button onClick={() => selectSeries('kais')} className={`relative py-2 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors duration-[var(--motion-instant)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-[#69B2C1] after:transition-transform after:duration-[var(--motion-switch)] ${active === 'kais' ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'}`}>kais</button>
          </div>
        </nav>
      </PageSection>
      </div>

      <PageSection id="series-content">
        <div key={active} className="motion-content-enter">
        <div className="mb-8 max-w-[760px] md:mb-10">
          <p className="label-en -ml-px text-secondary"><InlineMarkup text={activeSeries?.name || active} /></p>
          <h2 className="type-section-title mt-3 text-primary"><InlineMarkup text={activeSeries?.tagline || (isSpecial ? '面向明确任务的专业防护' : '面向真实使用环境的功能材料')} /></h2>
          <p className="body-copy mt-4 text-secondary"><InlineMarkup text={activeSeries?.description} /></p>
        </div>

        <div className="min-h-[260px]">
        {detailLoading ? <div className="motion-content-enter border-t border-border py-8 text-body text-secondary">正在加载该系列资料…</div> : detail?.skus?.length ? (
          <>
          <CatalogCollection label={`${detail.name} 面料型号`}>
            {detail.skus.map((sku) => {
              return <SkuCard key={`${sku.series_id}-${sku.id}`} sku={sku} seriesName={detail.name} capabilities={detail.capabilities} expanded={skuOpen && selectedSku?.id === sku.id} onClick={() => openSku(sku)} />
            })}
          </CatalogCollection>
          </>
        ) : <p className="border-t border-border py-8 text-body text-secondary">该系列具体型号正在整理中。</p>}
        </div>

        <AnimatedDisclosure
          open={skuOpen && Boolean(selectedSku)}
          replayKey={selectedSku?.id}
          scrollOnExpand
          className="mt-6 scroll-mt-[84px]"
        >
          {selectedSku && <section className="border-y border-border bg-white px-5 py-8 md:px-7 md:py-10" aria-live="polite">
            <p className="label-en text-secondary"><InlineMarkup text={detail?.name} /> / {selectedSku.public_name || getSkuDisplayCode(selectedSku.sku_code, detail?.name)}</p>
            <h3 className="type-module-title mt-3 text-primary"><InlineMarkup text={page?.core_performance_title || '核心性能'} /></h3>
            <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3">
              {Object.entries(parseSpecs(selectedSku.specifications)).slice(0, 3).map(([label, value]) => <div key={label} className="border-t border-border pt-4"><p className="text-[13px] font-medium text-secondary"><InlineMarkup text={label} /></p><p className="mt-2 text-[18px] font-medium text-primary"><InlineMarkup text={value} /></p></div>)}
            </div>
            <p className="mt-7 max-w-[760px] text-[13px] text-secondary">页面数据为代表性样品的典型值。不同测试标准、版本及测试条件下的结果可能存在差异，具体规格、测试方法和适用条件以对应 TDS 为准。如需 GB、JIS、ISO 等标准资料，请联系我们。</p>
            <Link to="/contact" className="mt-4 inline-block text-[14px] font-medium text-primary underline underline-offset-4">获取完整 TDS →</Link>
          </section>}
        </AnimatedDisclosure>
        {endCardVisible && <CatalogEndCta title={page?.rail_end_card_title ?? '新面料开发中'} description={page?.rail_end_card_description ?? '针对新的使用环境与性能目标持续开发。'} label={page?.rail_end_card_cta_label ?? '提交需求'} href={page?.rail_end_card_cta_href || '/contact'} />}
        </div>
      </PageSection>
    </PageShell>
  )
}
