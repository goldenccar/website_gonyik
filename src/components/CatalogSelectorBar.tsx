import { PageSection } from './PageLayout'
import { InlineMarkup } from './MarkupParser'

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

export default function CatalogSelectorBar({ label, groups }: {
  label: string
  groups: CatalogSelectorGroup[]
}) {
  const visibleGroups = groups.filter((group) => group.items.length > 0)
  if (visibleGroups.length === 0) return null

  return (
    <div className="sticky top-[60px] z-40 bg-white">
      <PageSection tone="white" className="!py-5 shadow-[0_1px_0_rgba(13,38,61,0.08)] md:!py-6">
        <nav aria-label={label} className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
          {visibleGroups.map((group, groupIndex) => (
            <div key={group.label} className={`flex min-w-0 flex-col items-start gap-1.5 ${groupIndex > 0 ? 'border-t border-border pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0' : ''}`}>
              <span className="shrink-0 text-[11px] font-medium tracking-[0.06em] text-secondary"><InlineMarkup text={group.label} /></span>
              <div className="gonyik-rail flex min-w-0 items-center gap-5 overflow-x-auto">
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-current={item.active ? 'page' : undefined}
                    onClick={item.onSelect}
                    className={`relative shrink-0 py-1.5 text-[13px] font-semibold tracking-[0.05em] transition-colors duration-[var(--motion-instant)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-[#69B2C1] after:transition-transform after:duration-[var(--motion-switch)] ${
                      group.uppercase ? 'uppercase' : ''
                    } ${item.active ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'}`}
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
  )
}
