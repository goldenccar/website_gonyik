import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'

export default function AdminReportManager() {
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
        <AdminHeader
          title="测试报告管理"
          action={(
            <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg">
              <Plus size={16} /> 上传报告
            </button>
          )}
        />
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
                    <button onClick={() => { setEditing(r); setShowForm(true) }} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                    <button onClick={() => del(r.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && <p className="text-accent text-center py-8">暂无报告</p>}
        </div>

        {showForm && (
          <Modal title={editing ? '编辑报告' : '上传报告'} onClose={() => setShowForm(false)}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="标题" name="title" defaultValue={editing?.title} required />
              <FormField label="分类" name="category" defaultValue={editing?.category} />
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">文件（PDF/图片）</label>
                <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.svg" className="text-white text-[13px]" />
              </div>
              <SaveCancelButtons onCancel={() => setShowForm(false)} />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
