import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import FormField from './components/FormField'
import Modal from './components/Modal'
import PrimaryButton from './components/PrimaryButton'
import SaveCancelButtons from './components/SaveCancelButtons'

type Tab = 'care' | 'faq'

export default function AdminServiceManager() {
  const [activeTab, setActiveTab] = useState<Tab>('care')
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = async (tab = activeTab) => {
    const endpoint = tab === 'care' ? 'care-guides' : 'faqs'
    const res = await api.get(`/services/admin/${endpoint}`)
    setItems(res.data.data || [])
  }

  useEffect(() => { load() }, [activeTab])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const endpoint = activeTab === 'care' ? 'care-guides' : 'faqs'
    const payload = activeTab === 'care'
      ? { title: data.title, content: data.content }
      : { question: data.question, answer: data.answer }
    await api[editing?.id ? 'put' : 'post'](`/services/admin/${endpoint}${editing?.id ? `/${editing.id}` : ''}`, payload)
    setShowForm(false)
    setEditing(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('确定删除？')) return
    const endpoint = activeTab === 'care' ? 'care-guides' : 'faqs'
    await api.delete(`/services/admin/${endpoint}/${id}`)
    load()
  }

  return (
    <Dashboard>
      <AdminHeader title="服务与支持管理" />
      <div className="mb-6 flex border-b border-white/10">
        {([{ key: 'care', label: '洗涤保养' }, { key: 'faq', label: '常见问题' }] as const).map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`border-b-2 px-5 py-3 text-[13px] ${activeTab === tab.key ? 'border-accentWarm text-white' : 'border-transparent text-accent'}`}>{tab.label}</button>)}
      </div>
      <div className="bg-dark">
        <div className="flex justify-end p-4"><PrimaryButton onClick={() => { setEditing(null); setShowForm(true) }} icon={<Plus size={16} />}>新增{activeTab === 'care' ? '保养步骤' : '问题'}</PrimaryButton></div>
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-white/10 text-accent"><tr><th className="px-6 py-3">{activeTab === 'care' ? '步骤标题' : '问题'}</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
          <tbody className="text-white">{items.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="px-6 py-4">{activeTab === 'care' ? item.title : item.question}</td><td className="px-6 py-4 text-right"><button onClick={() => { setEditing(item); setShowForm(true) }} className="mr-3 text-accent hover:text-white"><Edit2 size={14} /></button><button onClick={() => remove(item.id)} className="text-error hover:text-white"><Trash2 size={14} /></button></td></tr>)}</tbody>
        </table>
      </div>
      {showForm && <Modal title={editing ? '编辑' : '新增'} onClose={() => setShowForm(false)}><form onSubmit={submit} className="space-y-4">{activeTab === 'care' ? <><FormField label="步骤标题" name="title" defaultValue={editing?.title} required /><FormField label="说明" name="content" defaultValue={editing?.content} textarea rows={4} required /></> : <><FormField label="问题" name="question" defaultValue={editing?.question} required /><FormField label="答案" name="answer" defaultValue={editing?.answer} textarea rows={4} required /></>}<SaveCancelButtons onCancel={() => setShowForm(false)} /></form></Modal>}
    </Dashboard>
  )
}
