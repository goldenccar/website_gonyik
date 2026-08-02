import type { ReactNode } from 'react'

interface ResponsiveAdminListProps<T> {
  items: T[]
  getKey: (item: T) => string | number
  renderTitle: (item: T) => ReactNode
  renderSubtitle?: (item: T) => ReactNode
  renderMedia?: (item: T) => ReactNode
  renderActions?: (item: T) => ReactNode
  onSelect?: (item: T) => void
  isSelected?: (item: T) => boolean
  emptyLabel?: string
}

export default function ResponsiveAdminList<T>({
  items,
  getKey,
  renderTitle,
  renderSubtitle,
  renderMedia,
  renderActions,
  onSelect,
  isSelected,
  emptyLabel = '暂无内容',
}: ResponsiveAdminListProps<T>) {
  if (items.length === 0) return <p className="bg-dark px-4 py-10 text-center text-[13px] text-accent">{emptyLabel}</p>

  return (
    <div className="divide-y divide-white/5 bg-dark">
      {items.map((item) => {
        const content = (
          <>
            {renderMedia && <span className="shrink-0">{renderMedia(item)}</span>}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-white">{renderTitle(item)}</span>
              {renderSubtitle && <span className="mt-1 block line-clamp-2 text-[12px] leading-5 text-accent">{renderSubtitle(item)}</span>}
            </span>
          </>
        )
        return (
          <div key={getKey(item)} className={`flex min-w-0 items-center gap-3 px-4 transition-colors ${onSelect ? 'hover:bg-white/5' : ''} ${isSelected?.(item) ? 'bg-white/10' : ''}`}>
            {onSelect ? (
              <button type="button" onClick={() => onSelect(item)} className="flex min-w-0 flex-1 items-center gap-3 py-4 text-left">
                {content}
              </button>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-3 py-4">{content}</div>
            )}
            {renderActions && <div className="flex shrink-0 items-center gap-1">{renderActions(item)}</div>}
          </div>
        )
      })}
    </div>
  )
}
