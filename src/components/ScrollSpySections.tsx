import { useEffect, useState, type ReactNode } from 'react'
import ContentTabs from './ContentTabs'
import { PageSection } from './PageLayout'

interface ScrollSpyItem {
  id: string
  label: string
  content: ReactNode
}

export default function ScrollSpySections({ items, label, idPrefix }: {
  items: ScrollSpyItem[]
  label: string
  idPrefix: string
}) {
  const [activeId, setActiveId] = useState('')
  const itemKey = items.map((item) => item.id).join('|')

  useEffect(() => {
    if (!items.length) return
    const hashId = window.location.hash.replace(`#${idPrefix}-`, '')
    setActiveId(items.some((item) => item.id === hashId) ? hashId : items[0].id)
  }, [idPrefix, itemKey])

  useEffect(() => {
    if (!items.length) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
      const visible = entries.filter((entry) => entry.isIntersecting)
      if (!visible.length) return
      const marker = window.innerHeight * 0.28
      const nearest = visible.reduce((best, entry) => (
        Math.abs(entry.boundingClientRect.top - marker) < Math.abs(best.boundingClientRect.top - marker) ? entry : best
      ))
      setActiveId(nearest.target.getAttribute('data-section-id') || '')
    }, { rootMargin: '-24% 0px -58% 0px', threshold: 0 })

    items.forEach((item) => {
      const element = document.getElementById(`${idPrefix}-${item.id}`)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [idPrefix, itemKey])

  useEffect(() => {
    if (!items.length || !window.location.hash.startsWith(`#${idPrefix}-`)) return
    const element = document.querySelector<HTMLElement>(window.location.hash)
    if (element) requestAnimationFrame(() => element.scrollIntoView({ block: 'start' }))
  }, [idPrefix, itemKey])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`${idPrefix}-${id}`)
    if (!element) return
    setActiveId(id)
    window.history.replaceState(null, '', `#${idPrefix}-${id}`)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  if (!items.length) return null

  return (
    <PageSection className="!py-0">
      <div className="relative lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-14">
        <div className="contents lg:col-span-3 lg:block">
          <ContentTabs variant="scrollspy" label={label} items={items.map(({ id, label: itemLabel }) => ({ id, label: itemLabel }))} active={activeId} onChange={scrollToSection} />
        </div>
        <div className="lg:col-span-9 lg:col-start-4">
          {items.map((item) => <section
            key={item.id}
            id={`${idPrefix}-${item.id}`}
            data-section-id={item.id}
            className="motion-section scroll-mt-[124px] border-t border-transparent py-14 first:border-t-0 last:pb-24 lg:scroll-mt-[88px] lg:py-20 lg:first:pt-12"
          >{item.content}</section>)}
        </div>
      </div>
    </PageSection>
  )
}
