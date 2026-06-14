import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'
import PrimaryButton from './components/PrimaryButton'

export default function AdminEquipmentManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [showProdForm, setShowProdForm] = useState(false)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    const cRes = await api.get('/equipment/admin/categories')
    setCategories(cRes.data.data || [])
    if (selectedCategory) {
      const pRes = await api.get('/equipment/admin/products?category_id=' + selectedCategory)
      setProducts(pRes.data.data || [])
    }
  }

  useEffect(() => { loadData() }, [selectedCategory])

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const file = (e.currentTarget as any).bg_image.files[0]
    const formData = new FormData()
    formData.append('name', data.name as string)
    formData.append('slug', data.slug as string)
    formData.append('description', data.description as string)
    formData.append('image_fit', data.image_fit as string)
    if (file) formData.append('bg_image', file)
    if (editingCategory?.bg_image && !file) formData.append('bg_image', editingCategory.bg_image)

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

        <div className="bg-dark mb-8">
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

        {selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h4 text-white">{categories.find((c) => c.id === selectedCategory)?.name} - 产品管理</h2>
              <PrimaryButton onClick={() => { setEditingProduct(null); setShowProdForm(true) }} icon={<Plus size={16} />}>新增产品</PrimaryButton>
            </div>
            <div className="bg-dark">
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
          </div>
        )}

        {showCatForm && (
          <Modal title={editingCategory ? '编辑品类' : '新增品类'} onClose={() => setShowCatForm(false)}>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <FormField label="名称" name="name" defaultValue={editingCategory?.name} required />
              <FormField label="Slug" name="slug" defaultValue={editingCategory?.slug} required />
              <FormField label="描述" name="description" defaultValue={editingCategory?.description} textarea />
              <FormField
                label="图片适配"
                name="image_fit"
                select
                defaultValue={editingCategory?.image_fit || 'cover'}
                options={[
                  { value: 'cover', label: 'Cover（铺满裁剪）' },
                  { value: 'contain', label: 'Contain（完整显示）' },
                  { value: 'original', label: 'Original（原始尺寸）' },
                ]}
              />
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">背景图</label>
                <input type="file" name="bg_image" accept="image/*" className="text-white text-[13px]" />
              </div>
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
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">产品图</label>
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
