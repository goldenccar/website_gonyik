import { useEffect, useState } from 'react'
import { getFluorineSections, getPageConfig } from '@/api/client'
import TechnologyDetail from '@/components/TechnologyDetail'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import ContentTabs from '@/components/ContentTabs'
import type { FluorineSection, PageConfig } from '@/types'

export default function FluorineFreeFuture() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<FluorineSection[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    Promise.all([getPageConfig('pfas-free-innovation'), getFluorineSections()]).then(([config, content]) => {
      setPage(config.data.data)
      setSections((content.data.data || []).sort((a: FluorineSection, b: FluorineSection) => a.order_index - b.order_index))
    })
  }, [])

  const current = sections[active]
  return (
    <PageShell>
      <PageHero variant="detail" tag={page?.page_tag || 'TECHNOLOGY INNOVATION'} title={page?.page_title || '技术，从材料开始'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="膜层、复合与测试对象微距" />
      {current && <PageSection className="!py-10 lg:!py-14">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4"><ContentTabs label="技术目录" items={sections.map((item) => ({ id: String(item.id), label: item.title }))} active={String(current.id)} onChange={(id) => setActive(sections.findIndex((item) => String(item.id) === id))} /></div>
          <div className="lg:col-span-8"><TechnologyDetail section={current} index={active} live /></div>
        </div>
      </PageSection>}
    </PageShell>
  )
}
