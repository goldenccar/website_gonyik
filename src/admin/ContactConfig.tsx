import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Mail, Phone, MapPin, Clock } from 'lucide-react'
import Dashboard from './Dashboard'
import { getContactConfig, updateContactConfig } from '@/api/client'
import type { ContactConfig as ContactConfigType } from '@/types'

export default function ContactConfig() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<ContactConfigType | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getContactConfig().then((res) => setConfig(res.data.data))
  }, [])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    await updateContactConfig({
      email: config.email,
      phone: config.phone,
      address: config.address,
      response_text: config.response_text,
    })
    setSaving(false)
    alert('保存成功')
  }

  if (!config) return null

  return (
    <Dashboard>
      <div className="max-w-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-[22px] font-bold text-primary">联系配置</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[14px] font-medium hover:bg-darker transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>

        {/* Form */}
        <div className="bg-white p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-[14px] font-medium text-primary mb-2">
              <Mail size={16} className="text-secondary" />
              联系邮箱
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[14px] font-medium text-primary mb-2">
              <Phone size={16} className="text-secondary" />
              联系电话
            </label>
            <input
              type="text"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="400-XXX-XXXX"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[14px] font-medium text-primary mb-2">
              <MapPin size={16} className="text-secondary" />
              地址
            </label>
            <input
              type="text"
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="上海市"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[14px] font-medium text-primary mb-2">
              <Clock size={16} className="text-secondary" />
              响应提示文案
            </label>
            <input
              type="text"
              value={config.response_text}
              onChange={(e) => setConfig({ ...config, response_text: e.target.value })}
              className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="提交表单后，我们的面料顾问将在 3 个工作日内与您取得联系"
            />
            <p className="text-[12px] text-muted mt-1.5">显示在提交按钮右侧的提示文字</p>
          </div>
        </div>
      </div>
    </Dashboard>
  )
}
