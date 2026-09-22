import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { InlineMarkup } from './MarkupParser'
import '@/styles/section-selector.css'

export interface CatalogSelectorItem {
  key: string | number
  label: string
  active: boolean
  onSelect?: () => void
  href?: string
}
export interface CatalogSelectorGroup {
  label: string
  items: CatalogSelectorItem[]
  uppercase?: boolean
}
export default function CatalogSelectorBar({ label, groups, overview }: {
  label: string
  groups: CatalogSelectorGroup[]
  overview?: { label: string; href: string }
}) {
  const nav = useRef<HTMLElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const activeKey = groups.flatMap(group => group.items).find(item => item.active)?.key
  useEffect(() => {
    const rail = nav.current
    if (!rail) return
    const update = () => setEdges({ left: rail.scrollLeft > 2, right: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2 })
    const observer = new ResizeObserver(update)
    observer.observe(rail)
    for (const item of rail.children) observer.observe(item)
    rail.addEventListener('scroll', update, { passive: true })
    update()
    return () => { observer.disconnect(); rail.removeEventListener('scroll', update) }
  }, [groups])
  useEffect(() => {
    const rail = nav.current
    const active = rail?.querySelector<HTMLElement>('[aria-current]')
    if (!rail || !active) return
    const itemRect = active.getBoundingClientRect(), railRect = rail.getBoundingClientRect()
    if (itemRect.left < railRect.left || itemRect.right > railRect.right) rail.scrollLeft += itemRect.left - railRect.left - (railRect.width - itemRect.width) / 2
  }, [activeKey])
  if (!groups.some(group => group.items.length)) return null
  return <div className="section-selector"><div className="section-selector-frame">
    {overview && <Link className="section-selector-overview" to={overview.href}><InlineMarkup text={overview.label} /></Link>}
    <nav ref={nav} aria-label={label} className="section-selector-items" data-more-left={edges.left} data-more-right={edges.right}>
      {groups.flatMap(group => group.items.map(item => {
        const props = { className: `section-selector-item ${group.uppercase ? 'uppercase' : ''}`, 'aria-current': item.active ? 'page' as const : undefined }
        return item.href ? <Link key={item.key} {...props} to={item.href} onClick={item.onSelect}><InlineMarkup text={item.label} /></Link>
          : <button key={item.key} {...props} type="button" onClick={item.onSelect}><InlineMarkup text={item.label} /></button>
      }))}
    </nav>
  </div></div>
}
