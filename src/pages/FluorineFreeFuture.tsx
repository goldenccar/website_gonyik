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
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    Promise.all([getPageConfig('pfas-free-innovation'), getFluorineSections()]).then(([config, content]) => {
      setPage(config.data.data)
      const sorted = (content.data.data || []).sort((a: FluorineSection, b: FluorineSection) => a.order_index - b.order_index)
      setSections(sorted)
      const hashId = window.location.hash.replace('#technology-', '')
      const initial = sorted.find((section: FluorineSection) => String(section.id) === hashId) || sorted[0]
      if (initial) setActiveId(String(initial.id))
    })
  }, [])

  useEffect(() => {
    if (!sections.length) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
      if (!visible.length) return
      const marker = window.innerHeight * 0.28
      const nearest = visible.reduce((best, entry) => (
        Math.abs(entry.boundingClientRect.top - marker) < Math.abs(best.boundingClientRect.top - marker) ? entry : best
      ))
      setActiveId(nearest.target.getAttribute('data-section-id') || '')
    }, { rootMargin: '-24% 0px -58% 0px', threshold: 0 })

    sections.forEach((section) => {
      const element = document.getElementById(`technology-${section.id}`)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [sections])

  useEffect(() => {
    if (!sections.length || !window.location.hash.startsWith('#technology-')) return
    const element = document.querySelector<HTMLElement>(window.location.hash)
    if (!element) return
    requestAnimationFrame(() => element.scrollIntoView({ block: 'start' }))
  }, [sections])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`technology-${id}`)
    if (!element) return
    setActiveId(id)
    window.history.replaceState(null, '', `#technology-${id}`)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <PageShell>
      <PageHero variant="detail" tag={page?.page_tag || 'TECHNOLOGY INNOVATION'} title={page?.page_title || '技术，从材料开始'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="膜层、复合与测试对象微距" />
      {sections.length > 0 && <PageSection className="!py-0">
        <div className="relative lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-14">
          <div className="contents lg:col-span-3 lg:block">
            <ContentTabs variant="scrollspy" label="技术目录" items={sections.map((item) => ({ id: String(item.id), label: item.title }))} active={activeId} onChange={scrollToSection} />
          </div>
          <div className="lg:col-span-9 lg:col-start-4">
            {sections.map((section) => <section
              key={section.id}
              id={`technology-${section.id}`}
              data-section-id={String(section.id)}
              className="scroll-mt-[124px] border-t border-border py-14 first:border-t-0 lg:scroll-mt-[88px] lg:py-20 lg:first:pt-12 last:pb-24"
            ><TechnologyDetail section={section} /></section>)}
          </div>
        </div>
      </PageSection>}
    </PageShell>
  )
}
