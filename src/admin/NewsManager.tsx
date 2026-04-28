import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminNewsManager() {
  const navigate = useNavigate()
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white"><ArrowLeft size={20} /></button>
            <h1 className="text-h3 text-white">新闻管理</h1>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"><Plus size={16} /> 新增新闻</button>
        </div>
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
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 overflow-auto">
            <div className="bg-dark w-full max-w-[600px] p-8 my-10">
              <h3 className="text-white text-[18px] font-bold mb-6">{editing ? '编辑新闻' : '新增新闻'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-[12px] text-secondary uppercase mb-1">标题</label><input name="title" defaultValue={editing?.title} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                <div><label className="block text-[12px] text-secondary uppercase mb-1">封面图 URL</label><input name="cover_image" defaultValue={editing?.cover_image || ''} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                <div><label className="block text-[12px] text-secondary uppercase mb-1">内容（支持 HTML）</label><textarea name="content" defaultValue={editing?.content || ''} rows={10} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none font-mono" /></div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">状态</label>
                  <select name="status" defaultValue={editing?.status || 'draft'} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-white text-primary py-2.5 text-[13px] font-medium hover:bg-bg">保存</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-white/20 text-white py-2.5 text-[13px] hover:bg-white/5">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}
