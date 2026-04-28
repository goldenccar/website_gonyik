import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminReportManager() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    const res = await api.get('/reports/admin/reports')
    setReports(res.data.data || [])
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const file = (e.currentTarget as any).file.files[0]
    if (!file && !editing) { alert('请上传文件'); return }
    const formData = new FormData()
    formData.append('title', fd.get('title') as string)
    formData.append('category', fd.get('category') as string)
    if (file) formData.append('file', file)
    if (editing?.file_url && !file) formData.append('file_url', editing.file_url)
    if (editing?.file_type && !file) formData.append('file_type', editing.file_type)

    if (editing?.id) {
      await api.put(`/reports/admin/reports/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/reports/admin/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    setShowForm(false); setEditing(null); load()
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const del = async (id: number) => {
    if (!confirm('确定删除？')) return
    await api.delete(`/reports/admin/reports/${id}`)
    load()
  }

  return (
    <Dashboard>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white"><ArrowLeft size={20} /></button>
            <h1 className="text-h3 text-white">测试报告管理</h1>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"><Plus size={16} /> 上传报告</button>
        </div>
        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="bg-dark">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/10 text-accent uppercase"><tr><th className="px-6 py-3">标题</th><th className="px-6 py-3">类型</th><th className="px-6 py-3">分类</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
            <tbody className="text-white">
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-6 py-4 font-medium">{r.title}</td>
                  <td className="px-6 py-4 text-accent uppercase">{r.file_type}</td>
                  <td className="px-6 py-4 text-accent">{r.category}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditing(r); setShowForm(true) }} className="text-accent hover:text-white mr-3">编辑</button>
                    <button onClick={() => del(r.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && <p className="text-accent text-center py-8">暂无报告</p>}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
            <div className="bg-dark w-full max-w-[500px] p-8">
              <h3 className="text-white text-[18px] font-bold mb-6">{editing ? '编辑报告' : '上传报告'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-[12px] text-secondary uppercase mb-1">标题</label><input name="title" defaultValue={editing?.title} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                <div><label className="block text-[12px] text-secondary uppercase mb-1">分类</label><input name="category" defaultValue={editing?.category} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                <div><label className="block text-[12px] text-secondary uppercase mb-1">文件（PDF/图片）</label><input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.svg" className="text-white text-[13px]" /></div>
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
