import { useEffect, useMemo, useState } from 'react'
import { Globe2, Plus, Trash2 } from 'lucide-react'
import { getAdminMarkets, updateAdminMarkets } from '@/api/client'
import { SITE_LOCALES, type MarketVisibility, type SiteMarket } from '@/config/markets'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import SaveButton from './components/SaveButton'

interface VisibilityRow {
  id?: number
  page_key?: string
  title: string
  market_visibility: Record<string, MarketVisibility>
}

const VISIBILITY_OPTIONS: Array<{ value: MarketVisibility; label: string }> = [
  { value: 'inherit', label: '跟随地区默认' },
  { value: 'public', label: '公开' },
  { value: 'hidden', label: '隐藏' },
]

export default function MarketManager() {
  const [markets, setMarkets] = useState<SiteMarket[]>([])
  const [pages, setPages] = useState<VisibilityRow[]>([])
  const [sections, setSections] = useState<VisibilityRow[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = () => getAdminMarkets().then((response) => {
    setMarkets(response.data.data.markets || [])
    setPages(response.data.data.pages || [])
    setSections(response.data.data.sections || [])
  })

  useEffect(() => { load() }, [])

  const enabledMarkets = useMemo(() => markets.filter((market) => market.enabled), [markets])

  const updateMarket = (index: number, patch: Partial<SiteMarket>) => setMarkets((current) => current.map((item, itemIndex) => {
    if (itemIndex !== index) return patch.is_default ? { ...item, is_default: false } : item
    return { ...item, ...patch }
  }))

  const addMarket = () => setMarkets((current) => [...current, {
    code: `market-${current.length + 1}`,
    label: '新地区',
    locale: 'en',
    enabled: true,
    default_visibility: 'public',
    order_index: current.length,
  }])

  const updateVisibility = (kind: 'page' | 'section', index: number, code: string, value: MarketVisibility) => {
    const setter = kind === 'page' ? setPages : setSections
    setter((current) => current.map((row, rowIndex) => rowIndex === index
      ? { ...row, market_visibility: { ...row.market_visibility, [code]: value } }
      : row))
  }

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      await updateAdminMarkets({
        markets,
        page_visibility: Object.fromEntries(pages.map((page) => [page.page_key, page.market_visibility])),
        section_visibility: Object.fromEntries(sections.map((section) => [String(section.id), section.market_visibility])),
      })
      setMessage('地区、语言与内容开放规则已保存')
      await load()
    } catch (error: any) {
      setMessage(error?.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const visibilityTable = (title: string, description: string, rows: VisibilityRow[], kind: 'page' | 'section') => <section className="mt-8 border border-white/10 bg-dark">
    <div className="border-b border-white/10 p-5">
      <h2 className="text-[18px] font-semibold text-white">{title}</h2>
      <p className="mt-1 text-[12px] leading-5 text-muted">{description}</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead><tr className="border-b border-white/10 text-[11px] tracking-[0.08em] text-muted"><th className="px-5 py-3 font-medium">内容</th>{enabledMarkets.map((market) => <th key={market.code} className="px-3 py-3 font-medium">{market.label}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.page_key || row.id} className="border-b border-white/[0.07] last:border-0"><th className="px-5 py-4 text-[13px] font-medium text-white/85">{row.title}</th>{enabledMarkets.map((market) => <td key={market.code} className="px-3 py-3"><select value={row.market_visibility?.[market.code] || 'inherit'} onChange={(event) => updateVisibility(kind, index, market.code, event.target.value as MarketVisibility)} className="min-h-10 w-full border border-white/10 bg-white/5 px-2 text-[12px] text-white outline-none focus:border-accent">{VISIBILITY_OPTIONS.map((option) => <option key={option.value} value={option.value} className="bg-dark">{option.label}</option>)}</select></td>)}</tr>)}</tbody>
      </table>
    </div>
  </section>

  return <Dashboard>
    <div className="max-w-[1180px]">
      <AdminHeader title="地区、语言与内容开放" action={<SaveButton onClick={save} loading={saving} />} />
      <div className="mb-5 flex items-start gap-3 border border-white/10 bg-white/[0.03] p-4 text-[12px] leading-5 text-muted"><Globe2 className="mt-0.5 shrink-0 text-accent" size={17} /><p>前台只选择地区；每个地区固定加载一种语言。内容本体继续共用，通过下方规则决定各地区是否展示，不复制页面结构或 SKU 数据。</p></div>
      {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
      <section className="border border-white/10 bg-dark">
        <div className="flex items-center justify-between border-b border-white/10 p-5"><div><h2 className="text-[18px] font-semibold text-white">地区与默认语言</h2><p className="mt-1 text-[12px] text-muted">地区代码用于公开网址；已经上线后不建议改动。</p></div><button type="button" onClick={addMarket} className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-3 text-[12px] text-white/80 hover:border-accent"><Plus size={15} />新增地区</button></div>
        <div className="space-y-3 p-5">{markets.map((item, index) => <div key={`${item.code}-${index}`} className="grid gap-3 border border-white/10 bg-white/[0.025] p-4 md:grid-cols-[150px_1fr_150px_130px_110px_auto] md:items-end">
          <label className="text-[11px] text-muted">地区代码<input value={item.code} onChange={(event) => updateMarket(index, { code: event.target.value })} className="mt-1.5 min-h-10 w-full border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-accent" /></label>
          <label className="text-[11px] text-muted">前台名称<input value={item.label} onChange={(event) => updateMarket(index, { label: event.target.value })} className="mt-1.5 min-h-10 w-full border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-accent" /></label>
          <label className="text-[11px] text-muted">默认语言<select value={item.locale} onChange={(event) => updateMarket(index, { locale: event.target.value as SiteMarket['locale'] })} className="mt-1.5 min-h-10 w-full border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-accent">{SITE_LOCALES.map((locale) => <option key={locale} value={locale} className="bg-dark">{locale}</option>)}</select></label>
          <label className="text-[11px] text-muted">默认开放<select value={item.default_visibility} onChange={(event) => updateMarket(index, { default_visibility: event.target.value as 'public' | 'hidden' })} className="mt-1.5 min-h-10 w-full border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-accent"><option value="public" className="bg-dark">公开</option><option value="hidden" className="bg-dark">隐藏</option></select></label>
          <div className="flex min-h-10 flex-col justify-center gap-1 text-[12px] text-white/75"><label><input type="checkbox" checked={item.enabled} onChange={(event) => updateMarket(index, { enabled: event.target.checked })} /> 启用</label><label><input type="radio" name="default-market" checked={Boolean(item.is_default)} onChange={() => updateMarket(index, { is_default: true })} /> 默认</label></div>
          <button type="button" aria-label="删除地区" disabled={Boolean(item.is_default) || markets.length <= 1} onClick={() => setMarkets((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="grid size-10 place-items-center border border-white/10 text-white/50 hover:border-red-400/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-25"><Trash2 size={15} /></button>
        </div>)}</div>
      </section>
      {visibilityTable('页面开放范围', '隐藏后，该地区的 Header 与 Mega Menu 不再显示入口，页面接口也不再返回页面配置。', pages, 'page')}
      {visibilityTable('材料科技内容开放范围', '可按地区隐藏尚未开放的技术页面；其他地区仍复用同一内容记录。', sections, 'section')}
    </div>
  </Dashboard>
}
