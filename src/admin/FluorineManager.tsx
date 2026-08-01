import { useEffect, useState } from 'react'
import { Edit2 } from 'lucide-react'
import api, { uploadFile } from '@/api/client'
import type { FluorineSection, TechnologyContentBlock } from '@/types'
import { findTechnologyPage, getTechnologyGroupLabel, getTechnologyPagePath } from '@/config/technologyPages'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import AdminPagePreview from './components/AdminPagePreview'
import FormField from './components/FormField'
import Modal from './components/Modal'
import SaveCancelButtons from './components/SaveCancelButtons'
import ResponsiveAdminList from './components/ResponsiveAdminList'
import CroppedImageField, { type CroppedImageChange } from './components/CroppedImageField'

type SectionDraft = Pick<FluorineSection, 'section_key' | 'title' | 'subtitle' | 'content' | 'image_url' | 'image_fit' | 'nav_label' | 'status' | 'hero_statement' | 'hero_scroll_label' | 'content_blocks'> & { id: number; order_index: number }

function effectiveStatus(section: Pick<FluorineSection, 'status'>) {
  return section.status === 'draft' ? 'draft' : 'published'
}

export default function AdminFluorineManager() {
  const [sections, setSections] = useState<FluorineSection[]>([])
  const [draft, setDraft] = useState<SectionDraft | null>(null)
  const [imageChange, setImageChange] = useState<CroppedImageChange>({ file: null, removeCurrent: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [previewSectionKey, setPreviewSectionKey] = useState('')
  const [previewVersion, setPreviewVersion] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/content-sections/pfas-free-innovation')
      const nextSections = response.data.data || []
      setSections(nextSections)
      setPreviewSectionKey((current) => current || nextSections[0]?.section_key || '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openEditor = (section: FluorineSection) => {
    setDraft({ ...section, status: effectiveStatus(section) })
    setPreviewSectionKey(section.section_key || '')
    setImageChange({ file: null, removeCurrent: false })
    setFormError('')
  }

  const closeEditor = () => {
    setDraft(null)
    setImageChange({ file: null, removeCurrent: false })
    setFormError('')
  }

  const updateContentBlock = (index: number, next: TechnologyContentBlock) => {
    if (!draft) return
    const blocks = [...(draft.content_blocks || [])]
    blocks[index] = next
    setDraft({ ...draft, content_blocks: blocks })
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft?.id || !draft.title.trim()) return
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
        hero_statement: draft.hero_statement || '',
        hero_scroll_label: draft.hero_scroll_label || '',
        content_blocks: draft.content_blocks || [],
      }
      await api.put(`/admin/content-sections/pfas-free-innovation/${draft.id}`, payload)
      closeEditor()
      setMessage('技术页面已保存')
      await load()
      setPreviewVersion((value) => value + 1)
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '保存失败，请检查内容后重试')
    } finally {
      setSaving(false)
    }
  }

  const previewSection: FluorineSection | null = draft ? {
    page_key: 'pfas-free-innovation',
    ...draft,
  } : null
  const selectedPreview = sections.find((section) => section.section_key === previewSectionKey)

  return (
    <Dashboard>
      <div className="max-w-[1200px]">
        <AdminHeader
          title="技术页面管理"
        />

        {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
        <div className="mb-5 border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] leading-5 text-muted">
          技术创新入口直接进入“无氟技术体系”。下列页面共用 Hero、页面选择器、头图与正文结构；当前正文保留现有文案，后续可逐页完善。
        </div>

        {selectedPreview && <AdminPagePreview
          publicPath={getTechnologyPagePath(selectedPreview.section_key || '')}
          title={selectedPreview.title}
          version={previewVersion}
          helpText="预览使用真实技术详情页组件；进入编辑后，未保存的文案和图片也会实时同步到预览。"
        />}

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
              const definition = findTechnologyPage(section)
              return `${getTechnologyGroupLabel(section)} · ${definition?.menuLabel || section.nav_label || section.title} · ${getTechnologyPagePath(section.section_key || '')}`
            }}
            renderActions={(section) => {
              return <>
                <button type="button" onClick={() => setPreviewSectionKey(section.section_key || '')} title="预览" aria-label={`预览${section.title}`} className="flex h-11 items-center justify-center px-3 text-[12px] text-accent hover:text-white">预览</button>
                <button type="button" onClick={() => openEditor(section)} title="编辑" aria-label={`编辑${section.title}`} className="flex h-11 w-9 items-center justify-center text-accent hover:text-white"><Edit2 size={15} /></button>
              </>
            }}
          />}
        </div>
      </div>

      {draft && previewSection && (
        <Modal title={`编辑技术页面 · ${draft.title}`} onClose={closeEditor} maxWidth="max-w-[1240px]">
          <form onSubmit={submit} className="space-y-5">
            <AdminPagePreview
              publicPath={getTechnologyPagePath(draft.section_key || '')}
              title={draft.title}
              draftMessage={{ type: 'gonyik:technology-preview', payload: previewSection }}
              helpText="这是未保存草稿的实时前台效果；关闭编辑不会写入服务器。"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="导航名称（最多 12 个字符）" name="nav_label" required markup="inline" maxLength={12} value={draft.nav_label || ''} onChange={(event) => setDraft({ ...draft, nav_label: event.target.value })}>
                <span className="mt-1 block text-right text-[11px] text-muted">{Array.from(draft.nav_label || '').length}/12</span>
              </FormField>
              <FormField label="标题" name="title" required markup="inline" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              <FormField className="sm:col-span-2" label="副标题" name="subtitle" markup="inline" value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} />
              <FormField label="发布状态" name="status" select value={draft.status || 'draft'} onChange={(event) => setDraft({ ...draft, status: event.target.value as 'draft' | 'published' })} options={[{ value: 'draft', label: '草稿（前台不可见）' }, { value: 'published', label: '已发布' }]} />
              <FormField label="图片显示" name="image_fit" select value={draft.image_fit} onChange={(event) => setDraft({ ...draft, image_fit: event.target.value as 'cover' | 'contain' })} options={[{ value: 'cover', label: '填满裁切' }, { value: 'contain', label: '完整显示' }]} />
            </div>

            {['pfas-free-system', 'rpo-sotex-membrane'].includes(draft.section_key || '') ? (
              <div className="space-y-5 border-y border-white/10 py-5">
                {draft.section_key === 'pfas-free-system' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="头图主张" name="hero_statement" markup="inline" value={draft.hero_statement || ''} onChange={(event) => setDraft({ ...draft, hero_statement: event.target.value })} />
                    <FormField label="下滑提示" name="hero_scroll_label" markup="inline" value={draft.hero_scroll_label || ''} onChange={(event) => setDraft({ ...draft, hero_scroll_label: event.target.value })} />
                  </div>
                )}
                {(draft.content_blocks || []).map((block, blockIndex) => (
                  <div key={block.key || blockIndex} className="space-y-4 border border-white/10 bg-white/[0.025] p-4">
                    <p className="text-[11px] tracking-[0.14em] text-muted">正文画面 {blockIndex + 1}</p>
                    <FormField label="画面标题" name={`block-${blockIndex}-title`} markup="inline" value={block.title} onChange={(event) => updateContentBlock(blockIndex, { ...block, title: event.target.value })} />
                    <FormField label="画面正文" name={`block-${blockIndex}-content`} textarea rows={5} markup="block" value={block.content} onChange={(event) => updateContentBlock(blockIndex, { ...block, content: event.target.value })} />
                    {block.highlights && (
                      <FormField
                        label="关键词（用中文逗号分隔）"
                        name={`block-${blockIndex}-highlights`}
                        value={block.highlights.join('，')}
                        onChange={(event) => updateContentBlock(blockIndex, {
                          ...block,
                          highlights: event.target.value.split(/[，,]/).map((item) => item.trim()).filter(Boolean),
                        })}
                      />
                    )}
                    {block.items?.map((item, itemIndex) => (
                      <div key={`${block.key}-${itemIndex}`} className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
                        <FormField
                          label={`要点 ${itemIndex + 1} 标题`}
                          name={`block-${blockIndex}-item-${itemIndex}-title`}
                          value={item.title}
                          onChange={(event) => updateContentBlock(blockIndex, {
                            ...block,
                            items: block.items?.map((current, index) => index === itemIndex ? { ...current, title: event.target.value } : current),
                          })}
                        />
                        <FormField
                          label={`要点 ${itemIndex + 1} 说明`}
                          name={`block-${blockIndex}-item-${itemIndex}-content`}
                          value={item.content}
                          onChange={(event) => updateContentBlock(blockIndex, {
                            ...block,
                            items: block.items?.map((current, index) => index === itemIndex ? { ...current, content: event.target.value } : current),
                          })}
                        />
                      </div>
                    ))}
                  </div>
                ))}
                <p className="text-[12px] leading-5 text-muted">
                  {draft.section_key === 'pfas-free-system'
                    ? '无氟技术体系采用固定三屏结构；这里维护文字，体系图和产业链动效由前台组件统一呈现。'
                    : '膜技术页采用固定两章节结构；这里维护传湿机理、性能说明和三个核心能力，两种膜结构图与功能膜视觉由前台组件统一呈现。'}
                </p>
              </div>
            ) : (
              <FormField label="正文内容" name="content" textarea rows={7} markup="block" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} />
            )}

            <CroppedImageField
              key={draft.id || 'new'}
              label="页面头图"
              currentSrc={draft.image_url}
              aspect={3}
              fileBaseName={`technology-${draft.id || 'new'}`}
              maxOutputWidth={1760}
              fit={draft.image_fit === 'contain' ? 'contain' : 'cover'}
              onChange={(change) => {
                setImageChange(change)
                if (Object.prototype.hasOwnProperty.call(change, 'previewUrl')) {
                  setDraft({ ...draft, image_url: change.previewUrl || null })
                }
              }}
              help="建议使用横向图片，按 3:1 裁切并输出至 1760px 宽。前台会根据桌面视口剩余高度轻微中心裁切，使 Hero、选择器与头图合计约一屏。"
            />
            <FormField label="图片 URL（高级）" name="image_url" value={draft.image_url || ''} onChange={(event) => { setDraft({ ...draft, image_url: event.target.value || null }); setImageChange({ file: null, removeCurrent: false }) }} placeholder="也可以填写媒体库中的图片地址" />

            {formError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{formError}</p>}
            <SaveCancelButtons onCancel={closeEditor} loading={saving} submitLabel="保存修改" />
          </form>
        </Modal>
      )}
    </Dashboard>
  )
}
