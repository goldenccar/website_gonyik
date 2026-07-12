import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFabricSeries, getFabricSeriesDetail, getPageConfig } from '@/api/client'
import HorizontalRail from '@/components/HorizontalRail'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import SkuCard from '@/components/SkuCard'
import type { FabricSeries, FabricSku, PageConfig } from '@/types'

function parseSpecs(value: string) {
  try { return JSON.parse(value) as Record<string, string> } catch { return {} }
}

export default function FabricDatabase() {
  const [params] = useSearchParams()
  const [page, setPage] = useState<PageConfig | null>(null)
  const [series, setSeries] = useState<FabricSeries[]>([])
  const [active, setActive] = useState(params.get('series') || 'otter')
  const [detail, setDetail] = useState<(FabricSeries & { skus: FabricSku[] }) | null>(null)
  const [selectedSku, setSelectedSku] = useState<FabricSku | null>(null)
  const skuDetailRef = useRef<HTMLElement>(null)

  useEffect(() => {
    Promise.all([getPageConfig('fabrics'), getFabricSeries()]).then(([config, list]) => {
      setPage(config.data.data)
      setSeries(list.data.data || [])
    })
  }, [])

  useEffect(() => {
    setSelectedSku(null)
    getFabricSeriesDetail(active).then((res) => setDetail(res.data.data))
  }, [active])

  const activeSeries = series.find((item) => item.slug === active)
  const isSpecial = active === 'kais'
  const openSku = (sku: FabricSku) => {
    if (selectedSku?.id === sku.id) {
      setSelectedSku(null)
      return
    }
    setSelectedSku(sku)
    window.setTimeout(() => skuDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <PageShell>
      <PageHero tag={page?.page_tag || 'FABRIC DATABASE'} title={page?.page_title || '按使用环境，找到合适的材料'} subtitle={page?.page_subtitle || '从日常与户外使用到特种专业场景，查看材料系列、具体型号与验证依据。'} image={page?.hero_background} imageAlt="复合面料与膜层结构微距" />

      <PageSection tone="white" className="!py-8">
        <nav aria-label="面料系列" className="flex flex-wrap items-center gap-x-3 gap-y-4 text-[14px]">
          <span className="mr-1 text-secondary">日常与户外使用</span>
          {['otter', 'rayo'].map((slug) => <button key={slug} onClick={() => setActive(slug)} className={`px-3 py-2 uppercase ${active === slug ? 'bg-dark text-white' : 'border border-border text-primary'}`}>{slug}</button>)}
          <span className="mx-2 text-border">|</span>
          <span className="text-secondary">特种场景</span>
          <button onClick={() => setActive('kais')} className={`px-3 py-2 uppercase ${active === 'kais' ? 'bg-dark text-white' : 'border border-border text-primary'}`}>kais</button>
        </nav>
      </PageSection>

      <PageSection id="series-content">
        <div className="mb-10 max-w-[760px]">
          <p className="-ml-px text-label uppercase text-secondary">{activeSeries?.name || active}</p>
          <h2 className="mt-3 text-[32px] font-bold leading-tight text-primary md:text-[40px]">{activeSeries?.tagline || (isSpecial ? '面向明确任务的专业防护' : '面向真实使用环境的功能材料')}</h2>
          <p className="mt-4 text-body text-secondary">{activeSeries?.description}</p>
        </div>

        {detail?.skus?.length ? (
          <HorizontalRail label={`${detail.name} 面料型号`}>
            {detail.skus.map((sku) => {
              return <SkuCard key={`${sku.series_id}-${sku.id}`} sku={sku} seriesName={detail.name} seriesTagline={sku.name || detail.tagline} expanded={selectedSku?.id === sku.id} onClick={() => openSku(sku)} />
            })}
            {page?.rail_end_card_visible !== false && <article className="flex min-h-full snap-start items-end bg-white p-7"><div><p className="text-label text-secondary">IN DEVELOPMENT</p><h3 className="mt-3 text-h4 text-primary">{page?.rail_end_card_title || '新面料开发中'}</h3><p className="mt-3 text-body text-secondary">{page?.rail_end_card_description || '针对新的使用环境与性能目标持续开发。'}</p>{page?.rail_end_card_cta_label && <a href={page.rail_end_card_cta_href || '/contact'} className="mt-6 inline-block text-[14px] underline underline-offset-4">{page.rail_end_card_cta_label} →</a>}</div></article>}
          </HorizontalRail>
        ) : <p className="border-t border-border py-8 text-body text-secondary">该系列具体型号正在整理中。</p>}

        {selectedSku && (
          <section ref={skuDetailRef} className="mt-10 scroll-mt-[84px] border-t border-primary pt-9" aria-live="polite">
            <p className="text-label uppercase text-secondary">{detail?.name} {selectedSku.sku_code.replace(/^GY-[A-Z]+-/, '')}</p>
            <h3 className="mt-3 text-[30px] font-bold text-primary">经验证的性能</h3>
            <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3">
              {Object.entries(parseSpecs(selectedSku.specifications)).slice(0, 3).map(([label, value]) => <div key={label} className="border-t border-border pt-4"><p className="text-[13px] font-medium text-secondary">{label}</p><p className="mt-2 text-[18px] font-medium text-primary">{value}</p></div>)}
            </div>
            <p className="mt-7 max-w-[720px] text-[13px] text-secondary">页面仅展示该型号已有的结构与性能资料；测试方法、适用条件和第三方验证以对应资料为准。</p>
          </section>
        )}
      </PageSection>
    </PageShell>
  )
}
