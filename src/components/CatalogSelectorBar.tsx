import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PageSection } from './PageLayout'
import { InlineMarkup } from './MarkupParser'
import { useSiteLocale } from '@/i18n/SiteLocale'

export interface CatalogSelectorItem {
  key: string | number
  label: string
  active: boolean
  onSelect: () => void
}

export interface CatalogSelectorGroup {
  label: string
  items: CatalogSelectorItem[]
  uppercase?: boolean
}

export default function CatalogSelectorBar({ label, groups, variant = 'default' }: {
  label: string
  groups: CatalogSelectorGroup[]
  variant?: 'default' | 'technology'
}) {
  const { t } = useSiteLocale()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const stuckRef = useRef(false)
  const [stuck, setStuck] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const visibleGroups = groups.filter((group) => group.items.length > 0)
  const activeItem = useMemo(
    () => visibleGroups.flatMap((group) => group.items).find((item) => item.active),
    [visibleGroups],
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    let frame = 0
    const update = () => {
      frame = 0
      const top = sentinel.getBoundingClientRect().top
      const next = stuckRef.current ? top < 68 : top <= 60
      if (next !== stuckRef.current) {
        stuckRef.current = next
        setStuck(next)
      }
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  if (visibleGroups.length === 0) return null

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px -mb-px" />
      <div className={`catalog-selector catalog-selector--${variant} sticky top-[60px] z-40 ${stuck ? 'is-stuck' : ''} ${mobileExpanded ? 'is-mobile-expanded' : ''}`}>
        <PageSection
          tone="white"
          outerClassName="catalog-selector-outer"
          className="catalog-selector-surface"
        >
          {variant === 'technology' && (
            <button
              type="button"
              aria-expanded={mobileExpanded}
              onClick={() => setMobileExpanded((value) => !value)}
              className="catalog-selector-mobile-trigger"
            >
              <span className="catalog-selector-mobile-kicker">{t('当前技术')}</span>
              <span className="catalog-selector-mobile-current"><InlineMarkup text={activeItem?.label || t('选择技术')} /></span>
              <ChevronDown aria-hidden="true" size={17} className="catalog-selector-mobile-chevron" />
            </button>
          )}
          <nav aria-label={label} className="catalog-selector-nav gonyik-rail">
            {visibleGroups.map((group, groupIndex) => (
              <div key={group.label} className={`catalog-selector-group ${groupIndex > 0 ? 'catalog-selector-group-divided' : ''}`}>
                <span className="catalog-selector-label"><InlineMarkup text={group.label} /></span>
                <div className="catalog-selector-items">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      aria-current={item.active ? 'page' : undefined}
                      onClick={item.onSelect}
                      className={`catalog-selector-item ${group.uppercase ? 'uppercase' : ''} ${item.active ? 'is-active' : ''}`}
                    >
                      <InlineMarkup text={item.label} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </PageSection>
      </div>
    </>
  )
}
