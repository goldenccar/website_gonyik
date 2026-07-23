import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Edit2, Plus, Trash2 } from 'lucide-react'
import api, { uploadFile } from '@/api/client'
import type { FluorineSection } from '@/types'
import TechnologyDetail from '@/components/TechnologyDetail'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import FormField from './components/FormField'
import Modal from './components/Modal'
import PrimaryButton from './components/PrimaryButton'
import SaveCancelButtons from './components/SaveCancelButtons'
import ResponsiveAdminList from './components/ResponsiveAdminList'
import CroppedImageField, { type CroppedImageChange } from './components/CroppedImageField'

type SectionDraft = Pick<FluorineSection, 'title' | 'subtitle' | 'content' | 'image_url' | 'image_fit' | 'nav_label' | 'status'> & { id?: number }

const EMPTY_SECTION: SectionDraft = {
  title: '',
  nav_label: '',
  subtitle: '',
  content: '',
  image_url: null,
  image_fit: 'cover',
  status: 'draft',
}

function effectiveStatus(section: Pick<FluorineSection, 'status'>) {
  return section.status === 'draft' ? 'draft' : 'published'
}

function layoutLabel(index: number) {
  if (index === 0) return '总述 · 文字左 / 图片右'
  return index % 2 === 1 ? '图片左 / 文字右' : '文字左 / 图片右'
}

