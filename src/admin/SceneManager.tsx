import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, X, Save } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'

interface Scene {
  id: number
  category: string
  label: string
  series_slug: string
  order_index: number
}

interface SeriesOption {
  id: number
  name: string
  slug: string
  sub_series?: { slug: string; name: string }[]
}

export default function AdminSceneManager() {
  const navigate = useNavigate()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Scene | null>(null)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    const [sRes, serRes] = await Promise.all([
      api.get('/fabrics/admin/scenes'),
      api.get('/fabrics/admin/series'),
    ])
    setScenes(sRes.data.data || [])
    setSeriesList(serRes.data.data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)

    const payload = {
      category: data.category as string,
      label: data.label as string,
      series_slug: data.series_slug as string,
    }

    if (editing?.id) {
      await api.put(`/fabrics/admin/scenes/${editing.id}`, payload)
    } else {
      await api.post('/fabrics/admin/scenes', payload)
    }
    setShowForm(false)
    setEditing(null)
    loadData()
    setMessage('保存成功')
    setTimeout(() => setMessage(''), 2000)
  }

  const deleteScene = async (id: number) => {
    if (!confirm('确定删除该场景？')) return
    await api.delete(`/fabrics/admin/scenes/${id}`)
    loadData()
  }

  const grouped = scenes.reduce<Record<string, Scene[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <Dashboard>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">场景管理</h1>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
          >
            <Plus size={16} />
            新增场景
          </button>
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {/* Scene List grouped by category */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-dark">
              <div className="px-6 py-3 border-b border-white/10 text-[12px] text-accent uppercase tracking-wider">
                {category}
              </div>
              <table className="w-full text-left text-[13px]">
                <tbody className="text-white">
                  {items.map((s) => (
                    <tr key={s.id} className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium">{s.label}</td>
                      <td className="px-6 py-4 text-accent">
                        {seriesList.find((ser) => ser.slug === s.series_slug)?.name || s.series_slug}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setEditing(s); setShowForm(true) }}
                          className="text-accent hover:text-white mr-3"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteScene(s.id)} className="text-error hover:text-white">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {scenes.length === 0 && (
            <p className="text-accent text-center py-12">暂无场景数据</p>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
            <div className="bg-dark w-full max-w-[500px] p-8">
              <h3 className="text-white text-[18px] font-bold mb-6">{editing ? '编辑场景' : '新增场景'}</h3>
              <form onSubmit={handleSave}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">分类</label>
                    <input
                      name="category"
                      defaultValue={editing?.category || ''}
                      required
                      placeholder="如：都市生活、轻户外"
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">场景名称</label>
                    <input
                      name="label"
                      defaultValue={editing?.label || ''}
                      required
                      placeholder="如：日常通勤"
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">对应面料系列</label>
                    <select
                      name="series_slug"
                      defaultValue={editing?.series_slug || ''}
                      required
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                    >
                      <option value="" className="bg-dark">请选择面料系列</option>
                      {seriesList.map((ser) => (
                        <optgroup key={ser.slug} label={ser.name} className="bg-dark">
                          <option value={ser.slug} className="bg-dark">{ser.name}</option>
                          {ser.sub_series?.map((sub: any) => (
                            <option key={sub.slug} value={sub.slug} className="bg-dark">{sub.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
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
