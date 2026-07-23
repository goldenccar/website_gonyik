import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import api, { getPageConfig, updatePageConfig, uploadFile } from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'
import PrimaryButton from './components/PrimaryButton'
import SeriesHomeImageEditor from './components/SeriesHomeImageEditor'
import ResponsiveAdminList from './components/ResponsiveAdminList'
import CatalogCrudSection from './components/CatalogCrudSection'
import EndCardEditor from './components/EndCardEditor'
import { FabricCapabilitySelector } from '@/components/FabricCapabilities'
import FabricCapabilityLibrary from './components/FabricCapabilityLibrary'
import CroppedImageField, { type CroppedImageChange } from './components/CroppedImageField'
import type { FabricCapabilityDefinition } from '@/config/fabricCapabilities'
import type { RailEndCardConfig } from '@/components/RailEndCard'

const DEFAULT_RAIL: RailEndCardConfig = { rail_end_card_visible: true, rail_end_card_title: '新面料开发中', rail_end_card_description: '针对新的使用环境与性能目标持续开发。', rail_end_card_cta_label: '提交需求', rail_end_card_cta_href: '/contact' }
const POSITION_OPTIONS = [
  { value: '', label: '暂不显示' },
  ...Array.from({ length: 9 }, (_, index) => ({ value: String(index + 1), label: `${index + 1} / 9` })),
]

export default function AdminFabricManager() {
  const [series, setSeries] = useState<any[]>([])
  const [capabilities, setCapabilities] = useState<FabricCapabilityDefinition[]>([])
  const [skus, setSkus] = useState<any[]>([])
  const [skuFilter, setSkuFilter] = useState('all')
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
    const kRes = await api.get('/fabrics/admin/sku')
    setSkus(kRes.data.data || [])
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
  }, [])

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
    formData.append('series_id', data.series_id as string)
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
    if (skuFilter === String(id)) setSkuFilter('all')
    await loadData()
  }

  const deleteSku = async (id: number) => {
    if (!confirm('确定删除该面料？终端产品中的对应采用关系也会清空。')) return
    await api.delete(`/fabrics/admin/sku/${id}`)
    await loadData()
  }

  const moveSku = async (index: number, direction: -1 | 1) => {
    const scopedSkus = skus.filter((sku) => skuFilter !== 'all' && sku.series_id === Number(skuFilter)).sort((a, b) => a.order_index - b.order_index || a.id - b.id)
    const target = index + direction
    if (target < 0 || target >= scopedSkus.length || skuFilter === 'all') return
    const next = [...scopedSkus]
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await api.put('/fabrics/admin/sku-order', { ordered_ids: next.map((item) => item.id) })
      await loadData()
    } catch {
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
  const seriesName = (seriesId: number) => series.find((item) => item.id === seriesId)?.name || '未归类'
  const filteredSkus = useMemo(() => skus
    .filter((sku) => skuFilter === 'all' || sku.series_id === Number(skuFilter))
    .sort((a, b) => skuFilter === 'all'
      ? series.findIndex((item) => item.id === a.series_id) - series.findIndex((item) => item.id === b.series_id) || a.order_index - b.order_index || a.id - b.id
      : a.order_index - b.order_index || a.id - b.id), [series, skuFilter, skus])
  const defaultSeriesId = editingSku?.series_id || (skuFilter !== 'all' ? Number(skuFilter) : series[0]?.id)

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
                  className="border-b border-white/5"
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
            renderMedia={(item) => item.home_image ? <img src={item.home_image} alt="" className="h-12 w-16 object-cover" /> : <div className="h-12 w-16 bg-white/5" />}
            renderTitle={(item) => item.name}
            renderSubtitle={(item) => `${item.slug}${item.tagline || item.description ? ` · ${item.tagline || item.description}` : ''}`}
            renderActions={(item) => <><button type="button" onClick={() => openSeriesForm(item)} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteSeries(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>}
          />
        </div>

        <CatalogCrudSection
          title="面料型号"
          description="全部面料在同一列表维护，新增或编辑时选择所属系列。选择具体系列后可调整该系列在前台横向卡片组中的顺序。"
          actionLabel="新增面料"
          filters={[{ value: 'all', label: '全部面料系列' }, ...series.map((item) => ({ value: String(item.id), label: item.name }))]}
          filterValue={skuFilter}
          onFilterChange={setSkuFilter}
          items={filteredSkus}
          columns={[
            { label: '所属系列', render: (sku) => <span className="text-accent">{seriesName(sku.series_id)}</span> },
            { label: '对外商品编号', render: (sku) => <span className="font-medium">{sku.public_name || sku.name}</span> },
            { label: '产品定位', render: (sku) => <span className="text-accent">{sku.product_type || '-'}</span> },
            { label: '内部编号', render: (sku) => <span className="text-accent">{sku.internal_code || '-'}</span> },
          ]}
          getTitle={(sku) => sku.public_name || sku.name}
          getSubtitle={(sku) => [seriesName(sku.series_id), sku.product_type, sku.internal_code].filter(Boolean).join(' · ')}
          onAdd={() => openSkuForm(null)}
          onEdit={openSkuForm}
          onDelete={(sku) => deleteSku(sku.id)}
          onVisibility={toggleSkuVisibility}
        onMove={skuFilter === 'all' ? undefined : moveSku}
        orderHint={skuFilter === 'all' ? '切换到具体系列后可调整该系列在前台的显示顺序。' : undefined}
          emptyLabel="暂无面料"
        />

        <EndCardEditor config={rail} onChange={(patch) => setRail({ ...rail, ...patch })} onSave={saveRail} title="面料卡片开发中尾卡" />

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
              <FormField label="所属系列" name="series_id" select defaultValue={String(defaultSeriesId || '')} options={series.map((item) => ({ value: String(item.id), label: item.name }))} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={`对外商品编号${editingSku?.public_name ? '（已锁定）' : ''}`} name="public_name" defaultValue={editingSku?.public_name || editingSku?.name} placeholder="例如 OTTER T70" required readOnly={Boolean(editingSku?.public_name)} />
                <FormField label={`内部编号${editingSku?.internal_code ? '（已锁定）' : ''}`} name="internal_code" defaultValue={editingSku?.internal_code} placeholder="例如 OT3-PAEL70-V15-PES50-B" required readOnly={Boolean(editingSku?.internal_code)} />
              </div>
              <FormField label="产品定位副标题" name="product_type" markup="inline" defaultValue={editingSku?.product_type} placeholder="例如 三层防护复合面料" required />
              <FabricCapabilitySelector key={`capabilities-${editingSku?.id || 'new'}`} features={editingSku?.features} legacySummary={editingSku?.card_summary} capabilities={capabilities} max={3} />
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
              <CroppedImageField key={`image-${editingSku?.id || 'new'}`} label="面料卡片图" currentSrc={editingSku?.image} aspect={4 / 3} fileBaseName={`${editingSku?.public_name || 'fabric'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')} onChange={setSkuImage} help="建议使用面料微距图；保存为 WebP，上传后可裁切。" />
              {formError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{formError}</p>}
              <SaveCancelButtons loading={savingSku} onCancel={() => setShowSkuForm(false)} />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
