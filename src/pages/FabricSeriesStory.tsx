import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getFabricSeriesDetail } from '@/api/client'
import { getFabricCapabilityIds } from '@/components/FabricCapabilities'
import { InlineMarkup } from '@/components/MarkupParser'
import MotionInView from '@/components/MotionInView'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import type { FabricSeries, FabricSku } from '@/types'
import { useSiteLocale } from '@/i18n/SiteLocale'
import RelatedAction from '@/components/RelatedAction'

type SeriesDetail = FabricSeries & {
  skus: FabricSku[]
  capabilities?: FabricCapabilityDefinition[]
}

const FALLBACK_STORIES: Record<string, Pick<FabricSeries, 'story_title' | 'story_intro' | 'story_highlights'>> = {
  otter: {
    story_title: '金奖膜技术，进入高性能面料',
    story_intro: '港翼 OTTER 采用获日内瓦国际发明展特别评审金奖的 RPO 膜技术，通过面层、功能膜与内层结构的协同设计，兼顾防水、透湿和舒适性表现。其 RPO-SOTEX 功能膜经 SGS 对数百种目标 PFAS 进行检测，结果均未检出。',
    story_highlights: ['高性能防水', '稳定透湿表现', '轻量舒适结构'],
  },
  rayo: {
    story_title: '把防晒、导湿与凉感织进结构',
    story_intro: 'RAYO 面向日常与运动场景，从纤维配方与织物结构出发，兼顾防晒、导湿、速干与接触凉感，让功能表现建立在材料与结构本身。',
    story_highlights: ['UPF 50+', '导湿速干', '接触凉感'],
  },
  kais: {
    story_title: '面向特种场景，构建关键材料',
    story_intro: 'KAIS 面向消防、防化及其他特种场景，围绕高性能纤维、功能膜、织物结构与复合工艺进行针对性开发，为不同专业任务提供可进一步适配与验证的材料基础。',
    story_highlights: ['特种场景适配', '多材料协同', '项目化开发'],
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

      <RelatedAction
        title={`查看 ${series.name.toUpperCase()} 系列型号`}
        description="进入面料数据库，查看该系列现有型号、材料结构与代表性性能。"
        label="进入面料数据库"
        to={localePath(databaseHref)}
      />
    </PageShell>
  )
}
