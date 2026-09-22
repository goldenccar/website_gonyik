import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Edit2 } from 'lucide-react'
import api from '@/api/client'
import { isServiceModuleType, type ServiceModuleType } from '@/config/serviceModules'
import type { ContentSection } from '@/types'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import FormField from './components/FormField'
import Modal from './components/Modal'
import ResponsiveAdminList from './components/ResponsiveAdminList'
import SaveCancelButtons from './components/SaveCancelButtons'
import ServiceCollectionEditor from './components/ServiceCollectionEditor'
import ServiceContentEditor from './components/ServiceContentEditor'

export default function AdminServiceManager() {
  const [sections, setSections] = useState<ContentSection[]>([])
  const [activeModuleType, setActiveModuleType] = useState<ServiceModuleType>('material-care')
  const [sectionDraft, setSectionDraft] = useState<ContentSection | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadSections = async () => {
    const response = await api.get('/admin/content-sections/services')
    setSections((response.data.data || []).filter((section: ContentSection) => isServiceModuleType(section.module_type)))
  }

  useEffect(() => { loadSections() }, [])

  const activeSection = useMemo(() => sections.find((section) => section.module_type === activeModuleType), [activeModuleType, sections])

  useEffect(() => {
    if (activeSection) return
    const firstType = sections[0]?.module_type
    if (isServiceModuleType(firstType)) setActiveModuleType(firstType)
  }, [activeSection, sections])

  const saveSection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sectionDraft) return
    setSaving(true)
    setError('')
    try {
      await api.put(`/admin/content-sections/services/${sectionDraft.id}`, {
        nav_label: sectionDraft.nav_label,
        title: sectionDraft.title,
        subtitle: sectionDraft.subtitle,
        content: sectionDraft.content,
        content_blocks: sectionDraft.content_blocks,
        status: sectionDraft.status || 'published',
      })
      await loadSections()
      setSectionDraft(null)
    } catch { setError('保存失败，请重试。') } finally { setSaving(false) }
  }

  const moveModule = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= sections.length) return
    const ordered = [...sections]
    ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
    setSections(ordered)
    await api.put('/admin/content-section-order/services', { ordered_ids: ordered.map((section) => section.id) })
  }

  return (
    <Dashboard>
      <AdminHeader title="服务与支持管理" />
      <section className="mb-8 bg-dark">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-[15px] font-medium text-white">服务页面</h2>
          <p className="mt-1 text-[12px] text-muted">三个页面共用服务 Hero。编辑页面可维护说明、图解、图片、数字面料要点及咨询入口；下方维护护理步骤和问答分组。</p>
        </div>
        <ResponsiveAdminList items={sections} getKey={(section) => section.id} emptyLabel="暂无服务页面" renderTitle={(section) => section.nav_label || section.title} renderSubtitle={(section) => `${section.status === 'draft' ? '草稿' : '已发布'} · ${section.title}`} renderActions={(section) => {
          const index = sections.findIndex((item) => item.id === section.id)
          return <>
            <button type="button" disabled={index === 0} onClick={() => moveModule(index, -1)} className="flex h-11 w-9 items-center justify-center text-accent disabled:opacity-25" aria-label="上移"><ArrowUp size={15} /></button>
            <button type="button" disabled={index === sections.length - 1} onClick={() => moveModule(index, 1)} className="flex h-11 w-9 items-center justify-center text-accent disabled:opacity-25" aria-label="下移"><ArrowDown size={15} /></button>
            <button type="button" onClick={() => setSectionDraft({ ...section })} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white" aria-label="编辑"><Edit2 size={15} /></button>
          </>
        }} />
      </section>

      <div className="gonyik-rail mb-6 flex overflow-x-auto border-b border-white/10">
        {sections.map((section) => isServiceModuleType(section.module_type) && (
          <button key={section.id} type="button" onClick={() => setActiveModuleType(section.module_type as ServiceModuleType)} className={`shrink-0 border-b-2 px-5 py-3 text-[13px] ${activeModuleType === section.module_type ? 'border-accentWarm text-white' : 'border-transparent text-accent'}`}>
            {section.nav_label || section.title}
          </button>
        ))}
      </div>

      {activeSection && activeModuleType === 'material-care' && <div className="space-y-6">
        <ServiceCollectionEditor endpoint="material-care-guides" kind="guide" itemLabel="材料建议" />
        <ServiceCollectionEditor endpoint="faqs" kind="faq" itemLabel="本页问答" category="material-care" />
      </div>}
      {activeSection && activeModuleType === 'garment-care' && <div className="space-y-6">
        <ServiceCollectionEditor endpoint="care-guides" kind="guide" itemLabel="洗涤步骤" />
        <ServiceCollectionEditor endpoint="faqs" kind="faq" itemLabel="本页问答" category="garment-care" />
      </div>}
      {activeSection && activeModuleType === 'digital-fabrics' && <ServiceCollectionEditor endpoint="digital-fabric-formats" kind="digital-format" itemLabel="软件格式" />}

      {sectionDraft && (
        <Modal title="编辑服务页面" onClose={() => setSectionDraft(null)} maxWidth="max-w-[1000px]">
          <form onSubmit={saveSection} className="space-y-4">
            <FormField label="导航名称" name="nav_label" required markup="inline" value={sectionDraft.nav_label || ''} onChange={(event) => setSectionDraft({ ...sectionDraft, nav_label: event.target.value })} />
            <FormField label="页面标题" name="title" required markup="inline" value={sectionDraft.title} onChange={(event) => setSectionDraft({ ...sectionDraft, title: event.target.value })} />
            <FormField label="页面说明" name="subtitle" textarea rows={3} markup="inline" value={sectionDraft.subtitle || ''} onChange={(event) => setSectionDraft({ ...sectionDraft, subtitle: event.target.value })} />
            <FormField label="补充提示" name="content" textarea rows={4} markup="block" value={sectionDraft.content || ''} onChange={(event) => setSectionDraft({ ...sectionDraft, content: event.target.value })} />
            <label className="block">
              <span className="mb-2 block text-[12px] text-accent">前台状态</span>
              <select value={sectionDraft.status || 'published'} onChange={(event) => setSectionDraft({ ...sectionDraft, status: event.target.value as 'draft' | 'published' })} className="min-h-11 w-full border border-white/20 bg-panel px-3 text-[14px] text-white">
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
              </select>
            </label>
            <ServiceContentEditor blocks={sectionDraft.content_blocks || []} onChange={content_blocks => setSectionDraft({ ...sectionDraft, content_blocks })} />
            {error && <p role="alert" className="text-error">{error}</p>}
            <SaveCancelButtons loading={saving} onCancel={() => setSectionDraft(null)} />
          </form>
        </Modal>
      )}
    </Dashboard>
  )
}
