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
      {items.map((item) => (
        <div
          key={getKey(item)}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onClick={() => onSelect?.(item)}
          onKeyDown={(event) => {
            if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault()
              onSelect(item)
            }
          }}
          className={`flex min-w-0 items-center gap-3 px-4 py-4 transition-colors ${onSelect ? 'cursor-pointer hover:bg-white/5' : ''} ${isSelected?.(item) ? 'bg-white/10' : ''}`}
        >
          {renderMedia && <div className="shrink-0">{renderMedia(item)}</div>}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium text-white">{renderTitle(item)}</div>
            {renderSubtitle && <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-accent">{renderSubtitle(item)}</div>}
          </div>
          {renderActions && <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>{renderActions(item)}</div>}
        </div>
      ))}
    </div>
  )
}
