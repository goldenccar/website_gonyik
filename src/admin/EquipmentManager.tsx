import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import api, { getPageConfig, updatePageConfig } from '@/api/client'
import ApplicationCard from '@/components/ApplicationCard'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'
import PrimaryButton from './components/PrimaryButton'
import ContentRailEditor, { type RailEndCardConfig } from './components/ContentRailEditor'
import ResponsiveAdminList from './components/ResponsiveAdminList'
import CroppedImageField, { type CroppedImageChange } from './components/CroppedImageField'

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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [showProdForm, setShowProdForm] = useState(false)
  const [message, setMessage] = useState('')
  const [rail, setRail] = useState<RailEndCardConfig>(DEFAULT_RAIL)
  const [fabricSeries, setFabricSeries] = useState<any[]>([])
  const [fabricSkus, setFabricSkus] = useState<any[]>([])
  const [productImage, setProductImage] = useState<CroppedImageChange>({ file: null, removeCurrent: false })
  const [formError, setFormError] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  const loadData = async () => {
    const cRes = await api.get('/equipment/admin/categories')
    setCategories(cRes.data.data || [])
    if (selectedCategory) {
      const pRes = await api.get('/equipment/admin/products?category_id=' + selectedCategory)
      setProducts(pRes.data.data || [])
    }
  }

  useEffect(() => { loadData() }, [selectedCategory])
  useEffect(() => { getPageConfig('equipment').then((res) => setRail({ ...DEFAULT_RAIL, ...res.data.data })) }, [])
  useEffect(() => {
    Promise.all([api.get('/fabrics/admin/series'), api.get('/fabrics/admin/sku')]).then(([seriesRes, skuRes]) => {
      setFabricSeries(seriesRes.data.data || [])
      setFabricSkus(skuRes.data.data || [])
    })
  }, [])

  const openProductForm = (product: any | null) => {
    setEditingProduct(product)
    setProductImage({ file: null, removeCurrent: false })
    setFormError('')
    setShowProdForm(true)
  }

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const payload = { name: data.name as string, slug: data.slug as string, description: (data.description as string) || '' }

    setSavingCategory(true)
    setCategoryError('')
    try {
      if (editingCategory?.id) await api.put(`/equipment/admin/categories/${editingCategory.id}`, payload)
      else await api.post('/equipment/admin/categories', payload)
      setShowCatForm(false)
      setEditingCategory(null)
      await loadData()
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (error: any) {
      setCategoryError(error?.response?.data?.error || '保存失败，请检查必填项后重试')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const formData = new FormData()
    formData.append('category_id', String(selectedCategory))
    formData.append('name', data.name as string)
    formData.append('features', JSON.stringify(String(data.features || '').split(/[,，]/).map((f) => f.trim()).filter(Boolean)))
    formData.append('card_summary', (data.card_summary as string) || '')
    formData.append('visibility', (data.visibility as string) || 'public')
    formData.append('status', editingProduct?.status || 'active')
    formData.append('related_sku_ids', JSON.stringify(fd.getAll('related_sku_ids').map(Number).filter(Number.isFinite)))
    formData.append('remove_image', productImage.removeCurrent ? 'true' : 'false')
    if (productImage.file) formData.append('image', productImage.file)

    setSavingProduct(true)
    setFormError('')
    try {
      if (editingProduct?.id) {
        await api.put(`/equipment/admin/products/${editingProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/equipment/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowProdForm(false)
      setEditingProduct(null)
      setProductImage({ file: null, removeCurrent: false })
      await loadData()
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '保存失败，请检查必填项后重试')
    } finally {
      setSavingProduct(false)
    }
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('确定删除该分类及其中全部终端产品？')) return
    await api.delete(`/equipment/admin/categories/${id}`)
    if (selectedCategory === id) {
      setSelectedCategory(null)
      setProducts([])
    }
    await loadData()
  }
  const deleteProduct = async (id: number) => {
    if (!confirm('确定删除该终端产品？')) return
    await api.delete(`/equipment/admin/products/${id}`)
    await loadData()
  }

  const moveProduct = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= products.length) return
    const next = [...products]
    ;[next[index], next[target]] = [next[target], next[index]]
    setProducts(next)
    try {
      await api.put('/equipment/admin/product-order', { ordered_ids: next.map((item) => item.id) })
    } catch {
      setProducts(products)
      setMessage('排序保存失败')
    }
  }

  const toggleProductVisibility = async (product: any) => {
    await api.put(`/equipment/admin/products/${product.id}`, { visibility: product.visibility === 'hidden' ? 'public' : 'hidden' })
    loadData()
  }

  const saveRail = async () => {
    await updatePageConfig('equipment', rail)
    setMessage('卡片组保存成功')
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <Dashboard>
      <div>
        <AdminHeader
          title="终端装备管理"
          action={(
            <PrimaryButton onClick={() => { setEditingCategory(null); setCategoryError(''); setShowCatForm(true) }} icon={<Plus size={16} />}>新增品类</PrimaryButton>
          )}
        />
        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="mb-8 hidden bg-dark md:block">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/10 text-accent uppercase"><tr><th className="px-6 py-3">名称</th><th className="px-6 py-3">Slug</th><th className="px-6 py-3">描述</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
            <tbody className="text-white">
              {categories.map((c) => (
                <tr key={c.id} className={`border-b border-white/5 cursor-pointer hover:bg-white/5 ${selectedCategory === c.id ? 'bg-white/10' : ''}`} onClick={() => setSelectedCategory(c.id)}>
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-accent">{c.slug}</td>
                  <td className="px-6 py-4 text-accent max-w-[200px] truncate">{c.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); setEditingCategory(c); setCategoryError(''); setShowCatForm(true) }} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(c.id) }} className="text-error hover:text-white"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-8 md:hidden">
          <ResponsiveAdminList items={categories} getKey={(item) => item.id} onSelect={(item) => setSelectedCategory(item.id)} isSelected={(item) => selectedCategory === item.id} renderTitle={(item) => item.name} renderSubtitle={(item) => `${item.slug}${item.description ? ` · ${item.description}` : ''}`} renderActions={(item) => <><button type="button" onClick={() => { setEditingCategory(item); setCategoryError(''); setShowCatForm(true) }} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteCategory(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>} />
        </div>

        {selectedCategory && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[19px] font-bold text-white sm:text-h4">{categories.find((c) => c.id === selectedCategory)?.name} - 产品管理</h2>
              <PrimaryButton onClick={() => openProductForm(null)} icon={<Plus size={16} />}>新增产品</PrimaryButton>
            </div>
            <div className="hidden bg-dark md:block">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-white/10 text-accent uppercase"><tr><th className="px-6 py-3">产品名</th><th className="px-6 py-3">特点</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
                <tbody className="text-white">
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-accent">{featureText(p.features)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openProductForm(p)} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p className="text-accent text-center py-8">暂无产品</p>}
            </div>
            <div className="md:hidden">
              <ResponsiveAdminList items={products} getKey={(item) => item.id} emptyLabel="暂无产品" renderTitle={(item) => item.name} renderSubtitle={(item) => featureText(item.features)} renderActions={(item) => <><button type="button" onClick={() => openProductForm(item)} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteProduct(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>} />
            </div>
            <ContentRailEditor label="终端应用卡片组" items={products} renderCard={(product) => <ApplicationCard key={product.id} product={product} categoryName={categories.find((item) => item.id === selectedCategory)?.name} />} onEdit={openProductForm} onMove={moveProduct} onVisibility={toggleProductVisibility} endCard={rail} onEndCardChange={(patch) => setRail({ ...rail, ...patch })} onSaveEndCard={saveRail} />
          </div>
        )}

        {showCatForm && (
          <Modal title={editingCategory ? '编辑品类' : '新增品类'} onClose={() => setShowCatForm(false)}>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <FormField label="名称" name="name" markup="inline" defaultValue={editingCategory?.name} required />
              <FormField label="Slug" name="slug" defaultValue={editingCategory?.slug} required />
              <FormField label="描述" name="description" markup="inline" defaultValue={editingCategory?.description} textarea />
              {categoryError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{categoryError}</p>}
              <SaveCancelButtons loading={savingCategory} onCancel={() => setShowCatForm(false)} />
            </form>
          </Modal>
        )}

        {showProdForm && (
          <Modal title={editingProduct ? '编辑产品' : '新增产品'} onClose={() => setShowProdForm(false)} maxWidth="max-w-[620px]">
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <FormField label="产品名" name="name" markup="inline" defaultValue={editingProduct?.name} required />
              <FormField
                label="特点（逗号分隔）"
                name="features"
                defaultValue={featureText(editingProduct?.features).replaceAll(' · ', ', ')}
              />
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
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
