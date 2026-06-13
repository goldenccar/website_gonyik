import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import api, { uploadFile } from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'

export default function AdminFabricManager() {
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
    const coverFile = (e.currentTarget as any).cover_image.files[0]
    const homeFile = (e.currentTarget as any).home_image.files[0]

    let home_image = editingSeries?.home_image || ''
    if (homeFile) {
      const up = await uploadFile(homeFile)
      home_image = up.data.url
    }

    const formData = new FormData()
    formData.append('name', data.name as string)
    formData.append('slug', data.slug as string)
    formData.append('tagline', (data.tagline as string) || '')
    formData.append('description', data.description as string)
    formData.append('sub_series_data', (data.sub_series_data as string) || '')
    formData.append('home_image', home_image)
    if (coverFile) formData.append('cover_image', coverFile)
    if (editingSeries?.cover_image && !coverFile) formData.append('cover_image', editingSeries.cover_image)

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

  const seriesAction = (
    <button
      onClick={() => { setEditingSeries(null); setShowSeriesForm(true) }}
      className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
    >
      <Plus size={16} />
      新增系列
    </button>
  )

  return (
    <Dashboard>
      <div>
        <AdminHeader title="面料系列管理" action={seriesAction} />

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {/* Series List */}
        <div className="bg-dark mb-8">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/10 text-accent uppercase">
              <tr>
                <th className="px-6 py-3">Logo</th>
                <th className="px-6 py-3">首页卡片图</th>
                <th className="px-6 py-3">名称</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">描述</th>
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
                  <td className="px-6 py-4">
                    {s.cover_image ? (
                      <img src={s.cover_image} alt={s.name} className="h-8 w-auto object-contain" />
                    ) : (
                      <span className="text-accent">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {s.home_image ? (
                      <img src={s.home_image} alt={s.name} className="h-10 w-16 object-cover" />
                    ) : (
                      <span className="text-accent">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-accent">{s.slug}</td>
                  <td className="px-6 py-4 text-accent max-w-[200px] truncate">{s.tagline || s.description}</td>
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
          <Modal title={editingSeries ? '编辑系列' : '新增系列'} onClose={() => setShowSeriesForm(false)}>
            <form onSubmit={handleSaveSeries} className="space-y-4">
              <FormField label="名称" name="name" defaultValue={editingSeries?.name} required />
              <FormField label="Slug" name="slug" defaultValue={editingSeries?.slug} required />
              <FormField label="标语 Tagline" name="tagline" defaultValue={editingSeries?.tagline} />
              <FormField label="描述" name="description" defaultValue={editingSeries?.description} textarea />
              <FormField
                label="子系列数据（JSON，仅 Kais 需要）"
                name="sub_series_data"
                defaultValue={editingSeries?.sub_series_data}
                textarea
                rows={4}
                placeholder='[{"slug":"kais-edge","name":"Kais-Edge","subtitle":"铠 · 锋","description":"...","accent_color":"#8B3A3A","link":"/fabrics/kais-edge"}]'
              />
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">系列 Logo</label>
                {editingSeries?.cover_image && (
                  <div className="mb-2">
                    <img src={editingSeries.cover_image} alt="当前 logo" className="h-10 w-auto object-contain" />
                    <p className="text-[11px] text-muted mt-1">当前 logo</p>
                  </div>
                )}
                <input type="file" name="cover_image" accept="image/*,image/svg+xml" className="text-white text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">首页卡片背景图</label>
                {editingSeries?.home_image && (
                  <div className="mb-2">
                    <img src={editingSeries.home_image} alt="当前首页图" className="h-20 w-auto object-cover" />
                    <p className="text-[11px] text-muted mt-1">当前首页卡片图</p>
                  </div>
                )}
                <input type="file" name="home_image" accept="image/*" className="text-white text-[13px]" />
              </div>
              <SaveCancelButtons onCancel={() => setShowSeriesForm(false)} />
            </form>
          </Modal>
        )}

        {/* SKU Form Modal */}
        {showSkuForm && (
          <Modal title={editingSku ? '编辑 SKU' : '新增 SKU'} onClose={() => setShowSkuForm(false)}>
            <form onSubmit={handleSaveSku} className="space-y-4">
              <FormField label="SKU 名称" name="name" defaultValue={editingSku?.name} required />
              <FormField label="编码" name="sku_code" defaultValue={editingSku?.sku_code} />
              <FormField
                label="特点（逗号分隔）"
                name="features"
                defaultValue={editingSku?.features ? (Array.isArray(editingSku.features) ? editingSku.features : JSON.parse(editingSku.features)).join(', ') : ''}
              />
              <FormField label="参数（JSON）" name="specifications" defaultValue={editingSku?.specifications || '{}'} textarea />
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">产品图</label>
                <input type="file" name="image" accept="image/*" className="text-white text-[13px]" />
              </div>
              <SaveCancelButtons onCancel={() => setShowSkuForm(false)} />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
