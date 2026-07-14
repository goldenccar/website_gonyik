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

const DEFAULT_RAIL: RailEndCardConfig = { rail_end_card_visible: true, rail_end_card_title: '新应用开发中', rail_end_card_description: '围绕新的任务与穿着环境持续开发。', rail_end_card_cta_label: '', rail_end_card_cta_href: '/contact' }

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

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const formData = new FormData()
    formData.append('name', data.name as string)
    formData.append('slug', data.slug as string)
    formData.append('description', data.description as string)

    if (editingCategory?.id) {
      await api.put(`/equipment/admin/categories/${editingCategory.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/equipment/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    setShowCatForm(false); setEditingCategory(null); loadData()
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const file = (e.currentTarget as any).image.files[0]
    const formData = new FormData()
    formData.append('category_id', String(selectedCategory))
    formData.append('name', data.name as string)
    formData.append('features', JSON.stringify((data.features as string).split(',').map((f) => f.trim())))
    formData.append('card_summary', (data.card_summary as string) || '')
    formData.append('visibility', (data.visibility as string) || 'public')
    formData.append('status', (data.status as string) || 'active')
    if (file) formData.append('image', file)
    if (editingProduct?.image && !file) formData.append('image', editingProduct.image)

    if (editingProduct?.id) {
      await api.put(`/equipment/admin/products/${editingProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/equipment/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    setShowProdForm(false); setEditingProduct(null); loadData()
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('确定删除？')) return
    await api.delete(`/equipment/admin/categories/${id}`)
    loadData()
  }
  const deleteProduct = async (id: number) => {
    if (!confirm('确定删除？')) return
    await api.delete(`/equipment/admin/products/${id}`)
    loadData()
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
            <PrimaryButton onClick={() => { setEditingCategory(null); setShowCatForm(true) }} icon={<Plus size={16} />}>新增品类</PrimaryButton>
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
                    <button onClick={(e) => { e.stopPropagation(); setEditingCategory(c); setShowCatForm(true) }} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(c.id) }} className="text-error hover:text-white"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-8 md:hidden">
          <ResponsiveAdminList items={categories} getKey={(item) => item.id} onSelect={(item) => setSelectedCategory(item.id)} isSelected={(item) => selectedCategory === item.id} renderTitle={(item) => item.name} renderSubtitle={(item) => `${item.slug}${item.description ? ` · ${item.description}` : ''}`} renderActions={(item) => <><button type="button" onClick={() => { setEditingCategory(item); setShowCatForm(true) }} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteCategory(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>} />
        </div>

        {selectedCategory && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[19px] font-bold text-white sm:text-h4">{categories.find((c) => c.id === selectedCategory)?.name} - 产品管理</h2>
              <PrimaryButton onClick={() => { setEditingProduct(null); setShowProdForm(true) }} icon={<Plus size={16} />}>新增产品</PrimaryButton>
            </div>
            <div className="hidden bg-dark md:block">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-white/10 text-accent uppercase"><tr><th className="px-6 py-3">产品名</th><th className="px-6 py-3">特点</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
                <tbody className="text-white">
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-accent">{p.features}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingProduct(p); setShowProdForm(true) }} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p className="text-accent text-center py-8">暂无产品</p>}
            </div>
            <div className="md:hidden">
              <ResponsiveAdminList items={products} getKey={(item) => item.id} emptyLabel="暂无产品" renderTitle={(item) => item.name} renderSubtitle={(item) => { try { return (Array.isArray(item.features) ? item.features : JSON.parse(item.features || '[]')).join(' · ') } catch { return item.features } }} renderActions={(item) => <><button type="button" onClick={() => { setEditingProduct(item); setShowProdForm(true) }} className="flex h-11 w-11 items-center justify-center text-accent" aria-label={`编辑${item.name}`}><Edit2 size={16} /></button><button type="button" onClick={() => deleteProduct(item.id)} className="flex h-11 w-11 items-center justify-center text-error" aria-label={`删除${item.name}`}><Trash2 size={16} /></button></>} />
            </div>
            <ContentRailEditor label="终端应用横向轨道" items={products} renderCard={(product) => <ApplicationCard key={product.id} product={product} categoryName={categories.find((item) => item.id === selectedCategory)?.name} />} onEdit={(product) => { setEditingProduct(product); setShowProdForm(true) }} onMove={moveProduct} onVisibility={toggleProductVisibility} endCard={rail} onEndCardChange={(patch) => setRail({ ...rail, ...patch })} onSaveEndCard={saveRail} />
          </div>
        )}

        {showCatForm && (
          <Modal title={editingCategory ? '编辑品类' : '新增品类'} onClose={() => setShowCatForm(false)}>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <FormField label="名称" name="name" defaultValue={editingCategory?.name} required />
              <FormField label="Slug" name="slug" defaultValue={editingCategory?.slug} required />
              <FormField label="描述" name="description" defaultValue={editingCategory?.description} textarea />
              <SaveCancelButtons onCancel={() => setShowCatForm(false)} />
            </form>
          </Modal>
        )}

        {showProdForm && (
          <Modal title={editingProduct ? '编辑产品' : '新增产品'} onClose={() => setShowProdForm(false)}>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <FormField label="产品名" name="name" defaultValue={editingProduct?.name} required />
              <FormField
                label="特点（逗号分隔）"
                name="features"
                defaultValue={editingProduct?.features ? (Array.isArray(editingProduct.features) ? editingProduct.features : JSON.parse(editingProduct.features)).join(', ') : ''}
              />
              <FormField label="卡片核心收益" name="card_summary" defaultValue={editingProduct?.card_summary} placeholder="一句话说明应用价值" />
              <div className="grid gap-3 sm:grid-cols-2"><FormField label="前台显示" name="visibility" select defaultValue={editingProduct?.visibility || 'public'} options={[{ value: 'public', label: '显示' }, { value: 'hidden', label: '隐藏' }]} /><FormField label="内容状态" name="status" select defaultValue={editingProduct?.status || 'active'} options={[{ value: 'active', label: '正常' }, { value: 'archived', label: '归档' }]} /></div>
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">产品图</label>
                {editingProduct?.image && <img src={editingProduct.image} alt="当前应用卡片图" className="mb-2 aspect-video w-full object-cover" />}
                <input type="file" name="image" accept="image/*" className="text-white text-[13px]" />
              </div>
              <SaveCancelButtons onCancel={() => setShowProdForm(false)} />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
