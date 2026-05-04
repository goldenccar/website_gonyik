import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api, { getContactConfig } from '@/api/client'
import Dashboard from './Dashboard'
import type { ContactConfig as ContactConfigType } from '@/types'

export default function ContactConfig() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<ContactConfigType | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getContactConfig().then((res) => setConfig(res.data.data))
  }, [])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      await api.put('/admin/contact-config', {
        email: config.email,
        phone: config.phone,
        address: config.address,
        response_text: config.response_text,
      })
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (!config) return null

  return (
    <Dashboard>
      <div className="max-w-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">联系配置</h1>
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

        {/* Form */}
        <div className="mb-6">
          <label className="block text-[12px] text-secondary uppercase mb-2">联系邮箱</label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => setConfig({ ...config, email: e.target.value })}
            className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
            placeholder="contact@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[12px] text-secondary uppercase mb-2">联系电话</label>
          <input
            type="text"
            value={config.phone}
            onChange={(e) => setConfig({ ...config, phone: e.target.value })}
            className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
            placeholder="400-XXX-XXXX"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[12px] text-secondary uppercase mb-2">地址</label>
          <input
            type="text"
            value={config.address}
            onChange={(e) => setConfig({ ...config, address: e.target.value })}
            className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
            placeholder="上海市"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[12px] text-secondary uppercase mb-2">响应提示文案</label>
          <input
            type="text"
            value={config.response_text}
            onChange={(e) => setConfig({ ...config, response_text: e.target.value })}
            className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
            placeholder="提交表单后，我们的面料顾问将在 3 个工作日内与您取得联系"
          />
          <p className="text-[12px] text-secondary mt-1.5">显示在提交按钮右侧的提示文字</p>
        </div>
      </div>
    </Dashboard>
  )
}
