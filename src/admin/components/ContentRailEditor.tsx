import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Edit2, Eye, EyeOff } from 'lucide-react'
import HorizontalRail from '@/components/HorizontalRail'
import FormField from './FormField'
import SaveButton from './SaveButton'
import { InlineMarkup } from '@/components/MarkupParser'

export interface RailEndCardConfig {
  rail_end_card_visible: boolean
  rail_end_card_title: string
  rail_end_card_description: string
  rail_end_card_cta_label: string
  rail_end_card_cta_href: string
}

export default function ContentRailEditor({ label, items, renderCard, onEdit, onMove, onVisibility, endCard, onEndCardChange, onSaveEndCard }: {
  label: string
  items: any[]
  renderCard: (item: any) => ReactNode
  onEdit: (item: any) => void
  onMove: (index: number, direction: -1 | 1) => void
  onVisibility: (item: any) => void
  endCard: RailEndCardConfig
  onEndCardChange: (patch: Partial<RailEndCardConfig>) => void
  onSaveEndCard: () => void
}) {
  return <section className="mt-8 border-t border-white/10 pt-8">
    <div className="mb-4"><h3 className="text-[18px] font-medium text-white">当前模块卡片组</h3><p className="mt-1 text-[12px] text-muted">顺序、显示状态和开发中尾卡在这里统一维护；单卡内容使用编辑按钮进入。</p></div>
    <div className="mb-5 space-y-2">{items.map((item, index) => <div key={item.id} className="flex flex-wrap items-center gap-2 bg-white/5 px-3 py-3 sm:flex-nowrap sm:gap-3 sm:px-4"><span className="w-7 text-[12px] text-muted">{String(index + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1 truncate text-[13px] text-white">{item.sku_code || item.name}</span><div className="ml-auto flex items-center"><button onClick={() => onMove(index, -1)} disabled={index === 0} className="flex h-11 w-10 items-center justify-center text-accent disabled:opacity-25" title="左移"><ArrowLeft size={15} /></button><button onClick={() => onMove(index, 1)} disabled={index === items.length - 1} className="flex h-11 w-10 items-center justify-center text-accent disabled:opacity-25" title="右移"><ArrowRight size={15} /></button><button onClick={() => onVisibility(item)} className="flex h-11 w-10 items-center justify-center text-accent" title={item.visibility === 'hidden' ? '显示' : '隐藏'}>{item.visibility === 'hidden' ? <EyeOff size={15} /> : <Eye size={15} />}</button><button onClick={() => onEdit(item)} className="flex h-11 w-10 items-center justify-center text-accent hover:text-white" title="编辑单卡"><Edit2 size={15} /></button></div></div>)}</div>
    <div className="public-preview hidden overflow-hidden bg-bg p-5 md:block"><HorizontalRail label={`${label}后台预览`}>{items.filter((item) => item.visibility !== 'hidden' && item.status !== 'archived').map(renderCard)}{endCard.rail_end_card_visible && <article className="flex snap-start items-end bg-white p-7"><div><p className="text-label text-secondary">IN DEVELOPMENT</p><h3 className="mt-3 text-h4 text-primary"><InlineMarkup text={endCard.rail_end_card_title} /></h3><p className="mt-3 text-body text-secondary"><InlineMarkup text={endCard.rail_end_card_description} /></p>{endCard.rail_end_card_cta_label && <span className="mt-6 inline-block text-[14px] underline underline-offset-4"><InlineMarkup text={endCard.rail_end_card_cta_label} /> →</span>}</div></article>}</HorizontalRail></div>
    <div className="mt-5 bg-dark p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><label className="text-[12px] uppercase text-secondary">开发中尾卡</label><button onClick={() => onEndCardChange({ rail_end_card_visible: !endCard.rail_end_card_visible })} className="min-h-11 text-[12px] text-accent">{endCard.rail_end_card_visible ? '当前显示' : '当前隐藏'}</button></div><div className="grid gap-4 md:grid-cols-2"><FormField label="标题" name="rail_end_title" markup="inline" value={endCard.rail_end_card_title} onChange={(event) => onEndCardChange({ rail_end_card_title: event.target.value })} /><FormField label="说明" name="rail_end_description" markup="inline" value={endCard.rail_end_card_description} onChange={(event) => onEndCardChange({ rail_end_card_description: event.target.value })} /><FormField label="CTA 文案" name="rail_end_cta" markup="inline" value={endCard.rail_end_card_cta_label} onChange={(event) => onEndCardChange({ rail_end_card_cta_label: event.target.value })} /><FormField label="CTA 链接" name="rail_end_href" value={endCard.rail_end_card_cta_href} onChange={(event) => onEndCardChange({ rail_end_card_cta_href: event.target.value })} /></div><div className="mt-4 flex justify-end"><SaveButton onClick={onSaveEndCard} size="sm">保存卡片组</SaveButton></div></div>
  </section>
}
