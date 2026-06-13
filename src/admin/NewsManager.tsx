import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'

export default function AdminNewsManager() {
  const [news, setNews] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    const res = await api.get('/services/admin/news')
    setNews(res.data.data || [])
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const payload = {
      title: data.title,
      cover_image: data.cover_image,
      content: data.content,
      images: null,
      status: data.status,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    }
    if (editing?.id) {
      await api.put(`/services/admin/news/${editing.id}`, payload)
    } else {
      await api.post('/services/admin/news', payload)
    }
    setShowForm(false); setEditing(null); load()
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const del = async (id: number) => {
    if (!confirm('确定删除？')) return
    await api.delete(`/services/admin/news/${id}`)
    load()
  }

  return (
    <Dashboard>
      <div>
        <AdminHeader
          title="新闻管理"
          action={(
            <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg">
              <Plus size={16} /> 新增新闻
            </button>
          )}
        />
        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="bg-dark">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/10 text-accent uppercase"><tr><th className="px-6 py-3">标题</th><th className="px-6 py-3">状态</th><th className="px-6 py-3">发布时间</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
            <tbody className="text-white">
              {news.map((n) => (
                <tr key={n.id} className="border-b border-white/5">
                  <td className="px-6 py-4 font-medium">{n.title}</td>
                  <td className="px-6 py-4"><span className={`text-[11px] uppercase px-2 py-0.5 ${n.status === 'published' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{n.status}</span></td>
                  <td className="px-6 py-4 text-accent">{n.published_at ? new Date(n.published_at).toLocaleDateString('zh-CN') : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditing(n); setShowForm(true) }} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                    <button onClick={() => del(n.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {news.length === 0 && <p className="text-accent text-center py-8">暂无新闻</p>}
        </div>

        {showForm && (
          <Modal title={editing ? '编辑新闻' : '新增新闻'} onClose={() => setShowForm(false)} maxWidth="max-w-[600px]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="标题" name="title" defaultValue={editing?.title} required />
              <FormField label="封面图 URL" name="cover_image" defaultValue={editing?.cover_image || ''} />
              <FormField label="内容（支持 HTML）" name="content" defaultValue={editing?.content || ''} textarea rows={10} required />
              <FormField
                label="状态"
                name="status"
                select
                defaultValue={editing?.status || 'draft'}
                options={[
                  { value: 'draft', label: '草稿' },
                  { value: 'published', label: '已发布' },
                ]}
              />
              <SaveCancelButtons onCancel={() => setShowForm(false)} />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
