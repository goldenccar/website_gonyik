import { useEffect, useMemo, useState } from 'react'
import api, { getPageConfig, updatePageConfig } from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'
import CatalogCrudSection from './components/CatalogCrudSection'
import EndCardEditor from './components/EndCardEditor'
import CroppedImageField, { type CroppedImageChange } from './components/CroppedImageField'
import type { RailEndCardConfig } from '@/components/RailEndCard'

const DEFAULT_RAIL: RailEndCardConfig = { rail_end_card_visible: true, rail_end_card_title: '新应用开发中', rail_end_card_description: '围绕新的任务与穿着环境持续开发。', rail_end_card_cta_label: '', rail_end_card_cta_href: '/contact' }

function featureText(value: unknown) {
  if (Array.isArray(value)) return value.map(String).join(' · ')
  if (typeof value !== 'string' || !value) return ''
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String).join(' · ') : value
  } catch {
    return value
  }
}

export default function AdminEquipmentManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [productFilter, setProductFilter] = useState('all')
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [showProdForm, setShowProdForm] = useState(false)
  const [message, setMessage] = useState('')
  const [rail, setRail] = useState<RailEndCardConfig>(DEFAULT_RAIL)
  const [fabricSeries, setFabricSeries] = useState<any[]>([])
  const [fabricSkus, setFabricSkus] = useState<any[]>([])
  const [productImage, setProductImage] = useState<CroppedImageChange>({ file: null, removeCurrent: false })
  const [formError, setFormError] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)

  const loadProducts = async () => {
    const response = await api.get('/equipment/admin/products')
    setProducts(response.data.data || [])
  }

  useEffect(() => {
    Promise.all([
      api.get('/equipment/admin/categories'),
      api.get('/equipment/admin/products'),
      api.get('/fabrics/admin/series'),
      api.get('/fabrics/admin/sku'),
      getPageConfig('equipment'),
    ]).then(([categoryRes, productRes, seriesRes, skuRes, pageRes]) => {
      setCategories(categoryRes.data.data || [])
      setProducts(productRes.data.data || [])
      setFabricSeries(seriesRes.data.data || [])
      setFabricSkus(skuRes.data.data || [])
      setRail({ ...DEFAULT_RAIL, ...pageRes.data.data })
    })
  }, [])

  const categoryName = (categoryId: number) => categories.find((item) => item.id === categoryId)?.name || '未归类'
  const filteredProducts = useMemo(() => products
    .filter((product) => productFilter === 'all' || product.category_id === Number(productFilter))
    .sort((a, b) => a.order_index - b.order_index || a.id - b.id), [productFilter, products])

  const showMessage = (value: string) => {
    setMessage(value)
    window.setTimeout(() => setMessage(''), 2000)
  }

  const openProductForm = (product: any | null) => {
    setEditingProduct(product)
    setProductImage({ file: null, removeCurrent: false })
    setFormError('')
    setShowProdForm(true)
  }

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const data = Object.fromEntries(fd)
    const formData = new FormData()
    formData.append('category_id', data.category_id as string)
    formData.append('name', data.name as string)
    formData.append('features', JSON.stringify(String(data.features || '').split(/[,，]/).map((feature) => feature.trim()).filter(Boolean)))
    formData.append('card_summary', (data.card_summary as string) || '')
    formData.append('visibility', (data.visibility as string) || 'public')
    formData.append('status', editingProduct?.status || 'active')
    formData.append('related_sku_ids', JSON.stringify(fd.getAll('related_sku_ids').map(Number).filter(Number.isFinite)))
    formData.append('remove_image', productImage.removeCurrent ? 'true' : 'false')
    if (productImage.file) formData.append('image', productImage.file)

    setSavingProduct(true)
    setFormError('')
    try {
      if (editingProduct?.id) await api.put(`/equipment/admin/products/${editingProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      else await api.post('/equipment/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowProdForm(false)
      setEditingProduct(null)
      setProductImage({ file: null, removeCurrent: false })
      await loadProducts()
      showMessage('保存成功')
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '保存失败，请检查必填项后重试')
    } finally {
      setSavingProduct(false)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('确定删除该终端产品？')) return
    await api.delete(`/equipment/admin/products/${id}`)
    await loadProducts()
    showMessage('删除成功')
  }

  const moveProduct = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= filteredProducts.length || productFilter !== 'all') return
    const next = [...filteredProducts]
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await api.put('/equipment/admin/product-order', { ordered_ids: next.map((item) => item.id) })
      await loadProducts()
    } catch (error: any) {
      showMessage(error?.response?.data?.error || '排序保存失败')
    }
  }

  const toggleProductVisibility = async (product: any) => {
    await api.put(`/equipment/admin/products/${product.id}`, { visibility: product.visibility === 'hidden' ? 'public' : 'hidden' })
    await loadProducts()
  }

  const saveRail = async () => {
    await updatePageConfig('equipment', rail)
    showMessage('开发中提示保存成功')
  }

  const defaultCategoryId = editingProduct?.category_id || (productFilter !== 'all' ? Number(productFilter) : categories[0]?.id)

  return <Dashboard>
    <div>
      <AdminHeader title="终端装备管理" />
      {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
      <div className="border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] leading-5 text-muted">
        日常休闲、户外运动和特种专业是固定使用场景。所有终端产品在同一列表维护，新增或编辑时选择归属场景。
      </div>

      <CatalogCrudSection
        title="终端产品"
        description="统一维护全部终端产品；在“全部使用场景”下调整唯一的前台顺序，各场景页按这套顺序过滤显示。"
        actionLabel="新增终端产品"
        filters={[{ value: 'all', label: '全部使用场景' }, ...categories.map((category) => ({ value: String(category.id), label: category.name }))]}
        filterValue={productFilter}
        onFilterChange={setProductFilter}
        items={filteredProducts}
        columns={[
          { label: '使用场景', render: (product) => <span className="text-accent">{categoryName(product.category_id)}</span> },
          { label: '产品名', render: (product) => <span className="font-medium">{product.name}</span> },
          { label: '特点', render: (product) => <span className="text-accent">{featureText(product.features) || '-'}</span> },
        ]}
        getTitle={(product) => product.name}
        getSubtitle={(product) => `${categoryName(product.category_id)}${featureText(product.features) ? ` · ${featureText(product.features)}` : ''}`}
        onAdd={() => openProductForm(null)}
        onEdit={openProductForm}
        onDelete={(product) => deleteProduct(product.id)}
        onVisibility={toggleProductVisibility}
        onMove={productFilter === 'all' ? moveProduct : undefined}
        orderHint={productFilter === 'all' ? '此处顺序同时决定“全部”页和三个使用场景筛选后的相对顺序。' : '当前列表继承“全部使用场景”的全局顺序；如需调整，请切换到全部。'}
        emptyLabel="暂无终端产品"
      />

      <EndCardEditor config={rail} onChange={(patch) => setRail({ ...rail, ...patch })} onSave={saveRail} title="终端装备开发中提示" />

      {showProdForm && <Modal title={editingProduct ? '编辑终端产品' : '新增终端产品'} onClose={() => setShowProdForm(false)} maxWidth="max-w-[620px]">
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <FormField label="使用场景" name="category_id" select defaultValue={String(defaultCategoryId || '')} options={categories.map((category) => ({ value: String(category.id), label: category.name }))} required />
          <FormField label="产品名" name="name" markup="inline" defaultValue={editingProduct?.name} required />
          <FormField label="特点（逗号分隔）" name="features" defaultValue={featureText(editingProduct?.features).replaceAll(' · ', ', ')} />
          <FormField label="卡片核心收益" name="card_summary" markup="inline" defaultValue={editingProduct?.card_summary} placeholder="一句话说明应用价值" />
          <FormField label="前台显示" name="visibility" select defaultValue={editingProduct?.visibility || 'public'} options={[{ value: 'public', label: '显示' }, { value: 'hidden', label: '隐藏' }]} />
          <fieldset className="border border-white/10 p-4">
            <legend className="px-1 text-[12px] uppercase tracking-[0.08em] text-secondary">采用面料</legend>
            <p className="mb-3 text-[12px] leading-5 text-accent">勾选该终端产品实际采用的一个或多个面料；前台可跳转到对应型号。</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {fabricSkus.map((sku) => {
                const series = fabricSeries.find((item) => item.id === sku.series_id)
                const related = Array.isArray(editingProduct?.related_sku_ids) ? editingProduct.related_sku_ids : []
                return <label key={sku.id} className="flex cursor-pointer items-start gap-3 border border-white/10 px-3 py-3 text-[13px] text-white hover:border-white/25">
                  <input type="checkbox" name="related_sku_ids" value={sku.id} defaultChecked={related.map(Number).includes(sku.id)} className="mt-0.5 accent-[#69B2C1]" />
                  <span><span className="font-medium">{sku.public_name || sku.name}</span><span className="mt-0.5 block text-[12px] text-accent">{series?.name || '未归类'} · {sku.internal_code || '未填写内部编号'}</span></span>
                </label>
              })}
            </div>
          </fieldset>
          <CroppedImageField key={editingProduct?.id || 'new'} label="终端产品图" currentSrc={editingProduct?.image} aspect={1} fileBaseName={`${editingProduct?.name || 'equipment'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')} outputType="image/png" fit="contain" transparent onChange={setProductImage} help="建议上传带透明通道的产品抠图；裁切后保留 PNG 透明背景，卡片底色由前端统一控制。" />
          {formError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{formError}</p>}
          <SaveCancelButtons loading={savingProduct} onCancel={() => setShowProdForm(false)} />
        </form>
      </Modal>}
    </div>
  </Dashboard>
}
