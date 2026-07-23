import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import api, { uploadFile } from '@/api/client'
import { getServiceModuleDefinition, type ServiceModuleType } from '@/config/serviceModules'
import FormField from './FormField'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import ResponsiveAdminList from './ResponsiveAdminList'
import SaveCancelButtons from './SaveCancelButtons'

export default function ServiceCollectionEditor({ moduleType }: { moduleType: ServiceModuleType }) {
  const definition = getServiceModuleDefinition(moduleType)
  const collection = definition?.collection
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [resourceFile, setResourceFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (!collection) return
    const response = await api.get(`/services/admin/${collection.endpoint}`)
    setItems(response.data.data || [])
  }

  useEffect(() => { load() }, [moduleType])

  if (!collection) return <p className="bg-dark px-5 py-8 text-[13px] text-accent">此模块没有独立内容列表，只需在上方维护目录名称、标题和说明。</p>

  const itemTitle = (item: any) => moduleType === 'faq' ? item.question : item.title
  const itemBody = (item: any) => moduleType === 'care' ? item.content : moduleType === 'faq' ? item.answer : item.description || item.file_url

  const openForm = (item: any | null = null) => {
    setEditing(item)
    setResourceFile(null)
    setShowForm(true)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setSaving(true)
    try {
      let payload: Record<string, unknown>
      if (moduleType === 'care') {
        payload = { title: data.title, content: data.content }
      } else if (moduleType === 'faq') {
        payload = { question: data.question, answer: data.answer }
      } else {
        let fileUrl = String(data.file_url || editing?.file_url || '')
        if (resourceFile) {
          const upload = await uploadFile(resourceFile)
          fileUrl = upload.data.url || upload.data.data?.url
        }
        if (!fileUrl) throw new Error('请上传文件或填写文件地址')
        payload = {
          title: data.title,
          description: data.description,
          file_url: fileUrl,
          file_type: resourceFile?.type === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf') ? 'PDF' : 'LINK',
          updated_at: new Date().toISOString(),
        }
      }
      await api[editing?.id ? 'put' : 'post'](`/services/admin/${collection.endpoint}${editing?.id ? `/${editing.id}` : ''}`, payload)
      setShowForm(false)
      setEditing(null)
      setResourceFile(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('确定删除？')) return
    await api.delete(`/services/admin/${collection.endpoint}/${id}`)
    load()
  }

  return <div className="bg-dark">
    <div className="flex justify-start p-4 sm:justify-end">
      <PrimaryButton onClick={() => openForm()} icon={<Plus size={16} />}>新增{collection.itemLabel}</PrimaryButton>
    </div>
    <div className="hidden md:block">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-white/10 text-accent"><tr><th className="px-6 py-3">{collection.titleLabel}</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
        <tbody className="text-white">{items.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="px-6 py-4">{itemTitle(item)}</td><td className="px-6 py-4 text-right"><button type="button" onClick={() => openForm(item)} className="mr-3 text-accent hover:text-white" aria-label="编辑"><Edit2 size={14} /></button><button type="button" onClick={() => remove(item.id)} className="text-error hover:text-white" aria-label="删除"><Trash2 size={14} /></button></td></tr>)}</tbody>
      </table>
    </div>
    <div className="md:hidden"><ResponsiveAdminList items={items} getKey={(item) => item.id} emptyLabel={`暂无${collection.itemLabel}`} renderTitle={itemTitle} renderSubtitle={itemBody} renderActions={(item) => <><button type="button" onClick={() => openForm(item)} className="flex h-11 w-11 items-center justify-center text-accent" aria-label="编辑"><Edit2 size={16} /></button><button type="button" onClick={() => remove(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label="删除"><Trash2 size={16} /></button></>} /></div>
    {showForm && <Modal title={editing ? '编辑' : `新增${collection.itemLabel}`} onClose={() => setShowForm(false)}><form onSubmit={submit} className="space-y-4">
      {moduleType === 'care' ? <><FormField label="步骤标题" name="title" markup="inline" defaultValue={editing?.title} required /><FormField label="说明" name="content" markup="inline" defaultValue={editing?.content} textarea rows={4} required /></> : moduleType === 'faq' ? <><FormField label="问题" name="question" markup="inline" defaultValue={editing?.question} required /><FormField label="答案" name="answer" markup="inline" defaultValue={editing?.answer} textarea rows={4} required /></> : <>
        <FormField label="资料名称" name="title" markup="inline" defaultValue={editing?.title} required />
        <FormField label="简要说明" name="description" markup="inline" defaultValue={editing?.description} textarea rows={3} />
        <label className="block"><span className="mb-2 block text-[12px] text-accent">上传 PDF</span><input type="file" accept="application/pdf" onChange={(event) => setResourceFile(event.target.files?.[0] || null)} className="w-full text-[13px] text-white file:mr-4 file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white" /><span className="mt-2 block text-[11px] text-muted">{editing?.file_url && !resourceFile ? '未选择新文件时保留当前文件。' : '单个文件不超过 50MB。'}</span></label>
        <FormField label="或填写文件地址" name="file_url" defaultValue={editing?.file_url} placeholder="https://…" />
      </>}
      <SaveCancelButtons loading={saving} onCancel={() => setShowForm(false)} />
    </form></Modal>}
  </div>
}
