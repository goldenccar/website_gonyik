import { useEffect, useRef } from 'react'
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
  const activeKey = groups.flatMap(group => group.items).find(item => item.active)?.key
  useEffect(() => {
    const rail = nav.current
    const active = rail?.querySelector<HTMLElement>('[aria-current]')
    if (!rail || !active) return
    const itemRect = active.getBoundingClientRect(), railRect = rail.getBoundingClientRect()
    if (itemRect.left < railRect.left || itemRect.right > railRect.right) rail.scrollLeft += itemRect.left - railRect.left - 24
  }, [activeKey])
  if (!groups.some(group => group.items.length)) return null
  return <div className="section-selector"><div className="section-selector-frame">
    {overview && <Link className="section-selector-overview" to={overview.href}><InlineMarkup text={overview.label} /></Link>}
    <nav ref={nav} aria-label={label} className="section-selector-items">
      {groups.flatMap(group => group.items.map(item => {
        const props = { className: `section-selector-item ${group.uppercase ? 'uppercase' : ''}`, 'aria-current': item.active ? 'page' as const : undefined }
        return item.href ? <Link key={item.key} {...props} to={item.href} onClick={item.onSelect}><InlineMarkup text={item.label} /></Link>
          : <button key={item.key} {...props} type="button" onClick={item.onSelect}><InlineMarkup text={item.label} /></button>
      }))}
    </nav>
  </div></div>
}