export default function AdminFluorineManager() {
  const [sections, setSections] = useState<FluorineSection[]>([])
  const [draft, setDraft] = useState<SectionDraft | null>(null)
  const [imageChange, setImageChange] = useState<CroppedImageChange>({ file: null, removeCurrent: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/content-sections/pfas-free-innovation')
      setSections(response.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openEditor = (section?: FluorineSection) => {
    setDraft(section ? { ...section, status: effectiveStatus(section) } : { ...EMPTY_SECTION })
    setImageChange({ file: null, removeCurrent: false })
    setFormError('')
  }

  const closeEditor = () => {
    setDraft(null)
    setImageChange({ file: null, removeCurrent: false })
    setFormError('')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft?.title.trim()) return
    setSaving(true)
    setFormError('')
    try {
      let imageUrl = imageChange.removeCurrent ? null : draft.image_url
      if (imageChange.file) {
        const response = await uploadFile(imageChange.file)
        imageUrl = response.data.url || response.data.data?.url
      }
      const payload = {
        title: draft.title.trim(),
        nav_label: draft.nav_label?.trim() || draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        content: draft.content,
        image_url: imageUrl,
        image_fit: draft.image_fit,
        status: draft.status || 'draft',
      }
      await api[draft.id ? 'put' : 'post'](`/admin/content-sections/pfas-free-innovation${draft.id ? `/${draft.id}` : ''}`, payload)
      closeEditor()
      setMessage('技术模块已保存')
      await load()
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '保存失败，请检查内容后重试')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (section: FluorineSection) => {
    if (!confirm(`确定删除“${section.title}”？`)) return
    await api.delete(`/admin/content-sections/pfas-free-innovation/${section.id}`)
    setMessage('技术模块已删除')
    load()
  }

  const move = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= sections.length) return
    const previous = sections
    const next = [...sections]
    const [moved] = next.splice(index, 1)
    next.splice(newIndex, 0, moved)
    setSections(next)
    try {
      await api.put('/admin/content-section-order/pfas-free-innovation', { ordered_ids: next.map((section) => section.id) })
      setMessage('顺序及前台交错方向已更新')
    } catch {
      setSections(previous)
      setMessage('排序失败，请重试')
    }
  }

  const previewSection: FluorineSection | null = draft ? {
    id: draft.id || 0,
    page_key: 'pfas-free-innovation',
    order_index: draft.id ? Math.max(0, sections.findIndex((section) => section.id === draft.id)) : sections.length,
    ...draft,
  } : null

  return (
    <Dashboard>
      <div className="max-w-[1200px]">
        <AdminHeader
          title="技术创新内容管理"
          action={<PrimaryButton onClick={() => openEditor()} icon={<Plus size={16} />}>新增模块</PrimaryButton>}
        />

        {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
        <div className="mb-5 border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] leading-5 text-muted">
          模块按列表顺序自动生成顶部目录与左右交错布局。首项使用总述版式；后续模块无需手工选择图片方向。
        </div>

        <div className="overflow-hidden bg-dark">
          {loading ? (
            <p className="p-8 text-center text-[13px] text-accent">加载中...</p>
          ) : sections.length === 0 ? (
            <p className="p-8 text-center text-[13px] text-accent">暂无技术模块</p>
          ) : <ResponsiveAdminList
            items={sections}
            getKey={(section) => section.id}
            renderTitle={(section) => <span className="flex flex-wrap items-center gap-2"><span>{section.title}</span><span className={`px-2 py-0.5 text-[10px] ${effectiveStatus(section) === 'published' ? 'bg-success/15 text-success' : 'bg-white/10 text-muted'}`}>{effectiveStatus(section) === 'published' ? '已发布' : '草稿'}</span></span>}
            renderSubtitle={(section) => {
              const index = sections.findIndex((item) => item.id === section.id)
              return `${section.nav_label || section.title} · ${layoutLabel(index)}`
            }}
            renderActions={(section) => {
              const index = sections.findIndex((item) => item.id === section.id)
              return <>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="上移" aria-label={`上移${section.title}`} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white disabled:opacity-25"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === sections.length - 1} title="下移" aria-label={`下移${section.title}`} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white disabled:opacity-25"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => openEditor(section)} title="编辑" aria-label={`编辑${section.title}`} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white"><Edit2 size={15} /></button>
                <button type="button" onClick={() => remove(section)} title="删除" aria-label={`删除${section.title}`} className="flex h-11 w-9 items-center justify-center text-error hover:text-white"><Trash2 size={15} /></button>
              </>
            }}
          />}
        </div>
      </div>

      {draft && previewSection && (
        <Modal title={draft.id ? '编辑技术模块' : '新增技术模块'} onClose={closeEditor} maxWidth="max-w-[1100px]">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="目录名称" name="nav_label" required markup="inline" value={draft.nav_label || ''} onChange={(event) => setDraft({ ...draft, nav_label: event.target.value })} />
              <FormField label="标题" name="title" required markup="inline" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              <FormField className="sm:col-span-2" label="副标题" name="subtitle" markup="inline" value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} />
              <FormField label="发布状态" name="status" select value={draft.status || 'draft'} onChange={(event) => setDraft({ ...draft, status: event.target.value as 'draft' | 'published' })} options={[{ value: 'draft', label: '草稿（前台不可见）' }, { value: 'published', label: '已发布' }]} />
              <FormField label="图片显示" name="image_fit" select value={draft.image_fit} onChange={(event) => setDraft({ ...draft, image_fit: event.target.value as 'cover' | 'contain' })} options={[{ value: 'cover', label: '填满裁切' }, { value: 'contain', label: '完整显示' }]} />
            </div>

            <FormField label="正文内容" name="content" textarea rows={7} markup="block" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} />

            <CroppedImageField
              key={draft.id || 'new'}
              label="模块配图"
              currentSrc={draft.image_url}
              aspect={4 / 3}
              fileBaseName={`technology-${draft.id || 'new'}`}
              fit={draft.image_fit === 'contain' ? 'contain' : 'cover'}
              onChange={setImageChange}
              help="桌面端按 4:3 显示；新模块发布前必须配置图片，草稿可暂不上传。"
            />
            <FormField label="图片 URL（高级）" name="image_url" value={draft.image_url || ''} onChange={(event) => { setDraft({ ...draft, image_url: event.target.value || null }); setImageChange({ file: null, removeCurrent: false }) }} placeholder="也可以填写媒体库中的图片地址" />

            <div>
              <label className="mb-2 block text-[12px] uppercase text-secondary">前台版式预览</label>
              <div className="public-preview bg-bg p-6"><TechnologyDetail section={previewSection} index={previewSection.order_index} /></div>
            </div>

            {formError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{formError}</p>}
            <SaveCancelButtons onCancel={closeEditor} loading={saving} submitLabel={draft.id ? '保存修改' : '新增模块'} />
          </form>
        </Modal>
      )}
    </Dashboard>
  )
}
