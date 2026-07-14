import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Edit2, Image, Plus, Trash2, Upload, X } from 'lucide-react'
import api, { getContentSections, uploadFile } from '@/api/client'
import type { FluorineSection } from '@/types'
import TechnologyDetail from '@/components/TechnologyDetail'
import Dashboard from './Dashboard'
import ImageCropper from './ImageCropper'
import AdminHeader from './components/AdminHeader'
import FormField from './components/FormField'
import Modal from './components/Modal'
import PrimaryButton from './components/PrimaryButton'
import SaveCancelButtons from './components/SaveCancelButtons'
import ResponsiveAdminList from './components/ResponsiveAdminList'

type SectionDraft = Pick<FluorineSection, 'title' | 'subtitle' | 'content' | 'image_url' | 'image_fit'> & { id?: number }

const EMPTY_SECTION: SectionDraft = {
  title: '',
  subtitle: '',
  content: '',
  image_url: null,
  image_fit: 'cover',
}

export default function AdminFluorineManager() {
  const [sections, setSections] = useState<FluorineSection[]>([])
  const [draft, setDraft] = useState<SectionDraft | null>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const response = await getContentSections('pfas-free-innovation')
      setSections(response.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const closeEditor = () => {
    if (cropSource) URL.revokeObjectURL(cropSource)
    setCropSource(null)
    setDraft(null)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft?.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        content: draft.content,
        image_url: draft.image_url,
        image_fit: draft.image_fit,
      }
      await api[draft.id ? 'put' : 'post'](`/admin/content-sections/pfas-free-innovation${draft.id ? `/${draft.id}` : ''}`, payload)
      closeEditor()
      setMessage('技术模块已保存')
      await load()
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
      setMessage('顺序已更新')
    } catch {
      setSections(previous)
      setMessage('排序失败，请重试')
    }
  }

  const startCrop = (file: File) => {
    if (cropSource) URL.revokeObjectURL(cropSource)
    setCropSource(URL.createObjectURL(file))
  }

  const cancelCrop = () => {
    if (cropSource) URL.revokeObjectURL(cropSource)
    setCropSource(null)
  }

  const applyCrop = async (blob: Blob) => {
    if (!draft) return
    setUploading(true)
    try {
      const file = new File([blob], `technology-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const response = await uploadFile(file)
      const url = response.data.url || response.data.data?.url
      setDraft({ ...draft, image_url: url })
    } finally {
      setUploading(false)
      cancelCrop()
    }
  }

  const previewSection: FluorineSection | null = draft ? {
    id: draft.id || 0,
    page_key: 'pfas-free-innovation',
    order_index: 0,
    ...draft,
  } : null

  return (
    <Dashboard>
      <div className="max-w-[1200px]">
        <AdminHeader
          title="技术创新内容管理"
          action={<PrimaryButton onClick={() => setDraft({ ...EMPTY_SECTION })} icon={<Plus size={16} />}>新增模块</PrimaryButton>}
        />

        {message && <p className="mb-4 text-[13px] text-success">{message}</p>}

        <div className="overflow-hidden bg-dark">
          {loading ? (
            <p className="p-8 text-center text-[13px] text-accent">加载中...</p>
          ) : sections.length === 0 ? (
            <p className="p-8 text-center text-[13px] text-accent">暂无技术模块</p>
          ) : <ResponsiveAdminList items={sections} getKey={(section) => section.id} renderTitle={(section) => section.title} renderSubtitle={(section) => section.subtitle || '未填写副标题'} renderActions={(section) => { const index = sections.findIndex((item) => item.id === section.id); return <><button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="上移" aria-label={`上移${section.title}`} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white disabled:opacity-25"><ArrowUp size={15} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === sections.length - 1} title="下移" aria-label={`下移${section.title}`} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white disabled:opacity-25"><ArrowDown size={15} /></button><button type="button" onClick={() => setDraft({ ...section })} title="编辑" aria-label={`编辑${section.title}`} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white"><Edit2 size={15} /></button><button type="button" onClick={() => remove(section)} title="删除" aria-label={`删除${section.title}`} className="flex h-11 w-9 items-center justify-center text-error hover:text-white"><Trash2 size={15} /></button></> }} />}
        </div>
      </div>

      {draft && previewSection && (
        <Modal title={draft.id ? '编辑技术模块' : '新增技术模块'} onClose={closeEditor} maxWidth="max-w-[1100px]">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="标题" name="title" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              <FormField label="副标题" name="subtitle" value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} />
            </div>

            <FormField label="正文内容" name="content" textarea rows={7} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })}>
              <p className="mt-1.5 text-[11px] leading-5 text-muted">支持 &lt;b&gt;重点&lt;/b&gt;、&lt;i&gt;引用&lt;/i&gt;、&lt;note&gt;备注&lt;/note&gt; 和 /h 分段。</p>
            </FormField>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="text-[12px] uppercase text-secondary">配图</label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted">显示模式</span>
                  <select value={draft.image_fit} onChange={(event) => setDraft({ ...draft, image_fit: event.target.value as 'cover' | 'contain' })} className="border border-borderDark bg-dark px-2 py-1 text-[12px] text-white outline-none">
                    <option value="cover">填满裁剪</option>
                    <option value="contain">完整显示</option>
                  </select>
                </div>
              </div>

              {cropSource ? (
                <ImageCropper src={cropSource} onComplete={applyCrop} onCancel={cancelCrop} />
              ) : draft.image_url ? (
                <div className="relative h-[220px] overflow-hidden bg-white/5">
                  <img src={draft.image_url} alt="技术模块预览" className={`h-full w-full ${draft.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                  <button type="button" onClick={() => setDraft({ ...draft, image_url: null })} title="移除图片" aria-label="移除图片" className="absolute right-2 top-2 bg-black/70 p-2 text-white hover:bg-black"><X size={15} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => document.getElementById('technology-image-file')?.click()} className="flex h-[150px] w-full flex-col items-center justify-center border border-dashed border-borderDark text-accent hover:border-white/30 hover:text-white">
                  <Image size={28} /><span className="mt-2 text-[12px]">上传模块配图</span>
                </button>
              )}

              <input id="technology-image-file" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) startCrop(file); event.currentTarget.value = '' }} />
              {!cropSource && <div className="mt-3 flex justify-end"><PrimaryButton onClick={() => document.getElementById('technology-image-file')?.click()} size="sm" loading={uploading} icon={<Upload size={14} />}>{draft.image_url ? '更换图片' : '上传图片'}</PrimaryButton></div>}
              <FormField className="mt-3" label="图片 URL" name="image_url" value={draft.image_url || ''} onChange={(event) => setDraft({ ...draft, image_url: event.target.value || null })} placeholder="也可以直接填写媒体库图片地址" />
            </div>

            <div>
              <label className="mb-2 block text-[12px] uppercase text-secondary">前台预览</label>
              <div className="public-preview bg-bg p-6"><TechnologyDetail section={previewSection} /></div>
            </div>

            <SaveCancelButtons onCancel={closeEditor} loading={saving} submitLabel={draft.id ? '保存修改' : '新增模块'} />
          </form>
        </Modal>
      )}
    </Dashboard>
  )
}
