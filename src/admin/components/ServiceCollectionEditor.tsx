import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import api from '@/api/client'
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

  const load = async () => {
    if (!collection) return
    const response = await api.get(`/services/admin/${collection.endpoint}`)
    setItems(response.data.data || [])
  }

  useEffect(() => { load() }, [moduleType])

  if (!collection) return <p className="bg-dark px-5 py-8 text-[13px] text-accent">此模块没有独立内容列表，只需在上方维护目录名称、标题和说明。</p>

  const itemTitle = (item: any) => moduleType === 'care' ? item.title : item.question
  const itemBody = (item: any) => moduleType === 'care' ? item.content : item.answer

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const payload = moduleType === 'care'
      ? { title: data.title, content: data.content }
      : { question: data.question, answer: data.answer }
    await api[editing?.id ? 'put' : 'post'](`/services/admin/${collection.endpoint}${editing?.id ? `/${editing.id}` : ''}`, payload)
    setShowForm(false)
    setEditing(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('确定删除？')) return
    await api.delete(`/services/admin/${collection.endpoint}/${id}`)
    load()
  }

  return <div className="bg-dark">
    <div className="flex justify-start p-4 sm:justify-end">
      <PrimaryButton onClick={() => { setEditing(null); setShowForm(true) }} icon={<Plus size={16} />}>新增{collection.itemLabel}</PrimaryButton>
    </div>
    <div className="hidden md:block">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-white/10 text-accent"><tr><th className="px-6 py-3">{collection.titleLabel}</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
        <tbody className="text-white">{items.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="px-6 py-4">{itemTitle(item)}</td><td className="px-6 py-4 text-right"><button type="button" onClick={() => { setEditing(item); setShowForm(true) }} className="mr-3 text-accent hover:text-white" aria-label="编辑"><Edit2 size={14} /></button><button type="button" onClick={() => remove(item.id)} className="text-error hover:text-white" aria-label="删除"><Trash2 size={14} /></button></td></tr>)}</tbody>
      </table>
    </div>
    <div className="md:hidden"><ResponsiveAdminList items={items} getKey={(item) => item.id} emptyLabel={`暂无${collection.itemLabel}`} renderTitle={itemTitle} renderSubtitle={itemBody} renderActions={(item) => <><button type="button" onClick={() => { setEditing(item); setShowForm(true) }} className="flex h-11 w-11 items-center justify-center text-accent" aria-label="编辑"><Edit2 size={16} /></button><button type="button" onClick={() => remove(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label="删除"><Trash2 size={16} /></button></>} /></div>
    {showForm && <Modal title={editing ? '编辑' : `新增${collection.itemLabel}`} onClose={() => setShowForm(false)}><form onSubmit={submit} className="space-y-4">{moduleType === 'care' ? <><FormField label="步骤标题" name="title" defaultValue={editing?.title} required /><FormField label="说明" name="content" defaultValue={editing?.content} textarea rows={4} required /></> : <><FormField label="问题" name="question" defaultValue={editing?.question} required /><FormField label="答案" name="answer" defaultValue={editing?.answer} textarea rows={4} required /></>}<SaveCancelButtons onCancel={() => setShowForm(false)} /></form></Modal>}
  </div>
}
