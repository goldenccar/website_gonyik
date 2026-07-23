import { useEffect, useState } from 'react'
import { getContentSections, getPageConfig } from '@/api/client'
import TechnologyDetail from '@/components/TechnologyDetail'
import PageHero from '@/components/PageHero'
import { PageShell } from '@/components/PageLayout'
import ScrollSpySections from '@/components/ScrollSpySections'
import type { FluorineSection, PageConfig } from '@/types'

export default function FluorineFreeFuture() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<FluorineSection[]>([])

  useEffect(() => {
    Promise.all([getPageConfig('pfas-free-innovation'), getContentSections('pfas-free-innovation')]).then(([config, content]) => {
      setPage(config.data.data)
      const sorted = (content.data.data || []).sort((a: FluorineSection, b: FluorineSection) => a.order_index - b.order_index)
      setSections(sorted)
    })
  }, [])

  return (
    <PageShell>
      <PageHero variant="detail" tag={page?.page_tag || 'TECHNOLOGY INNOVATION'} title={page?.page_title || '技术，从材料开始'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="膜层、复合与测试对象微距" />
      <ScrollSpySections idPrefix="technology" label="技术目录" showIndex={false} topNav items={sections.map((section, index) => ({ id: section.section_key || String(section.id), label: section.nav_label || section.title, content: <TechnologyDetail section={section} index={index} /> }))} />
    </PageShell>
  )
}
