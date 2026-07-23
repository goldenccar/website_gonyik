import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import api from '@/api/client'
import FormField from './FormField'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import ResponsiveAdminList from './ResponsiveAdminList'
import SaveCancelButtons from './SaveCancelButtons'

type CollectionKind = 'guide' | 'faq' | 'digital-format'

interface ServiceCollectionEditorProps {
  endpoint: string
  kind: CollectionKind
  itemLabel: string
  category?: 'material-care' | 'garment-care'
}

export default function ServiceCollectionEditor({ endpoint, kind, itemLabel, category }: ServiceCollectionEditorProps) {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const response = await api.get(`/services/admin/${endpoint}`, { params: category ? { category } : undefined })
    setItems(response.data.data || [])
  }

  useEffect(() => { load() }, [endpoint, category])

  const itemTitle = (item: any) => kind === 'faq' ? item.question : kind === 'digital-format' ? `${item.platform} · ${item.format}` : item.title
  const itemBody = (item: any) => kind === 'faq' ? item.answer : kind === 'digital-format' ? item.description : item.content

  const openForm = (item: any | null = null) => {
    setEditing(item)
    setShowForm(true)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const payload = kind === 'guide'
      ? { title: data.title, content: data.content }
      : kind === 'faq'
        ? { question: data.question, answer: data.answer, category }
        : { platform: data.platform, format: data.format, description: data.description, role: data.role === 'exchange' ? 'exchange' : 'primary' }
    setSaving(true)
    try {
      const suffix = editing?.id ? `/${editing.id}` : ''
      await api[editing?.id ? 'put' : 'post'](`/services/admin/${endpoint}${suffix}`, payload)
      setShowForm(false)
      setEditing(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm(`确定删除这条${itemLabel}？`)) return
    await api.delete(`/services/admin/${endpoint}/${id}`)
    await load()
  }

  return (
    <section className="bg-dark">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="text-[14px] font-medium text-white">{itemLabel}管理</h3>
          <p className="mt-1 text-[11px] text-muted">此处内容只会出现在当前服务页面。</p>
        </div>
        <PrimaryButton size="sm" onClick={() => openForm()} icon={<Plus size={15} />}>新增</PrimaryButton>
      </div>
      <ResponsiveAdminList items={items} getKey={(item) => item.id} emptyLabel={`暂无${itemLabel}`} renderTitle={itemTitle} renderSubtitle={itemBody} renderActions={(item) => (
        <>
          <button type="button" onClick={() => openForm(item)} className="flex h-11 w-11 items-center justify-center text-accent hover:text-white" aria-label="编辑"><Edit2 size={15} /></button>
          <button type="button" onClick={() => remove(item.id)} className="flex h-11 w-11 items-center justify-center text-error hover:text-white" aria-label="删除"><Trash2 size={15} /></button>
        </>
      )} />
      {showForm && (
        <Modal title={editing ? `编辑${itemLabel}` : `新增${itemLabel}`} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            {kind === 'guide' && <>
              <FormField label="标题" name="title" markup="inline" defaultValue={editing?.title} required />
              <FormField label="说明" name="content" markup="inline" defaultValue={editing?.content} textarea rows={4} required />
            </>}
            {kind === 'faq' && <>
              <FormField label="问题" name="question" markup="inline" defaultValue={editing?.question} required />
              <FormField label="答案" name="answer" markup="inline" defaultValue={editing?.answer} textarea rows={4} required />
            </>}
            {kind === 'digital-format' && <>
              <FormField label="平台" name="platform" defaultValue={editing?.platform} placeholder="例如 CLO3D" required />
              <FormField label="文件格式" name="format" defaultValue={editing?.format} placeholder="例如 .zfab" required />
              <FormField label="说明" name="description" markup="inline" defaultValue={editing?.description} textarea rows={3} required />
              <label className="block">
                <span className="mb-2 block text-[12px] text-accent">格式定位</span>
                <select name="role" defaultValue={editing?.role || 'primary'} className="min-h-11 w-full border border-white/20 bg-panel px-3 text-[14px] text-white">
                  <option value="primary">主要交付格式</option>
                  <option value="exchange">交换格式</option>
                </select>
              </label>
            </>}
            <SaveCancelButtons loading={saving} onCancel={() => setShowForm(false)} />
          </form>
        </Modal>
      )}
    </section>
  )
}
