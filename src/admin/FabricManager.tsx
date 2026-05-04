import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminFabricManager() {
  const navigate = useNavigate()
  const [series, setSeries] = useState<any[]>([])
  const [skus, setSkus] = useState<any[]>([])
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null)
  const [editingSeries, setEditingSeries] = useState<any | null>(null)
  const [editingSku, setEditingSku] = useState<any | null>(null)
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [showSkuForm, setShowSkuForm] = useState(false)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    const sRes = await api.get('/fabrics/admin/series')
    setSeries(sRes.data.data || [])
    if (selectedSeries) {
      const kRes = await api.get('/fabrics/admin/sku?series_id=' + selectedSeries)
      setSkus(kRes.data.data || [])
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedSeries])

  const handleSaveSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const file = (e.currentTarget as any).cover_image.files[0]

    const formData = new FormData()
    formData.append('name', data.name as string)
    formData.append('slug', data.slug as string)
    formData.append('tagline', (data.tagline as string) || '')
    formData.append('description', data.description as string)
    formData.append('sub_series_data', (data.sub_series_data as string) || '')
    if (file) formData.append('cover_image', file)
    if (editingSeries?.cover_image && !file) formData.append('cover_image', editingSeries.cover_image)

    if (editingSeries?.id) {
      await api.put(`/fabrics/admin/series/${editingSeries.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/fabrics/admin/series', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    setShowSeriesForm(false)
    setEditingSeries(null)
    loadData()
    setMessage('保存成功')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleSaveSku = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const file = (e.currentTarget as any).image.files[0]

    const formData = new FormData()
    formData.append('series_id', String(selectedSeries))
    formData.append('name', data.name as string)
    formData.append('sku_code', data.sku_code as string)
    formData.append('features', JSON.stringify((data.features as string).split(',').map((f) => f.trim())))
    formData.append('specifications', data.specifications as string)
    if (file) formData.append('image', file)
    if (editingSku?.image && !file) formData.append('image', editingSku.image)

    if (editingSku?.id) {
      await api.put(`/fabrics/admin/sku/${editingSku.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/fabrics/admin/sku', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    setShowSkuForm(false)
    setEditingSku(null)
    loadData()
    setMessage('保存成功')
    setTimeout(() => setMessage(''), 2000)
  }

  const deleteSeries = async (id: number) => {
    if (!confirm('确定删除该系列？')) return
    await api.delete(`/fabrics/admin/series/${id}`)
    loadData()
  }

  const deleteSku = async (id: number) => {
    if (!confirm('确定删除该 SKU？')) return
    await api.delete(`/fabrics/admin/sku/${id}`)
    loadData()
  }

  return (
    <Dashboard>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">面料系列管理</h1>
          </div>
          <button
            onClick={() => { setEditingSeries(null); setShowSeriesForm(true) }}
            className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
          >
            <Plus size={16} />
            新增系列
          </button>
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {/* Series List */}
        <div className="bg-dark mb-8">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/10 text-accent uppercase">
              <tr>
                <th className="px-6 py-3">名称</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">描述</th>
                <th className="px-6 py-3">SKU 数</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {series.map((s) => (
                <tr
                  key={s.id}
                  className={`border-b border-white/5 cursor-pointer hover:bg-white/5 ${selectedSeries === s.id ? 'bg-white/10' : ''}`}
                  onClick={() => setSelectedSeries(s.id)}
                >
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-accent">{s.slug}</td>
                  <td className="px-6 py-4 text-accent max-w-[200px] truncate">{s.tagline || s.description}</td>
                  <td className="px-6 py-4 text-accent">-</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingSeries(s); setShowSeriesForm(true) }}
                      className="text-accent hover:text-white mr-3"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteSeries(s.id) }} className="text-error hover:text-white">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SKU Section */}
        {selectedSeries && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h4 text-white">
                {series.find((s) => s.id === selectedSeries)?.name} - SKU 管理
              </h2>
              <button
                onClick={() => { setEditingSku(null); setShowSkuForm(true) }}
                className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
              >
                <Plus size={16} />
                新增 SKU
              </button>
            </div>
            <div className="bg-dark">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-white/10 text-accent uppercase">
                  <tr>
                    <th className="px-6 py-3">SKU 名称</th>
                    <th className="px-6 py-3">编码</th>
                    <th className="px-6 py-3">特点</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {skus.map((k) => (
                    <tr key={k.id} className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium">{k.name}</td>
                      <td className="px-6 py-4 text-accent">{k.sku_code}</td>
                      <td className="px-6 py-4 text-accent">{k.features}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingSku(k); setShowSkuForm(true) }} className="text-accent hover:text-white mr-3">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteSku(k.id)} className="text-error hover:text-white">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {skus.length === 0 && <p className="text-accent text-center py-8">暂无 SKU</p>}
            </div>
          </div>
        )}

        {/* Series Form Modal */}
        {showSeriesForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
            <div className="bg-dark w-full max-w-[500px] p-8">
              <h3 className="text-white text-[18px] font-bold mb-6">{editingSeries ? '编辑系列' : '新增系列'}</h3>
              <form onSubmit={handleSaveSeries}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">名称</label>
                    <input name="name" defaultValue={editingSeries?.name || ''} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">Slug</label>
                    <input name="slug" defaultValue={editingSeries?.slug || ''} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">标语 Tagline</label>
                    <input name="tagline" defaultValue={editingSeries?.tagline || ''} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">描述</label>
                    <textarea name="description" defaultValue={editingSeries?.description || ''} rows={3} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">子系列数据（JSON，仅 Kais 需要）</label>
                    <textarea name="sub_series_data" defaultValue={editingSeries?.sub_series_data || ''} rows={4} placeholder='[{"slug":"kais-edge","name":"Kais-Edge","subtitle":"铠 · 锋","description":"...","accent_color":"#8B3A3A","link":"/fabrics/kais-edge"}]' className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">封面图</label>
                    <input type="file" name="cover_image" accept="image/*" className="text-white text-[13px]" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-white text-primary py-2.5 text-[13px] font-medium hover:bg-bg">保存</button>
                  <button type="button" onClick={() => setShowSeriesForm(false)} className="flex-1 border border-white/20 text-white py-2.5 text-[13px] hover:bg-white/5">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SKU Form Modal */}
        {showSkuForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
            <div className="bg-dark w-full max-w-[500px] p-8">
              <h3 className="text-white text-[18px] font-bold mb-6">{editingSku ? '编辑 SKU' : '新增 SKU'}</h3>
              <form onSubmit={handleSaveSku}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">SKU 名称</label>
                    <input name="name" defaultValue={editingSku?.name || ''} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">编码</label>
                    <input name="sku_code" defaultValue={editingSku?.sku_code || ''} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">特点（逗号分隔）</label>
                    <input name="features" defaultValue={editingSku?.features ? JSON.parse(editingSku.features).join(', ') : ''} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">参数（JSON）</label>
                    <textarea name="specifications" defaultValue={editingSku?.specifications || '{}'} rows={3} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">产品图</label>
                    <input type="file" name="image" accept="image/*" className="text-white text-[13px]" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-white text-primary py-2.5 text-[13px] font-medium hover:bg-bg">保存</button>
                  <button type="button" onClick={() => setShowSkuForm(false)} className="flex-1 border border-white/20 text-white py-2.5 text-[13px] hover:bg-white/5">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}
