import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Edit2, Plus, Trash2 } from 'lucide-react'
import api, { getContentSections } from '@/api/client'
import { getServiceModuleDefinition, isServiceModuleType, SERVICE_MODULE_DEFINITIONS, type ServiceModuleType } from '@/config/serviceModules'
import type { ContentSection } from '@/types'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import FormField from './components/FormField'
import Modal from './components/Modal'
import PrimaryButton from './components/PrimaryButton'
import ResponsiveAdminList from './components/ResponsiveAdminList'
import SaveCancelButtons from './components/SaveCancelButtons'
import ServiceCollectionEditor from './components/ServiceCollectionEditor'

export default function AdminServiceManager() {
  const [sections, setSections] = useState<ContentSection[]>([])
  const [activeModuleType, setActiveModuleType] = useState<ServiceModuleType | null>(null)
  const [sectionDraft, setSectionDraft] = useState<ContentSection | null>(null)
  const [newModuleType, setNewModuleType] = useState<ServiceModuleType | ''>('')

  const loadSections = async () => {
    const response = await getContentSections('services')
    setSections(response.data.data || [])
  }

  useEffect(() => { loadSections() }, [])

  const contentSections = useMemo(() => sections.filter((section) => {
    const definition = getServiceModuleDefinition(section.module_type)
    return definition?.collection
  }), [sections])

  useEffect(() => {
    if (activeModuleType && contentSections.some((section) => section.module_type === activeModuleType)) return
    const firstType = contentSections[0]?.module_type
    setActiveModuleType(isServiceModuleType(firstType) ? firstType : null)
  }, [activeModuleType, contentSections])

  const availableDefinitions = SERVICE_MODULE_DEFINITIONS.filter((definition) => !sections.some((section) => section.module_type === definition.type))

  const saveSection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sectionDraft) return
    await api.put(`/admin/content-sections/services/${sectionDraft.id}`, {
      nav_label: sectionDraft.nav_label,
      eyebrow: sectionDraft.eyebrow,
      title: sectionDraft.title,
      subtitle: sectionDraft.subtitle,
    })
    await loadSections()
    setSectionDraft(null)
  }

  const addModule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const definition = getServiceModuleDefinition(newModuleType)
    if (!definition) return
    await api.post('/admin/content-sections/services', {
      section_key: definition.sectionKey,
      module_type: definition.type,
      nav_label: definition.label,
      eyebrow: definition.eyebrow,
      title: definition.title,
      subtitle: definition.subtitle,
    })
    setNewModuleType('')
    await loadSections()
  }

  const removeModule = async (section: ContentSection) => {
    if (!confirm(`确定移除“${section.nav_label || section.title}”模块？模块的内容数据会保留。`)) return
    await api.delete(`/admin/content-sections/services/${section.id}`)
    await loadSections()
  }

  const moveModule = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= sections.length) return
    const ordered = [...sections]
    ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
    setSections(ordered)
    await api.put('/admin/content-section-order/services', { ordered_ids: ordered.map((section) => section.id) })
  }

  return <Dashboard>
    <AdminHeader title="服务与支持管理" />
    <section className="mb-8 bg-dark">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-[15px] font-medium text-white">页面模块</h2><p className="mt-1 text-[12px] text-muted">控制前台模块顺序、目录名称、章节标题与说明。</p></div>
        {availableDefinitions.length > 0 && <PrimaryButton size="sm" onClick={() => setNewModuleType(availableDefinitions[0].type)} icon={<Plus size={14} />}>添加模块</PrimaryButton>}
      </div>
      <ResponsiveAdminList items={sections} getKey={(section) => section.id} emptyLabel="暂无页面模块" renderTitle={(section) => section.nav_label || section.title} renderSubtitle={(section) => `${getServiceModuleDefinition(section.module_type)?.label || '未知模块'} · ${section.title}`} renderActions={(section) => {
        const index = sections.findIndex((item) => item.id === section.id)
        return <><button type="button" disabled={index === 0} onClick={() => moveModule(index, -1)} className="flex h-11 w-9 items-center justify-center text-accent disabled:opacity-25" aria-label="上移"><ArrowUp size={15} /></button><button type="button" disabled={index === sections.length - 1} onClick={() => moveModule(index, 1)} className="flex h-11 w-9 items-center justify-center text-accent disabled:opacity-25" aria-label="下移"><ArrowDown size={15} /></button><button type="button" onClick={() => setSectionDraft({ ...section })} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white" aria-label="编辑标题"><Edit2 size={15} /></button><button type="button" onClick={() => removeModule(section)} className="flex h-11 w-9 items-center justify-center text-error hover:text-white" aria-label="移除模块"><Trash2 size={15} /></button></>
      }} />
    </section>

    {contentSections.length > 0 && <>
      <div className="gonyik-rail mb-6 flex overflow-x-auto border-b border-white/10">
        {contentSections.map((section) => isServiceModuleType(section.module_type) && <button key={section.id} type="button" onClick={() => setActiveModuleType(section.module_type as ServiceModuleType)} className={`shrink-0 border-b-2 px-5 py-3 text-[13px] ${activeModuleType === section.module_type ? 'border-accentWarm text-white' : 'border-transparent text-accent'}`}>{section.nav_label || section.title}</button>)}
      </div>
      {activeModuleType && <ServiceCollectionEditor key={activeModuleType} moduleType={activeModuleType} />}
    </>}

    {newModuleType && <Modal title="添加页面模块" onClose={() => setNewModuleType('')}><form onSubmit={addModule} className="space-y-4"><label className="block"><span className="mb-2 block text-[12px] text-accent">模块类型</span><select value={newModuleType} onChange={(event) => setNewModuleType(event.target.value as ServiceModuleType)} className="min-h-11 w-full border border-white/20 bg-panel px-3 text-[14px] text-white">{availableDefinitions.map((definition) => <option key={definition.type} value={definition.type}>{definition.label}</option>)}</select></label><p className="text-[12px] leading-5 text-muted">添加后可单独编辑目录名称、章节标题和说明。</p><SaveCancelButtons onCancel={() => setNewModuleType('')} /></form></Modal>}
    {sectionDraft && <Modal title="编辑页面模块" onClose={() => setSectionDraft(null)}><form onSubmit={saveSection} className="space-y-4"><FormField label="目录名称" name="nav_label" required value={sectionDraft.nav_label || ''} onChange={(event) => setSectionDraft({ ...sectionDraft, nav_label: event.target.value })} /><FormField label="英文标签" name="eyebrow" value={sectionDraft.eyebrow || ''} onChange={(event) => setSectionDraft({ ...sectionDraft, eyebrow: event.target.value })} /><FormField label="章节标题" name="title" required value={sectionDraft.title} onChange={(event) => setSectionDraft({ ...sectionDraft, title: event.target.value })} /><FormField label="章节说明" name="subtitle" textarea rows={3} value={sectionDraft.subtitle || ''} onChange={(event) => setSectionDraft({ ...sectionDraft, subtitle: event.target.value })} /><SaveCancelButtons onCancel={() => setSectionDraft(null)} /></form></Modal>}
  </Dashboard>
}
