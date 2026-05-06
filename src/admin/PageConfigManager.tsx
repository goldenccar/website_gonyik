import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api, { getPageConfig, updatePageConfig } from '@/api/client'
import Dashboard from './Dashboard'

interface PageConfigItem {
  page_key: string
  page_tag: string
  page_title: string
  page_subtitle: string
  hero_background: string | null
}

const PAGE_KEYS = [
  { key: 'fabrics', label: '面料数据库' },
  { key: 'equipment', label: '终端装备' },
  { key: 'fluorine-free', label: '探索无氟未来' },
]

export default function PageConfigManager() {
  const navigate = useNavigate()
  const [configs, setConfigs] = useState<Record<string, PageConfigItem>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all(
      PAGE_KEYS.map((p) => getPageConfig(p.key))
    ).then((results) => {
      const map: Record<string, PageConfigItem> = {}
      results.forEach((res, i) => {
        const data = res.data.data
        if (data) {
          map[PAGE_KEYS[i].key] = data
        }
      })
      setConfigs(map)
      setLoading(false)
    })
  }, [])

  const handleChange = (key: string, field: keyof PageConfigItem, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const handleSave = async (key: string) => {
    const cfg = configs[key]
    if (!cfg) return
    setSavingKey(key)
    try {
      await updatePageConfig(key, {
        page_tag: cfg.page_tag,
        page_title: cfg.page_title,
        page_subtitle: cfg.page_subtitle,
      })
      setMessage(`${PAGE_KEYS.find((p) => p.key === key)?.label} 保存成功`)
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setMessage('保存失败')
      setTimeout(() => setMessage(''), 2000)
    } finally {
      setSavingKey(null)
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

  return (
    <Dashboard>
      <div className="max-w-[900px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">页面配置</h1>
          </div>
        </div>

        {message && <p className="text-success text-[13px] mb-6">{message}</p>}

        <div className="space-y-6">
          {PAGE_KEYS.map(({ key, label }) => {
            const cfg = configs[key]
            if (!cfg) return null
            return (
              <div key={key} className="bg-dark p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white text-[16px] font-bold">{label}</h2>
                  <button
                    onClick={() => handleSave(key)}
                    disabled={savingKey === key}
                    className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {savingKey === key ? '保存中...' : '保存'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1.5">英文标签</label>
                    <input
                      value={cfg.page_tag}
                      onChange={(e) => handleChange(key, 'page_tag', e.target.value)}
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1.5">页面标题</label>
                    <input
                      value={cfg.page_title}
                      onChange={(e) => handleChange(key, 'page_title', e.target.value)}
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] text-secondary uppercase mb-1.5">副标题</label>
                    <input
                      value={cfg.page_subtitle}
                      onChange={(e) => handleChange(key, 'page_subtitle', e.target.value)}
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Dashboard>
  )
}
