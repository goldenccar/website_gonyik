import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ENGLISH_COPY } from '@/i18n/SiteLocale'
import { getAdminLocalizations, updateLocalizations } from '@/api/client'
import type { SiteLocale } from '@/config/markets'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import SaveButton from './components/SaveButton'

export default function LocalizationManager() {
  const [locale, setLocale] = useState<Exclude<SiteLocale, 'zh-CN'>>('en')
  const [sources, setSources] = useState<string[]>([])
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getAdminLocalizations(locale).then((response) => {
      const apiSources = response.data.data?.sources || []
      const stored = response.data.data?.translations || {}
      setSources(apiSources)
      setTranslations(Object.fromEntries(apiSources.map((source: string) => [
        source,
        stored[source] || (locale === 'en' ? ENGLISH_COPY[source] : '') || '',
      ])))
    })
  }, [locale])

  const visibleSources = useMemo(() => sources.filter((source) => {
    const translation = translations[source] || ''
    const matches = !query || source.toLowerCase().includes(query.toLowerCase()) || translation.toLowerCase().includes(query.toLowerCase())
    return matches && (!onlyMissing || !translation.trim())
  }), [onlyMissing, query, sources, translations])
  const completed = sources.filter((source) => translations[source]?.trim()).length

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      await updateLocalizations(locale, translations)
      setMessage('多语言内容已保存')
    } catch (error: any) {
      setMessage(error?.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return <Dashboard>
    <div className="max-w-[1180px]">
      <AdminHeader title="多语言内容" action={<SaveButton onClick={save} loading={saving} />} />
      <div className="mb-5 grid gap-3 border border-white/10 bg-white/[0.03] p-4 text-[12px] leading-5 text-muted md:grid-cols-[1fr_auto] md:items-center">
        <p>结构、图片、链接、SKU 编号与排序继续共用；这里只维护客户可见文字的目标语言版本。缺失时前台回退简体中文原文。</p>
        <p className="whitespace-nowrap text-white/75">已完成 {completed} / {sources.length}</p>
      </div>
      <div className="sticky top-0 z-10 mb-4 flex flex-col gap-3 border border-white/10 bg-dark/95 p-3 backdrop-blur md:flex-row md:items-center">
        <select value={locale} onChange={(event) => setLocale(event.target.value as Exclude<SiteLocale, 'zh-CN'>)} className="min-h-11 border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-accent"><option value="en" className="bg-dark">English</option><option value="zh-TW" className="bg-dark">繁體中文</option><option value="ja" className="bg-dark">日本語</option><option value="ko" className="bg-dark">한국어</option></select>
        <label className="flex min-h-11 flex-1 items-center gap-2 border border-white/10 bg-white/5 px-3 text-white/65">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索中文或英文" className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none" />
        </label>
        <label className="flex min-h-11 items-center gap-2 px-2 text-[13px] text-white/70">
          <input type="checkbox" checked={onlyMissing} onChange={(event) => setOnlyMissing(event.target.checked)} /> 只看未翻译
        </label>
      </div>
      {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
      <div className="space-y-3">
        {visibleSources.map((source) => <article key={source} className="grid gap-3 border border-white/10 bg-dark p-4 md:grid-cols-2 md:gap-5">
          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.14em] text-muted">中文原文</p>
            <p className="whitespace-pre-wrap text-[14px] leading-6 text-white/82">{source}</p>
          </div>
          <label>
            <span className="mb-2 block text-[10px] font-medium tracking-[0.14em] text-muted">{locale}</span>
            <textarea rows={Math.min(8, Math.max(2, Math.ceil(source.length / 42)))} value={translations[source] || ''} onChange={(event) => setTranslations((current) => ({ ...current, [source]: event.target.value }))} className="w-full resize-y border border-white/12 bg-white/5 px-3 py-2.5 text-[14px] leading-6 text-white outline-none focus:border-accent" />
          </label>
        </article>)}
      </div>
    </div>
  </Dashboard>
}
