import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getFabricSeriesDetail } from '@/api/client'
import { getFabricCapabilityIds } from '@/components/FabricCapabilities'
import { InlineMarkup } from '@/components/MarkupParser'
import MotionInView from '@/components/MotionInView'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import type { FabricSeries, FabricSku } from '@/types'
import { useSiteLocale } from '@/i18n/SiteLocale'

type SeriesDetail = FabricSeries & {
  skus: FabricSku[]
  capabilities?: FabricCapabilityDefinition[]
}

const FALLBACK_STORIES: Record<string, Pick<FabricSeries, 'story_title' | 'story_intro' | 'story_highlights'>> = {
  otter: {
    story_title: '为复杂天气与长期使用建立可靠防护',
    story_intro: 'OTTER 将无氟防水透湿结构、持久防风与耐磨面层整合为可制造、可验证的复合面料系统，面向全天候防护与高频使用。',
    story_highlights: ['全天候防护', '防水与透湿兼顾', '面向长期使用的耐磨结构'],
  },
  rayo: {
    story_title: '从纤维与结构出发，建立轻量舒适体验',
    story_intro: 'RAYO 面向日常与运动场景，通过纤维、织物结构与无氟整理的协同设计，形成防晒、导湿和速干等具体功能。',
    story_highlights: ['轻量穿着体验', '导湿与速干', '原生防晒能力'],
  },
  kais: {
    story_title: '让高强材料进入明确的专业任务',
    story_intro: 'KAIS 围绕高强纤维、织物结构与应用适配展开材料开发，为防刺、防火及其他专业防护方向提供可进一步验证的材料基础。',
    story_highlights: ['高强材料基础', '轻量防护方向', '专业任务适配'],
  },
}

function normalizedHighlights(series: SeriesDetail) {
  if (Array.isArray(series.story_highlights) && series.story_highlights.length) return series.story_highlights.slice(0, 6)
  const ids = new Set(series.skus.flatMap((sku) => getFabricCapabilityIds(sku.features, sku.card_summary, series.capabilities)))
  const labels = [...ids]
    .map((key) => series.capabilities?.find((item) => item.key === key)?.label)
    .filter((label): label is string => Boolean(label))
  return labels.length ? labels.slice(0, 6) : FALLBACK_STORIES[series.slug]?.story_highlights || []
}

export default function FabricSeriesStory() {
  const { path: localePath } = useSiteLocale()
  const { seriesSlug = '' } = useParams()
  const [series, setSeries] = useState<SeriesDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let current = true
    setLoading(true)
    setNotFound(false)
    getFabricSeriesDetail(seriesSlug)
      .then((response) => {
        if (current) setSeries(response.data.data)
      })
      .catch(() => {
        if (current) setNotFound(true)
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => { current = false }
  }, [seriesSlug])

  const highlights = useMemo(() => series ? normalizedHighlights(series) : [], [series])

  if (notFound) return <Navigate to={localePath('/fabrics')} replace />
  if (loading || !series) return <div className="min-h-[70svh] bg-darker" aria-label="正在加载系列资料" />

  const fallback = FALLBACK_STORIES[series.slug]
  const storyTitle = series.story_title || fallback?.story_title || series.tagline
  const storyIntro = series.story_intro || fallback?.story_intro || series.description
  const databaseHref = `/fabrics?series=${encodeURIComponent(series.slug)}#series-${encodeURIComponent(series.slug)}`

  return (
    <PageShell>
      <PageHero
        variant="home"
        title={series.name.toUpperCase()}
        subtitle={series.tagline}
        image={series.home_image}
        imageAlt={`${series.name} 系列材料`}
        scrollLabel={`下滑了解 ${series.name.toUpperCase()}`}
        scrollTarget="#series-story"
      />

      <PageSection id="series-story" className="scroll-mt-[72px] !py-20 md:!py-28">
        <MotionInView className="mx-auto max-w-[1180px]">
          <div className="grid gap-10 md:grid-cols-[minmax(260px,.78fr)_minmax(360px,1.22fr)] md:gap-20">
            <div data-motion-item>
              <p className="label-en text-secondary">{series.name.toUpperCase()} SERIES</p>
              <h2 className="type-section-title mt-4 max-w-[520px] text-primary"><InlineMarkup text={storyTitle} /></h2>
            </div>
            <div data-motion-item style={{ '--motion-delay': '80ms' } as React.CSSProperties}>
              <p className="body-copy max-w-[700px] text-secondary"><InlineMarkup text={storyIntro} /></p>
            </div>
          </div>

          {highlights.length > 0 && (
            <ul className="mt-14 grid border-y border-border md:mt-20 md:grid-cols-3" aria-label={`${series.name} 系列核心能力`}>
              {highlights.slice(0, 3).map((item, index) => (
                <li
                  key={item}
                  data-motion-item
                  style={{ '--motion-delay': `${140 + index * 70}ms` } as React.CSSProperties}
                  className="group relative flex min-h-[132px] items-end border-b border-border px-0 py-7 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
                >
                  <span className="absolute left-0 top-0 h-px w-8 bg-accent transition-[width] duration-[var(--motion-media)] ease-apple group-hover:w-16 md:left-8 md:first:left-0" />
                  <span className="text-[18px] font-semibold tracking-[-.01em] text-primary">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </MotionInView>
      </PageSection>

      <PageSection tone="navy" className="!py-16 md:!py-20">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="type-module-title text-white">查看 {series.name.toUpperCase()} 系列面料</h2>
            <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-white/70">
              返回面料数据库，查看该系列现有型号、材料结构与代表性性能。
            </p>
          </div>
          <Link
            to={localePath(databaseHref)}
            className="group inline-flex w-fit items-center border-b border-white/45 pb-1 text-[14px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            查看系列面料
            <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-[var(--motion-instant)] group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </PageSection>
    </PageShell>
  )
}
