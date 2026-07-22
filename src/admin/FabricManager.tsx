import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
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
import { FabricCapabilitySelector } from '@/components/FabricCapabilities'
import FabricCapabilityLibrary from './components/FabricCapabilityLibrary'
import CroppedImageField, { type CroppedImageChange } from './components/CroppedImageField'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'

const DEFAULT_RAIL: RailEndCardConfig = { rail_end_card_visible: true, rail_end_card_title: '新面料开发中', rail_end_card_description: '针对新的使用环境与性能目标持续开发。', rail_end_card_cta_label: '提交需求', rail_end_card_cta_href: '/contact' }
const POSITION_OPTIONS = [
  { value: '', label: '暂不显示' },
  ...Array.from({ length: 9 }, (_, index) => ({ value: String(index + 1), label: `${index + 1} / 9` })),
]

export default function AdminFabricManager() {
  const [series, setSeries] = useState<any[]>([])
  const [capabilities, setCapabilities] = useState<FabricCapabilityDefinition[]>([])
  const [skus, setSkus] = useState<any[]>([])
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null)
  const [editingSeries, setEditingSeries] = useState<any | null>(null)
  const [editingSku, setEditingSku] = useState<any | null>(null)
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [showSkuForm, setShowSkuForm] = useState(false)
  const [message, setMessage] = useState('')
  const [rail, setRail] = useState<RailEndCardConfig>(DEFAULT_RAIL)
  const [skuImage, setSkuImage] = useState<CroppedImageChange>({ file: null, removeCurrent: false })
  const [seriesImage, setSeriesImage] = useState<CroppedImageChange>({ file: null, removeCurrent: false })
  const [formError, setFormError] = useState('')
  const [savingSku, setSavingSku] = useState(false)
  const [seriesError, setSeriesError] = useState('')
  const [savingSeries, setSavingSeries] = useState(false)

  const loadData = async () => {
    const [sRes, capabilityRes] = await Promise.all([api.get('/fabrics/admin/series'), api.get('/fabrics/admin/capabilities')])
    setSeries(sRes.data.data || [])
    setCapabilities(capabilityRes.data.data || [])
    if (selectedSeries) {
      const kRes = await api.get('/fabrics/admin/sku?series_id=' + selectedSeries)
      setSkus(kRes.data.data || [])
    }
  }

  const showMessage = (value: string) => {
    setMessage(value)
    window.setTimeout(() => setMessage(''), 2000)
  }

  const openSkuForm = (sku: any | null) => {
    setEditingSku(sku)
    setSkuImage({ file: null, removeCurrent: false })
    setFormError('')
    setShowSkuForm(true)
  }

  const openSeriesForm = (item: any | null) => {
    setEditingSeries(item)
    setSeriesImage({ file: null, removeCurrent: false })
    setSeriesError('')
    setShowSeriesForm(true)
  }

  useEffect(() => {
    loadData()
  }, [selectedSeries])

  useEffect(() => { getPageConfig('fabrics').then((res) => setRail({ ...DEFAULT_RAIL, ...res.data.data })) }, [])

  const handleSaveSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    setSavingSeries(true)
    setSeriesError('')
    try {
      let home_image = editingSeries?.home_image || ''
      if (seriesImage.file) {
        const up = await uploadFile(seriesImage.file)
        home_image = up.data.url || up.data.data?.url || ''
      }
      const payload = { name: data.name as string, slug: data.slug as string, tagline: (data.tagline as string) || '', description: (data.description as string) || '', home_image }
      if (editingSeries?.id) await api.put(`/fabrics/admin/series/${editingSeries.id}`, payload)
      else await api.post('/fabrics/admin/series', payload)
      setShowSeriesForm(false)
      setEditingSeries(null)
      setSeriesImage({ file: null, removeCurrent: false })
      await loadData()
      showMessage('保存成功')
    } catch (error: any) {
      setSeriesError(error?.response?.data?.error || '保存失败，请检查必填项后重试')
    } finally {
      setSavingSeries(false)
    }
  }

  const handleSaveSku = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const formData = new FormData()
    formData.append('series_id', String(selectedSeries))
    formData.append('name', data.public_name as string)
    formData.append('internal_code', data.internal_code as string)
    formData.append('public_name', data.public_name as string)
    formData.append('product_type', (data.product_type as string) || '')
    formData.append('position_performance', (data.position_performance as string) || '')
    formData.append('position_durability', (data.position_durability as string) || '')
    formData.append('position_handfeel', (data.position_handfeel as string) || '')
    formData.append('features', JSON.stringify(fd.getAll('capabilities')))
    formData.append('card_summary', '')
    formData.append('visibility', (data.visibility as string) || 'public')
    formData.append('status', editingSku?.status || 'active')
    formData.append('remove_image', skuImage.removeCurrent ? 'true' : 'false')
    const existingSpecs = (() => { try { return JSON.parse(editingSku?.specifications || '{}') as Record<string, string> } catch { return {} } })()
    const preservedSpecs = Object.fromEntries(Object.entries(existingSpecs).slice(3))
    const coreSpecs = Object.fromEntries([0, 1, 2].map((index) => [String(data[`metric_label_${index}`] || '').trim(), String(data[`metric_value_${index}`] || '').trim()]).filter(([label]) => label))
    formData.append('specifications', JSON.stringify({ ...coreSpecs, ...preservedSpecs }))
    if (skuImage.file) formData.append('image', skuImage.file)

    setSavingSku(true)
    setFormError('')
    try {
      if (editingSku?.id) {
        await api.put(`/fabrics/admin/sku/${editingSku.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/fabrics/admin/sku', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowSkuForm(false)
      setEditingSku(null)
      setSkuImage({ file: null, removeCurrent: false })
      await loadData()
      showMessage('保存成功')
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '保存失败，请检查必填项后重试')
    } finally {
      setSavingSku(false)
    }
  }

  const deleteSeries = async (id: number) => {
    if (!confirm('确定删除该系列及其全部面料？终端产品中的对应采用关系也会清空。')) return
    await api.delete(`/fabrics/admin/series/${id}`)
    if (selectedSeries === id) {
      setSelectedSeries(null)
      setSkus([])
    }
    await loadData()
  }

  const deleteSku = async (id: number) => {
    if (!confirm('确定删除该面料？终端产品中的对应采用关系也会清空。')) return
    await api.delete(`/fabrics/admin/sku/${id}`)
    await loadData()
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
    <PrimaryButton onClick={() => openSeriesForm(null)} icon={<Plus size={16} />}>新增系列</PrimaryButton>
  )

  return (
    <Dashboard>
      <div>
        <AdminHeader title="面料系列管理" action={seriesAction} />

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <FabricCapabilityLibrary items={capabilities} onChange={loadData} onMessage={showMessage} />

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
                      onClick={(e) => { e.stopPropagation(); openSeriesForm(s) }}
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
            renderActions={(item) => <><button type="button" onClick={() => openSeriesForm(item)} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteSeries(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>}
          />
        </div>

        {/* SKU Section */}
        {selectedSeries && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[19px] font-bold text-white sm:text-h4">
                {series.find((s) => s.id === selectedSeries)?.name} - 面料管理
              </h2>
              <PrimaryButton onClick={() => openSkuForm(null)} icon={<Plus size={16} />}>新增面料</PrimaryButton>
            </div>
            <div className="hidden bg-dark md:block">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-white/10 text-accent uppercase">
                  <tr>
                    <th className="px-6 py-3">对外商品编号</th>
                    <th className="px-6 py-3">产品定位</th>
                    <th className="px-6 py-3">内部编号</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {skus.map((k) => (
                    <tr key={k.id} className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium">{k.public_name || k.name}</td>
                      <td className="px-6 py-4 text-accent">{k.product_type || '-'}</td>
                      <td className="px-6 py-4 text-accent">{k.internal_code || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openSkuForm(k)} className="text-accent hover:text-white mr-3">
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
              {skus.length === 0 && <p className="text-accent text-center py-8">暂无面料</p>}
            </div>
            <div className="md:hidden">
              <ResponsiveAdminList items={skus} getKey={(item) => item.id} emptyLabel="暂无面料" renderTitle={(item) => item.public_name || item.name} renderSubtitle={(item) => [item.product_type, item.internal_code].filter(Boolean).join(' · ') || '未填写内部编号'} renderActions={(item) => <><button type="button" onClick={() => openSkuForm(item)} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.public_name || item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteSku(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.public_name || item.name}`}><Trash2 size={16} /></button></>} />
            </div>
            <ContentRailEditor label="面料卡片组" items={skus} renderCard={(sku) => <SkuCard key={sku.id} sku={sku} seriesName={series.find((item) => item.id === selectedSeries)?.name} capabilities={capabilities} />} onEdit={openSkuForm} onMove={moveSku} onVisibility={toggleSkuVisibility} endCard={rail} onEndCardChange={(patch) => setRail({ ...rail, ...patch })} onSaveEndCard={saveRail} />
          </div>
        )}

        {/* Series Form Modal */}
        {showSeriesForm && (
          <Modal title={editingSeries ? '编辑系列' : '新增系列'} onClose={() => setShowSeriesForm(false)}>
            <form onSubmit={handleSaveSeries} className="space-y-4">
              <FormField label="名称" name="name" markup="inline" defaultValue={editingSeries?.name} required />
              <FormField label="Slug" name="slug" defaultValue={editingSeries?.slug} required />
              <FormField label="标语 Tagline" name="tagline" markup="inline" defaultValue={editingSeries?.tagline} />
              <FormField label="描述" name="description" markup="inline" defaultValue={editingSeries?.description} textarea />
              <div>
                {editingSeries?.id ? (
                  <SeriesHomeImageEditor series={editingSeries} onChange={(patch) => {
                      setEditingSeries({ ...editingSeries, ...patch })
                      setSeries((items) => items.map((item) => item.id === editingSeries.id ? { ...item, ...patch } : item))
                    }} />
                ) : (
                  <CroppedImageField label="首页卡片背景图" aspect={4 / 3} fileBaseName="series-home" onChange={setSeriesImage} help="新增系列保存时一并上传；保存后可继续替换或移除。" />
                )}
              </div>
              {seriesError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{seriesError}</p>}
              <SaveCancelButtons loading={savingSeries} onCancel={() => setShowSeriesForm(false)} />
            </form>
          </Modal>
        )}

        {/* SKU Form Modal */}
        {showSkuForm && (
          <Modal title={editingSku ? '编辑面料' : '新增面料'} onClose={() => setShowSkuForm(false)} maxWidth="max-w-[660px]">
            <form onSubmit={handleSaveSku} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={`对外商品编号${editingSku?.public_name ? '（已锁定）' : ''}`} name="public_name" defaultValue={editingSku?.public_name || editingSku?.name} placeholder="例如 OTTER T70" required readOnly={Boolean(editingSku?.public_name)} />
                <FormField label={`内部编号${editingSku?.internal_code ? '（已锁定）' : ''}`} name="internal_code" defaultValue={editingSku?.internal_code} placeholder="例如 OT3-PAEL70-V15-PES50-B" required readOnly={Boolean(editingSku?.internal_code)} />
              </div>
              <FormField label="产品定位副标题" name="product_type" markup="inline" defaultValue={editingSku?.product_type} placeholder="例如 三层防护复合面料" required />
              <FabricCapabilitySelector key={editingSku?.id || 'new'} features={editingSku?.features} legacySummary={editingSku?.card_summary} capabilities={capabilities} max={3} />
              <div>
                <label className="mb-1 block text-[12px] uppercase text-secondary">三轴产品定位</label>
                <p className="mb-3 text-[12px] text-muted">后台维护 1–9 分，前台仅显示位置，不显示数字。</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <FormField label="性能：日常 → 专业" name="position_performance" select options={POSITION_OPTIONS} defaultValue={editingSku?.position_performance == null ? '' : String(editingSku.position_performance)} />
                  <FormField label="重量：轻盈 → 强韧" name="position_durability" select options={POSITION_OPTIONS} defaultValue={editingSku?.position_durability == null ? '' : String(editingSku.position_durability)} />
                  <FormField label="手感：柔软 → 挺括" name="position_handfeel" select options={POSITION_OPTIONS} defaultValue={editingSku?.position_handfeel == null ? '' : String(editingSku.position_handfeel)} />
                </div>
              </div>
              <FormField label="前台显示" name="visibility" select defaultValue={editingSku?.visibility || 'public'} options={[{ value: 'public', label: '显示' }, { value: 'hidden', label: '隐藏' }]} />
              <details className="border border-white/10 p-4">
                <summary className="cursor-pointer text-[13px] font-medium text-white">详细性能数据（可选）</summary>
                <p className="mb-3 mt-3 text-[12px] text-muted">最多三项，只在用户展开卡片后显示。</p>
                {[0, 1, 2].map((index) => {
                  let entries: [string, string][] = []
                  try { entries = Object.entries(JSON.parse(editingSku?.specifications || '{}')) as [string, string][] } catch { entries = [] }
                  return <div key={index} className="mb-3 grid gap-3 sm:grid-cols-2"><FormField label={`数据 ${index + 1} 标题`} name={`metric_label_${index}`} markup="inline" defaultValue={entries[index]?.[0] || ''} /><FormField label={`数据 ${index + 1} 内容`} name={`metric_value_${index}`} markup="inline" defaultValue={entries[index]?.[1] || ''} /></div>
                })}
              </details>
              <CroppedImageField key={editingSku?.id || 'new'} label="面料卡片图" currentSrc={editingSku?.image} aspect={4 / 3} fileBaseName={`${editingSku?.public_name || 'fabric'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')} onChange={setSkuImage} help="建议使用面料微距图；保存为 WebP，上传后可裁切。" />
              {formError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{formError}</p>}
              <SaveCancelButtons loading={savingSku} onCancel={() => setShowSkuForm(false)} />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
