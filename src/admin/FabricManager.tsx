import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import api, { getPageConfig, updatePageConfig, uploadFile } from '@/api/client'
import SkuCard from '@/components/SkuCard'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'
import PrimaryButton from './components/PrimaryButton'
import ContentRailEditor, { type RailEndCardConfig } from './components/ContentRailEditor'
import SeriesHomeImageEditor from './components/SeriesHomeImageEditor'
import ResponsiveAdminList from './components/ResponsiveAdminList'

const DEFAULT_RAIL: RailEndCardConfig = { rail_end_card_visible: true, rail_end_card_title: '新面料开发中', rail_end_card_description: '针对新的使用环境与性能目标持续开发。', rail_end_card_cta_label: '提交需求', rail_end_card_cta_href: '/contact' }

export default function AdminFabricManager() {
  const [series, setSeries] = useState<any[]>([])
  const [skus, setSkus] = useState<any[]>([])
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null)
  const [editingSeries, setEditingSeries] = useState<any | null>(null)
  const [editingSku, setEditingSku] = useState<any | null>(null)
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [showSkuForm, setShowSkuForm] = useState(false)
  const [message, setMessage] = useState('')
  const [rail, setRail] = useState<RailEndCardConfig>(DEFAULT_RAIL)

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

  useEffect(() => { getPageConfig('fabrics').then((res) => setRail({ ...DEFAULT_RAIL, ...res.data.data })) }, [])

  const handleSaveSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const homeInput = e.currentTarget.elements.namedItem('home_image') as HTMLInputElement | null
    const homeFile = homeInput?.files?.[0]

    let home_image = editingSeries?.home_image || ''
    if (homeFile) {
      const up = await uploadFile(homeFile)
      home_image = up.data.url || up.data.data?.url || ''
    }

    const formData = new FormData()
    formData.append('name', data.name as string)
    formData.append('slug', data.slug as string)
    formData.append('tagline', (data.tagline as string) || '')
    formData.append('description', data.description as string)
    formData.append('home_image', home_image)

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
    formData.append('card_summary', (data.card_summary as string) || '')
    formData.append('visibility', (data.visibility as string) || 'public')
    formData.append('status', (data.status as string) || 'active')
    const existingSpecs = (() => { try { return JSON.parse(editingSku?.specifications || '{}') as Record<string, string> } catch { return {} } })()
    const preservedSpecs = Object.fromEntries(Object.entries(existingSpecs).slice(3))
    const coreSpecs = Object.fromEntries([0, 1, 2].map((index) => [String(data[`metric_label_${index}`] || '').trim(), String(data[`metric_value_${index}`] || '').trim()]).filter(([label]) => label))
    formData.append('specifications', JSON.stringify({ ...coreSpecs, ...preservedSpecs }))
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

  const moveSku = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= skus.length) return
    const next = [...skus]
    ;[next[index], next[target]] = [next[target], next[index]]
    setSkus(next)
    try {
      await api.put('/fabrics/admin/sku-order', { ordered_ids: next.map((item) => item.id) })
    } catch {
      setSkus(skus)
      setMessage('排序保存失败')
    }
  }

  const toggleSkuVisibility = async (sku: any) => {
    await api.put(`/fabrics/admin/sku/${sku.id}`, { visibility: sku.visibility === 'hidden' ? 'public' : 'hidden' })
    loadData()
  }

  const saveRail = async () => {
    await updatePageConfig('fabrics', rail)
    setMessage('卡片组保存成功')
    setTimeout(() => setMessage(''), 2000)
  }

  const seriesAction = (
    <PrimaryButton onClick={() => { setEditingSeries(null); setShowSeriesForm(true) }} icon={<Plus size={16} />}>新增系列</PrimaryButton>
  )

  return (
    <Dashboard>
      <div>
        <AdminHeader title="面料系列管理" action={seriesAction} />

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {/* Series List */}
        <div className="mb-8 hidden bg-dark md:block">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/10 text-accent uppercase">
              <tr>
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
        <div className="mb-8 md:hidden">
          <ResponsiveAdminList
            items={series}
            getKey={(item) => item.id}
            onSelect={(item) => setSelectedSeries(item.id)}
            isSelected={(item) => selectedSeries === item.id}
            renderMedia={(item) => item.home_image ? <img src={item.home_image} alt="" className="h-12 w-16 object-cover" /> : <div className="h-12 w-16 bg-white/5" />}
            renderTitle={(item) => item.name}
            renderSubtitle={(item) => `${item.slug}${item.tagline || item.description ? ` · ${item.tagline || item.description}` : ''}`}
            renderActions={(item) => <><button type="button" onClick={() => { setEditingSeries(item); setShowSeriesForm(true) }} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteSeries(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>}
          />
        </div>

        {/* SKU Section */}
        {selectedSeries && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[19px] font-bold text-white sm:text-h4">
                {series.find((s) => s.id === selectedSeries)?.name} - SKU 管理
              </h2>
              <PrimaryButton onClick={() => { setEditingSku(null); setShowSkuForm(true) }} icon={<Plus size={16} />}>新增 SKU</PrimaryButton>
            </div>
            <div className="hidden bg-dark md:block">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-white/10 text-accent uppercase">
                  <tr>
                    <th className="px-6 py-3">SKU 名称</th>
                    <th className="px-6 py-3">编码</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {skus.map((k) => (
                    <tr key={k.id} className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium">{k.name}</td>
                      <td className="px-6 py-4 text-accent">{k.sku_code}</td>
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
            <div className="md:hidden">
              <ResponsiveAdminList items={skus} getKey={(item) => item.id} emptyLabel="暂无 SKU" renderTitle={(item) => item.name} renderSubtitle={(item) => item.sku_code || '未填写编码'} renderActions={(item) => <><button type="button" onClick={() => { setEditingSku(item); setShowSkuForm(true) }} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteSku(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>} />
            </div>
            <ContentRailEditor label="SKU 横向轨道" items={skus} renderCard={(sku) => <SkuCard key={sku.id} sku={sku} seriesName={series.find((item) => item.id === selectedSeries)?.name} seriesTagline={sku.name} />} onEdit={(sku) => { setEditingSku(sku); setShowSkuForm(true) }} onMove={moveSku} onVisibility={toggleSkuVisibility} endCard={rail} onEndCardChange={(patch) => setRail({ ...rail, ...patch })} onSaveEndCard={saveRail} />
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
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">首页卡片背景图</label>
                {editingSeries?.id ? (
                  <SeriesHomeImageEditor series={editingSeries} onChange={(patch) => {
                    setEditingSeries({ ...editingSeries, ...patch })
                    setSeries((items) => items.map((item) => item.id === editingSeries.id ? { ...item, ...patch } : item))
                  }} />
                ) : (
                  <input type="file" name="home_image" accept="image/*" className="text-white text-[13px]" />
                )}
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
              <FormField label="卡片核心收益" name="card_summary" defaultValue={editingSku?.card_summary} placeholder="最多 12-16 个中文字" />
              <div className="grid gap-3 sm:grid-cols-2"><FormField label="前台显示" name="visibility" select defaultValue={editingSku?.visibility || 'public'} options={[{ value: 'public', label: '显示' }, { value: 'hidden', label: '隐藏' }]} /><FormField label="内容状态" name="status" select defaultValue={editingSku?.status || 'active'} options={[{ value: 'active', label: '正常' }, { value: 'archived', label: '归档' }]} /></div>
              <div>
                <label className="mb-2 block text-[12px] uppercase text-secondary">前台核心数据（最多三项）</label>
                <p className="mb-3 text-[12px] text-muted">标题和值都会显示在 SKU 展开区；其他已有参数会保留，但不进入首层展示。</p>
                {[0, 1, 2].map((index) => {
                  let entries: [string, string][] = []
                  try { entries = Object.entries(JSON.parse(editingSku?.specifications || '{}')) as [string, string][] } catch { entries = [] }
                  return <div key={index} className="mb-3 grid gap-3 sm:grid-cols-2"><FormField label={`数据 ${index + 1} 标题`} name={`metric_label_${index}`} defaultValue={entries[index]?.[0] || ''} /><FormField label={`数据 ${index + 1} 内容`} name={`metric_value_${index}`} defaultValue={entries[index]?.[1] || ''} /></div>
                })}
              </div>
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">产品图</label>
                {editingSku?.image && <img src={editingSku.image} alt="当前 SKU 卡片图" className="mb-2 aspect-[4/3] w-full object-cover" />}
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
