import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getFabricSeries, getFabricSeriesDetail, getPageConfig } from '@/api/client'
import HorizontalRail from '@/components/HorizontalRail'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import SkuCard, { getSkuDisplayCode } from '@/components/SkuCard'
import type { FabricSeries, FabricSku, PageConfig } from '@/types'
import AnimatedDisclosure from '@/components/AnimatedDisclosure'
import { InlineMarkup } from '@/components/MarkupParser'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import RailEndCard from '@/components/RailEndCard'

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

  const activeSeries = series.find((item) => item.slug === active)
  const isSpecial = active === 'kais'
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

      <PageSection tone="white" className="!py-8">
        <nav aria-label="面料系列" className="grid grid-cols-3 gap-2 md:hidden">
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <span className="col-span-2 text-[12px] text-secondary">日常与户外使用</span>
            {['otter', 'rayo'].map((slug) => <button key={slug} onClick={() => selectSeries(slug)} className={`h-11 border px-3 text-[13px] font-medium uppercase transition-colors duration-[var(--motion-instant)] ${active === slug ? 'border-dark bg-dark text-white' : 'border-border bg-white text-primary'}`}>{slug}</button>)}
          </div>
          <div className="grid grid-cols-1 gap-2">
            <span className="text-[12px] text-secondary">特种场景</span>
            <button onClick={() => selectSeries('kais')} className={`h-11 border px-3 text-[13px] font-medium uppercase transition-colors duration-[var(--motion-instant)] ${active === 'kais' ? 'border-dark bg-dark text-white' : 'border-border bg-white text-primary'}`}>kais</button>
          </div>
        </nav>
        <nav aria-label="面料系列" className="hidden items-center gap-x-3 text-[14px] md:flex">
          <span className="mr-1 text-secondary">日常与户外使用</span>
          {['otter', 'rayo'].map((slug) => <button key={slug} onClick={() => selectSeries(slug)} className={`px-3 py-2 uppercase transition-colors duration-[var(--motion-instant)] ${active === slug ? 'bg-dark text-white' : 'border border-border text-primary'}`}>{slug}</button>)}
          <span className="mx-2 text-border">|</span>
          <span className="text-secondary">特种场景</span>
          <button onClick={() => selectSeries('kais')} className={`px-3 py-2 uppercase transition-colors duration-[var(--motion-instant)] ${active === 'kais' ? 'bg-dark text-white' : 'border border-border text-primary'}`}>kais</button>
        </nav>
      </PageSection>

      <PageSection id="series-content">
        <div key={active} className="motion-content-enter">
        <div className="mb-10 max-w-[760px]">
          <p className="label-en -ml-px text-secondary"><InlineMarkup text={activeSeries?.name || active} /></p>
          <h2 className="type-section-title mt-3 text-primary"><InlineMarkup text={activeSeries?.tagline || (isSpecial ? '面向明确任务的专业防护' : '面向真实使用环境的功能材料')} /></h2>
          <p className="body-copy mt-4 text-secondary"><InlineMarkup text={activeSeries?.description} /></p>
        </div>

        <div className="min-h-[260px]">
        {detailLoading ? <div className="motion-content-enter border-t border-border py-8 text-body text-secondary">正在加载该系列资料…</div> : detail?.skus?.length ? (
          <HorizontalRail label={`${detail.name} 面料型号`} mobileStack>
            {detail.skus.map((sku) => {
              return <SkuCard key={`${sku.series_id}-${sku.id}`} sku={sku} seriesName={detail.name} capabilities={detail.capabilities} expanded={skuOpen && selectedSku?.id === sku.id} onClick={() => openSku(sku)} />
            })}
            <RailEndCard config={page || {}} fallbackTitle="新面料开发中" fallbackDescription="针对新的使用环境与性能目标持续开发。" />
          </HorizontalRail>
        ) : <p className="border-t border-border py-8 text-body text-secondary">该系列具体型号正在整理中。</p>}
        </div>

        <AnimatedDisclosure
          open={skuOpen && Boolean(selectedSku)}
          replayKey={selectedSku?.id}
          scrollOnExpand
          className="mt-10 scroll-mt-[84px]"
        >
          {selectedSku && <section className="pt-5" aria-live="polite">
            <p className="label-en text-secondary"><InlineMarkup text={detail?.name} /> / {getSkuDisplayCode(selectedSku.sku_code, detail?.name)}</p>
            <h3 className="type-module-title mt-3 text-primary"><InlineMarkup text={page?.core_performance_title || '核心性能'} /></h3>
            <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3">
              {Object.entries(parseSpecs(selectedSku.specifications)).slice(0, 3).map(([label, value]) => <div key={label} className="border-t border-border pt-4"><p className="text-[13px] font-medium text-secondary"><InlineMarkup text={label} /></p><p className="mt-2 text-[18px] font-medium text-primary"><InlineMarkup text={value} /></p></div>)}
            </div>
            <p className="mt-7 max-w-[760px] text-[13px] text-secondary">页面数据为代表性样品的典型值。不同测试标准、版本及测试条件下的结果可能存在差异，具体规格、测试方法和适用条件以对应 TDS 为准。如需 GB、JIS、ISO 等标准资料，请联系我们。</p>
            <Link to="/contact" className="mt-4 inline-block text-[14px] font-medium text-primary underline underline-offset-4">获取完整 TDS →</Link>
          </section>}
        </AnimatedDisclosure>
        </div>
      </PageSection>
    </PageShell>
  )
}
