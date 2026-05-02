import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import api, { getSiteConfig } from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminBrandSettings() {
  const navigate = useNavigate()
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getSiteConfig().then((res) => setForm(res.data.data || {}))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/site-config', form)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.put('/admin/site-config/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setForm({ ...form, logo_url: res.data.url })
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.put('/admin/site-config/favicon', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setForm({ ...form, favicon_url: res.data.url })
  }

  return (
    <Dashboard>
      <div className="max-w-[800px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">品牌设置</h1>
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

        {/* Logo */}
        <div className="mb-8">
          <label className="block text-[12px] text-secondary uppercase mb-3">Logo 图片</label>
          {form.logo_url && (
            <div className="bg-white/5 p-4 mb-4 inline-block">
              <img src={form.logo_url} alt="Logo" className="h-10 w-auto" />
            </div>
          )}
          <label className="flex items-center gap-2 bg-white/5 border border-borderDark px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors w-fit">
            <Upload size={16} className="text-accent" />
            <span className="text-[13px] text-white">{form.logo_url ? '更换 Logo' : '上传 Logo'}</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
          <p className="text-[12px] text-muted mt-2">建议尺寸 120×40px，支持 PNG / SVG / WebP</p>
        </div>

        {/* Logo Text */}
        <div className="mb-8">
          <label className="block text-[12px] text-secondary uppercase mb-2">Logo 文字</label>
          <input
            type="text"
            value={form.logo_text || ''}
            onChange={(e) => setForm({ ...form, logo_text: e.target.value })}
            className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
            placeholder="港翼科技"
          />
        </div>

        {/* Favicon */}
        <div className="mb-8">
          <label className="block text-[12px] text-secondary uppercase mb-3">Favicon 图标</label>
          {form.favicon_url && (
            <div className="bg-white/5 p-4 mb-4 inline-block">
              <img src={form.favicon_url} alt="Favicon" className="h-8 w-8" />
            </div>
          )}
          <label className="flex items-center gap-2 bg-white/5 border border-borderDark px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors w-fit">
            <Upload size={16} className="text-accent" />
            <span className="text-[13px] text-white">{form.favicon_url ? '更换 Favicon' : '上传 Favicon'}</span>
            <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
          </label>
          <p className="text-[12px] text-muted mt-2">建议尺寸 32×32px，支持 ICO / PNG</p>
        </div>
      </div>
    </Dashboard>
  )
}
