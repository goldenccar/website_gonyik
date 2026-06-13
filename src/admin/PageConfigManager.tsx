import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api, { getPageConfig, updatePageConfig } from '@/api/client'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'

interface PageConfigItem {
  page_key: string
  page_tag: string
  page_title: string
  page_subtitle: string
  hero_background: string | null
}

const PAGE_KEY_MAP: Record<string, { label: string; backPath: string }> = {
  fabrics: { label: '面料数据库', backPath: '/admin/fabrics' },
  equipment: { label: '终端装备', backPath: '/admin/equipment' },
  'fluorine-free': { label: '无氟未来', backPath: '/admin/fluorine' },
  services: { label: '服务与支持', backPath: '/admin/services' },
  contact: { label: '联系我们', backPath: '/admin/contact-config' },
}

interface PageConfigManagerProps {
  pageKey?: string
}

export default function PageConfigManager({ pageKey }: PageConfigManagerProps = {}) {
  const navigate = useNavigate()
  const [config, setConfig] = useState<PageConfigItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const targetKey = pageKey || 'fabrics'
  const meta = PAGE_KEY_MAP[targetKey] || { label: '页面配置', backPath: '/admin/dashboard' }

  useEffect(() => {
    getPageConfig(targetKey).then((res) => {
      setConfig(res.data.data)
      setLoading(false)
    })
  }, [targetKey])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      await updatePageConfig(targetKey, {
        page_tag: config.page_tag,
        page_title: config.page_title,
        page_subtitle: config.page_subtitle,
      })
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setMessage('保存失败')
      setTimeout(() => setMessage(''), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </Dashboard>
    )
  }

  if (!config) return null

  return (
    <Dashboard>
      <div className="max-w-[700px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(meta.backPath)} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">{meta.label} — 页面配置</h1>
          </div>
          <SaveButton onClick={handleSave} loading={saving} size="sm">
            保存
          </SaveButton>
        </div>

        {message && <p className="text-success text-[13px] mb-6">{message}</p>}

        <div className="bg-dark p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-1.5">英文标签</label>
              <input
                value={config.page_tag}
                onChange={(e) => setConfig({ ...config, page_tag: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-1.5">页面标题</label>
              <input
                value={config.page_title}
                onChange={(e) => setConfig({ ...config, page_title: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] text-secondary uppercase mb-1.5">副标题</label>
              <input
                value={config.page_subtitle}
                onChange={(e) => setConfig({ ...config, page_subtitle: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
}
