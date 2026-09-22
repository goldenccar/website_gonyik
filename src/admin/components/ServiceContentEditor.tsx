import type { TechnologyContentBlock } from '@/types'
import FormField from './FormField'
import ServiceImageField from './ServiceImageField'

export default function ServiceContentEditor({ blocks, onChange }: { blocks: TechnologyContentBlock[]; onChange: (blocks: TechnologyContentBlock[]) => void }) {
  const update = (index: number, block: TechnologyContentBlock) => onChange(blocks.map((item, i) => i === index ? block : item))
  return <div className="space-y-6">{blocks.map((block, index) => <fieldset key={block.key} className="space-y-4 border border-white/20 p-5">
    <legend className="px-2 text-sm">{block.title || block.key}</legend>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={!block.hidden} onChange={e => update(index, { ...block, hidden: !e.target.checked })} />显示此模块</label>
    <FormField label="模块标题" name={`${block.key}-title`} markup="inline" value={block.title} onChange={e => update(index, { ...block, title: e.target.value })} />
    {!['faq', 'guides'].includes(block.key) && <FormField label="模块说明" name={`${block.key}-body`} textarea rows={3} markup="inline" value={block.content} onChange={e => update(index, { ...block, content: e.target.value })} />}
    {['explanation', 'assets'].includes(block.key) && <>
      <ServiceImageField value={block.image_url || ''} onChange={image_url => update(index, { ...block, image_url })} />
      <FormField label="图片替代文本（不显示图注）" name={`${block.key}-alt`} value={block.caption || ''} onChange={e => update(index, { ...block, caption: e.target.value })} />
      {block.items?.map((item, itemIndex) => <div key={itemIndex} className="space-y-3 border-l border-white/20 pl-4">
        <FormField label="要点标题" name={`${block.key}-${itemIndex}-title`} value={item.title} onChange={e => update(index, { ...block, items: block.items?.map((entry, i) => i === itemIndex ? { ...entry, title: e.target.value } : entry) })} />
        <FormField label="要点说明" name={`${block.key}-${itemIndex}-body`} textarea rows={3} markup="inline" value={item.content} onChange={e => update(index, { ...block, items: block.items?.map((entry, i) => i === itemIndex ? { ...entry, content: e.target.value } : entry) })} />
        <button type="button" className="text-sm text-error" onClick={() => update(index, { ...block, items: block.items?.filter((_, i) => i !== itemIndex) })}>删除要点</button>
      </div>)}
      {(block.items?.length || 0) < 8 && <button type="button" className="text-sm text-accent" onClick={() => update(index, { ...block, items: [...(block.items || []), { title: '', content: '' }] })}>添加要点</button>}
    </>}
    {block.key === 'contact' && <>
      {block.links?.map((link, linkIndex) => <div key={linkIndex} className="grid gap-3 sm:grid-cols-2">
        <FormField label="按钮文字" name={`${block.key}-${linkIndex}-label`} value={link.label} onChange={e => update(index, { ...block, links: block.links?.map((item, i) => i === linkIndex ? { ...item, label: e.target.value } : item) })} />
        <FormField label="按钮地址（留空隐藏）" name={`${block.key}-${linkIndex}-href`} value={link.href} onChange={e => update(index, { ...block, links: block.links?.map((item, i) => i === linkIndex ? { ...item, href: e.target.value } : item) })} />
      </div>)}
      {!block.links?.length && <button type="button" className="text-sm text-accent" onClick={() => update(index, { ...block, links: [{ label: '', href: '' }] })}>添加按钮</button>}
    </>}
  </fieldset>)}</div>
}
