import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Edit2, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import PrimaryButton from './PrimaryButton'
import ResponsiveAdminList from './ResponsiveAdminList'

export interface CatalogCrudColumn<T> {
  label: string
  render: (item: T) => ReactNode
  className?: string
}

interface CatalogCrudItem {
  id: number
  visibility?: 'public' | 'hidden'
  status?: 'active' | 'archived'
}

export default function CatalogCrudSection<T extends CatalogCrudItem>({
  title,
  description,
  actionLabel,
  filters,
  filterValue,
  onFilterChange,
  items,
  columns,
  getTitle,
  getSubtitle,
  onAdd,
  onEdit,
  onDelete,
  onVisibility,
  onMove,
  orderHint,
  emptyLabel = '暂无内容',
}: {
  title: string
  description: string
  actionLabel: string
  filters: Array<{ value: string; label: string }>
  filterValue: string
  onFilterChange: (value: string) => void
  items: T[]
  columns: Array<CatalogCrudColumn<T>>
  getTitle: (item: T) => ReactNode
  getSubtitle: (item: T) => ReactNode
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onVisibility: (item: T) => void
  onMove?: (index: number, direction: -1 | 1) => void
  orderHint?: ReactNode
  emptyLabel?: string
}) {
  const actions = (item: T, index: number) => <>
    {onMove && <>
      <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} className="flex h-11 w-9 items-center justify-center text-accent disabled:opacity-25" aria-label="向前移动"><ArrowLeft size={15} /></button>
      <button type="button" onClick={() => onMove(index, 1)} disabled={index === items.length - 1} className="flex h-11 w-9 items-center justify-center text-accent disabled:opacity-25" aria-label="向后移动"><ArrowRight size={15} /></button>
    </>}
    <button type="button" onClick={() => onVisibility(item)} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white" aria-label={item.visibility === 'hidden' ? '前台显示' : '前台隐藏'}>{item.visibility === 'hidden' ? <EyeOff size={15} /> : <Eye size={15} />}</button>
    <button type="button" onClick={() => onEdit(item)} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white" aria-label="编辑"><Edit2 size={15} /></button>
    <button type="button" onClick={() => onDelete(item)} className="flex h-11 w-9 items-center justify-center text-error hover:text-white" aria-label="删除"><Trash2 size={15} /></button>
  </>

  return <section className="mt-10 border-t border-white/10 pt-8">
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-[20px] font-bold text-white">{title}</h2>
        <p className="mt-1 max-w-[720px] text-[12px] leading-5 text-muted">{description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-[190px]">
          <span className="mb-1 block text-[12px] uppercase text-secondary">筛选归属</span>
          <select value={filterValue} onChange={(event) => onFilterChange(event.target.value)} className="min-h-11 w-full border border-borderDark bg-white/5 px-3 py-2 text-[13px] text-white focus:border-white focus:outline-none">
            {filters.map((filter) => <option key={filter.value} value={filter.value} className="bg-dark">{filter.label}</option>)}
          </select>
        </label>
        <PrimaryButton onClick={onAdd} icon={<Plus size={16} />}>{actionLabel}</PrimaryButton>
      </div>
    </div>

    <div className="hidden bg-dark md:block">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-white/10 uppercase text-accent"><tr>{columns.map((column) => <th key={column.label} className={`px-5 py-3 ${column.className || ''}`}>{column.label}</th>)}<th className="px-5 py-3">前台</th><th className="px-5 py-3 text-right">操作</th></tr></thead>
        <tbody className="text-white">
          {items.map((item, index) => <tr key={item.id} className="border-b border-white/5">
            {columns.map((column) => <td key={column.label} className={`px-5 py-4 ${column.className || ''}`}>{column.render(item)}</td>)}
            <td className="px-5 py-4 text-accent">{item.visibility === 'hidden' ? '隐藏' : '显示'}</td>
            <td className="px-5 py-2"><div className="flex justify-end">{actions(item, index)}</div></td>
          </tr>)}
        </tbody>
      </table>
      {items.length === 0 && <p className="py-10 text-center text-[13px] text-accent">{emptyLabel}</p>}
    </div>
    <div className="md:hidden">
      <ResponsiveAdminList items={items} getKey={(item) => item.id} emptyLabel={emptyLabel} renderTitle={getTitle} renderSubtitle={getSubtitle} renderActions={(item) => actions(item, items.indexOf(item))} />
    </div>
    {orderHint && <p className="mt-3 text-[12px] text-muted">{orderHint}</p>}
  </section>
}
