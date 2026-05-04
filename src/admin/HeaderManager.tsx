import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, ArrowUp, ArrowDown } from 'lucide-react'
import api, { getNavigation } from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminHeaderManager() {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getNavigation().then((res) => setItems(res.data.data || []))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/navigation', { items: items.map((item, i) => ({ ...item, order_index: i })) })
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= items.length) return
    setItems((prev) => {
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      next.splice(newIndex, 0, removed)
      return next
    })
  }

  const updateItem = (index: number, key: string, value: string) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item))
  }

  return (
    <Dashboard>
      <div className="max-w-[800px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">Header 管理</h1>
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

        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-dark p-5 flex items-start gap-4">
              <div className="flex flex-col gap-1 pt-1">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-accent hover:text-white disabled:opacity-30">
                  <ArrowUp size={16} />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-accent hover:text-white disabled:opacity-30">
                  <ArrowDown size={16} />
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">名称</label>
                  <input
                    value={item.label}
                    onChange={(e) => updateItem(idx, 'label', e.target.value)}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">链接</label>
                  <input
                    value={item.link}
                    onChange={(e) => updateItem(idx, 'link', e.target.value)}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dashboard>
  )
}
