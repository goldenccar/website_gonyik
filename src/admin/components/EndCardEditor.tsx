import FormField from './FormField'
import SaveButton from './SaveButton'
import type { RailEndCardConfig } from '@/components/RailEndCard'

export default function EndCardEditor({ config, onChange, onSave, title = '开发中提示' }: {
  config: RailEndCardConfig
  onChange: (patch: Partial<RailEndCardConfig>) => void
  onSave: () => void
  title?: string
}) {
  return <section className="mt-8 border-t border-white/10 pt-8">
    <div className="bg-dark p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div><h3 className="text-[16px] font-medium text-white">{title}</h3><p className="mt-1 text-[12px] text-muted">维护前台内容列表末尾的开发中提示。</p></div>
        <button type="button" onClick={() => onChange({ rail_end_card_visible: !config.rail_end_card_visible })} className="min-h-11 text-[12px] text-accent">{config.rail_end_card_visible ? '当前显示' : '当前隐藏'}</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="标题" name="rail_end_title" markup="inline" value={config.rail_end_card_title} onChange={(event) => onChange({ rail_end_card_title: event.target.value })} />
        <FormField label="说明" name="rail_end_description" markup="inline" value={config.rail_end_card_description} onChange={(event) => onChange({ rail_end_card_description: event.target.value })} />
        <FormField label="CTA 文案" name="rail_end_cta" markup="inline" value={config.rail_end_card_cta_label} onChange={(event) => onChange({ rail_end_card_cta_label: event.target.value })} />
        <FormField label="CTA 链接" name="rail_end_href" value={config.rail_end_card_cta_href} onChange={(event) => onChange({ rail_end_card_cta_href: event.target.value })} />
      </div>
      <div className="mt-4 flex justify-end"><SaveButton onClick={onSave} size="sm">保存提示</SaveButton></div>
    </div>
  </section>
}
