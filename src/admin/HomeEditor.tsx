import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api, { getHomeConfig } from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminHomeEditor() {
  const navigate = useNavigate()
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getHomeConfig().then((res) => setForm(res.data.data || {}))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/home', form)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.put('/admin/home/background', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setForm({ ...form, hero_background: res.data.url })
  }

  const field = (label: string, key: string, textarea = false) => (
    <div className="mb-6">
      <label className="block text-[12px] text-secondary uppercase mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={form[key] || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={3}
          className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={form[key] || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
        />
      )}
    </div>
  )

  return (
    <Dashboard>
      <div className="max-w-[800px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">首页管理</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 text-[13px] font-medium hover:bg-bg transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存更改'}
          </button>
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {field('标签', 'hero_tag')}
        {field('主标题', 'hero_title', true)}
        <p className="text-[12px] text-secondary mb-4">使用换行符分隔多行标题</p>
        {field('副标题 / Slogan', 'hero_slogan', true)}

        <div className="mb-6">
          <label className="block text-[12px] text-secondary uppercase mb-2">背景图片</label>
          {form.hero_background && (
            <img src={form.hero_background} alt="Hero" className="w-full max-h-[200px] object-cover mb-3" />
          )}
          <input type="file" accept="image/*" onChange={handleFileUpload} className="text-white text-[13px]" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {field('主按钮文案', 'primary_btn_text')}
          {field('主按钮链接', 'primary_btn_link')}
          {field('次按钮文案', 'secondary_btn_text')}
          {field('次按钮链接', 'secondary_btn_link')}
        </div>
      </div>
    </Dashboard>
  )
}
