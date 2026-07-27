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
import type { EquipmentCategory, EquipmentProduct } from '@/types'
import { MATERIAL_PLATFORMS, materialPlatformLabel } from '@/config/materialPlatforms'

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
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [products, setProducts] = useState<EquipmentProduct[]>([])
  const [productFilter, setProductFilter] = useState('all')
  const [secondaryRootFilter, setSecondaryRootFilter] = useState('')
  const [editingCategory, setEditingCategory] = useState<EquipmentCategory | null>(null)
  const [categoryParentPreset, setCategoryParentPreset] = useState<number | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<EquipmentProduct | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [message, setMessage] = useState('')
  const [rail, setRail] = useState<RailEndCardConfig>(DEFAULT_RAIL)
  const [fabricSeries, setFabricSeries] = useState<any[]>([])
  const [fabricSkus, setFabricSkus] = useState<any[]>([])
  const [productImage, setProductImage] = useState<CroppedImageChange>({ file: null, removeCurrent: false })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadCatalog = async () => {
    const [categoryResponse, productResponse] = await Promise.all([
      api.get('/equipment/admin/categories'),
      api.get('/equipment/admin/products'),
    ])
    const nextCategories = categoryResponse.data.data || []
    setCategories(nextCategories)
    setProducts(productResponse.data.data || [])
    const roots = nextCategories.filter((category: EquipmentCategory) => category.parent_id == null)
    setSecondaryRootFilter((current) => roots.some((root: EquipmentCategory) => String(root.id) === current) ? current : String(roots[0]?.id || ''))
  }

  useEffect(() => {
    Promise.all([
      api.get('/equipment/admin/categories'),
      api.get('/equipment/admin/products'),
      api.get('/fabrics/admin/series'),
      api.get('/fabrics/admin/sku'),
      getPageConfig('equipment'),
    ]).then(([categoryRes, productRes, seriesRes, skuRes, pageRes]) => {
      const nextCategories = categoryRes.data.data || []
      setCategories(nextCategories)
      setProducts(productRes.data.data || [])
      setFabricSeries(seriesRes.data.data || [])
      setFabricSkus(skuRes.data.data || [])
      setRail({ ...DEFAULT_RAIL, ...pageRes.data.data })
      const firstRoot = nextCategories.find((category: EquipmentCategory) => category.parent_id == null)
      setSecondaryRootFilter(String(firstRoot?.id || ''))
    })
  }, [])

  const roots = useMemo(
    () => categories.filter((category) => category.parent_id == null).sort((a, b) => a.order_index - b.order_index),
    [categories],
  )
  const children = useMemo(
    () => categories.filter((category) => category.parent_id === Number(secondaryRootFilter)).sort((a, b) => a.order_index - b.order_index),
    [categories, secondaryRootFilter],
  )
  const categoryName = (categoryId: number) => categories.find((item) => item.id === categoryId)?.name || '已删除分类'
  const categoryPath = (categoryId: number) => {
    const category = categories.find((item) => item.id === categoryId)
    if (!category) return '已删除分类'
    const parent = category.parent_id ? categories.find((item) => item.id === category.parent_id) : null
    return parent ? `${parent.name} / ${category.name}` : category.name
  }
  const productCategoryText = (product: EquipmentProduct) => product.category_ids?.length
    ? product.category_ids.map(categoryPath).join('、')
    : '未分组'
  const filteredProducts = useMemo(() => products
    .filter((product) => productFilter === 'all' || product.category_ids?.includes(Number(productFilter)))
    .sort((a, b) => a.order_index - b.order_index || a.id - b.id), [productFilter, products])

  const showMessage = (value: string) => {
    setMessage(value)
    window.setTimeout(() => setMessage(''), 2600)
  }

  const openCategoryForm = (category: EquipmentCategory | null, parentId: number | null = null) => {
    setEditingCategory(category)
    setCategoryParentPreset(category ? category.parent_id : parentId)
    setFormError('')
    setShowCategoryForm(true)
  }

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_id: data.parent_id || null,
        visibility: data.visibility,
      }
      if (editingCategory) await api.put(`/equipment/admin/categories/${editingCategory.id}`, payload)
      else await api.post('/equipment/admin/categories', payload)
      setShowCategoryForm(false)
      setEditingCategory(null)
      await loadCatalog()
      showMessage('分类保存成功')
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '分类保存失败')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (category: EquipmentCategory) => {
    const detail = category.product_count
      ? `该分类当前关联 ${category.product_count} 个SKU。删除只会解除映射，不会删除SKU。`
      : '删除分类不会删除任何SKU。'
    if (!confirm(`${detail}\n\n确定删除“${category.name}”？`)) return
    try {
      await api.delete(`/equipment/admin/categories/${category.id}`)
      await loadCatalog()
      showMessage('分类已删除，SKU数据保持不变')
    } catch (error: any) {
      showMessage(error?.response?.data?.error || '分类删除失败')
    }
  }

  const toggleCategoryVisibility = async (category: EquipmentCategory) => {
    try {
      await api.put(`/equipment/admin/categories/${category.id}`, { visibility: category.visibility === 'hidden' ? 'public' : 'hidden' })
      await loadCatalog()
    } catch (error: any) {
      showMessage(error?.response?.data?.error || '分类显隐更新失败')
    }
  }

  const moveCategory = async (items: EquipmentCategory[], index: number, direction: -1 | 1, parentId: number | null) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await api.put('/equipment/admin/categories/order', { parent_id: parentId, ordered_ids: next.map((item) => item.id) })
      await loadCatalog()
    } catch (error: any) {
      showMessage(error?.response?.data?.error || '分类排序保存失败')
    }
  }

  const openProductForm = (product: EquipmentProduct | null) => {
    setEditingProduct(product)
    setProductImage({ file: null, removeCurrent: false })
    setFormError('')
    setShowProductForm(true)
  }

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const formData = new FormData()
    formData.append('name', String(form.get('name') || ''))
    formData.append('features', JSON.stringify(String(form.get('features') || '').split(/[,，]/).map((feature) => feature.trim()).filter(Boolean)))
    formData.append('card_summary', String(form.get('card_summary') || ''))
    formData.append('visibility', String(form.get('visibility') || 'public'))
    formData.append('status', editingProduct?.status || 'active')
    formData.append('material_platforms', JSON.stringify(form.getAll('material_platforms').map(String)))
    formData.append('category_ids', JSON.stringify(form.getAll('category_ids').map(Number).filter(Number.isFinite)))
    formData.append('related_sku_ids', JSON.stringify(form.getAll('related_sku_ids').map(Number).filter(Number.isFinite)))
    formData.append('remove_image', productImage.removeCurrent ? 'true' : 'false')
    if (productImage.file) formData.append('image', productImage.file)

    setSaving(true)
    setFormError('')
    try {
      if (editingProduct?.id) await api.put(`/equipment/admin/products/${editingProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      else await api.post('/equipment/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowProductForm(false)
      setEditingProduct(null)
      setProductImage({ file: null, removeCurrent: false })
      await loadCatalog()
      showMessage('SKU保存成功')
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '保存失败，请检查必填项后重试')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('确定删除该终端产品SKU？分类调整不需要删除SKU。')) return
    await api.delete(`/equipment/admin/products/${id}`)
    await loadCatalog()
    showMessage('SKU删除成功')
  }

  const moveProduct = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= filteredProducts.length || productFilter !== 'all') return
    const next = [...filteredProducts]
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await api.put('/equipment/admin/product-order', { ordered_ids: next.map((item) => item.id) })
      await loadCatalog()
    } catch (error: any) {
      showMessage(error?.response?.data?.error || '排序保存失败')
    }
  }

  const toggleProductVisibility = async (product: EquipmentProduct) => {
    await api.put(`/equipment/admin/products/${product.id}`, { visibility: product.visibility === 'hidden' ? 'public' : 'hidden' })
    await loadCatalog()
  }

  const saveRail = async () => {
    await updatePageConfig('equipment', rail)
    showMessage('开发中提示保存成功')
  }

  return <Dashboard>
    <div>
      <AdminHeader title="终端装备管理" />
      {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
      <div className="border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] leading-5 text-muted">
        SKU与分类独立维护。分类只负责前台分组；隐藏分类会保留全部映射，删除分类只解除映射，不会删除SKU。前台至少保留一个显示中的一级分类。
      </div>

      <CatalogCrudSection
        title="一级分类"
        description="维护终端装备的一级入口。鞋履可先保持隐藏；仅有一个显示中的一级分类时，系统仍会保留该入口。"
        actionLabel="新增一级分类"
        filters={[{ value: 'all', label: '全部一级分类' }]}
        filterValue="all"
        onFilterChange={() => {}}
        items={roots}
        columns={[
          { label: '分类', render: (category) => <span className="font-medium">{category.name}</span> },
          { label: '标识', render: (category) => <span className="text-accent">{category.slug}</span> },
          { label: '关联SKU', render: (category) => <span className="text-accent">{category.product_count || 0}</span> },
        ]}
        getTitle={(category) => category.name}
        getSubtitle={(category) => `${category.slug} · ${category.product_count || 0} 个直接关联SKU`}
        onAdd={() => openCategoryForm(null)}
        onEdit={(category) => openCategoryForm(category)}
        onDelete={deleteCategory}
        onVisibility={toggleCategoryVisibility}
        onMove={(index, direction) => moveCategory(roots, index, direction, null)}
        orderHint="隐藏不会改变分类关系；删除存在二级分类的一级分类前，需要先移动或删除其二级分类。"
        emptyLabel="至少需要一个一级分类"
      />

      <CatalogCrudSection
        title="二级分类"
        description="二级分类属于某个一级分类，用于场景或产品类型筛选。一级分类允许没有二级分类。"
        actionLabel="新增二级分类"
        filters={roots.map((root) => ({ value: String(root.id), label: root.name }))}
        filterValue={secondaryRootFilter}
        onFilterChange={setSecondaryRootFilter}
        items={children}
        columns={[
          { label: '上级', render: (category) => <span className="text-accent">{categoryName(category.parent_id || 0)}</span> },
          { label: '分类', render: (category) => <span className="font-medium">{category.name}</span> },
          { label: '关联SKU', render: (category) => <span className="text-accent">{category.product_count || 0}</span> },
        ]}
        getTitle={(category) => category.name}
        getSubtitle={(category) => `${categoryName(category.parent_id || 0)} / ${category.slug} · ${category.product_count || 0} 个SKU`}
        onAdd={() => openCategoryForm(null, Number(secondaryRootFilter) || roots[0]?.id || null)}
        onEdit={(category) => openCategoryForm(category)}
        onDelete={deleteCategory}
        onVisibility={toggleCategoryVisibility}
        onMove={(index, direction) => moveCategory(children, index, direction, Number(secondaryRootFilter))}
        orderHint="二级分类可单独隐藏；上级一级分类隐藏时，其二级分类会同时从前台消失，但自身显隐状态和映射不变。"
        emptyLabel="该一级分类暂无二级分类"
      />

      <CatalogCrudSection
        title="终端产品SKU"
        description="统一维护全部SKU。一个SKU可以映射到多个分类；未分组SKU会保留在CMS，但不会出现在前台目录。"
        actionLabel="新增终端产品"
        filters={[
          { value: 'all', label: '全部SKU' },
          ...categories.map((category) => ({ value: String(category.id), label: categoryPath(category.id) })),
        ]}
        filterValue={productFilter}
        onFilterChange={setProductFilter}
        items={filteredProducts}
        columns={[
          { label: '映射分组', render: (product) => <span className={product.category_ids?.length ? 'text-accent' : 'text-warning'}>{productCategoryText(product)}</span> },
          { label: '产品名', render: (product) => <span className="font-medium">{product.name}</span> },
          { label: '材料平台', render: (product) => <span className="text-accent">{product.material_platforms.length ? product.material_platforms.map((key) => materialPlatformLabel(key)).join(' · ') : '—'}</span> },
        ]}
        getTitle={(product) => product.name}
        getSubtitle={(product) => `${productCategoryText(product)}${product.material_platforms.length ? ` · ${product.material_platforms.map((key) => materialPlatformLabel(key, 'badge')).join(' · ')}` : ''}`}
        onAdd={() => openProductForm(null)}
        onEdit={openProductForm}
        onDelete={(product) => deleteProduct(product.id)}
        onVisibility={toggleProductVisibility}
        onMove={productFilter === 'all' ? moveProduct : undefined}
        orderHint={productFilter === 'all' ? '此处维护唯一的全局SKU顺序；各分类只按映射过滤，不保存另一套排序。' : '当前列表继承全部SKU的全局顺序。'}
        emptyLabel="暂无终端产品"
      />

      <EndCardEditor config={rail} onChange={(patch) => setRail({ ...rail, ...patch })} onSave={saveRail} title="终端装备开发中提示" />

      {showCategoryForm && <Modal title={editingCategory ? '编辑分类' : categoryParentPreset ? '新增二级分类' : '新增一级分类'} onClose={() => setShowCategoryForm(false)} maxWidth="max-w-[560px]">
        <form onSubmit={saveCategory} className="space-y-4">
          <FormField label="分类层级" name="parent_id" select defaultValue={String(editingCategory?.parent_id ?? categoryParentPreset ?? '')} options={[{ value: '', label: '一级分类' }, ...roots.filter((root) => root.id !== editingCategory?.id).map((root) => ({ value: String(root.id), label: `二级分类 · ${root.name}` }))]} />
          <FormField label="分类名称" name="name" defaultValue={editingCategory?.name} required />
          <FormField label="分类标识" name="slug" defaultValue={editingCategory?.slug} placeholder="例如 apparel、outdoor" required>
            <p className="mt-1 text-[11px] leading-5 text-muted">用于URL，只能使用小写字母、数字和短横线；发布后尽量不要频繁修改。</p>
          </FormField>
          <FormField label="分类说明" name="description" textarea rows={3} defaultValue={editingCategory?.description} />
          <FormField label="前台显示" name="visibility" select defaultValue={editingCategory?.visibility || 'public'} options={[{ value: 'public', label: '显示' }, { value: 'hidden', label: '隐藏' }]} />
          {formError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{formError}</p>}
          <SaveCancelButtons loading={saving} onCancel={() => setShowCategoryForm(false)} />
        </form>
      </Modal>}

      {showProductForm && <Modal title={editingProduct ? '编辑终端产品' : '新增终端产品'} onClose={() => setShowProductForm(false)} maxWidth="max-w-[720px]">
        <form onSubmit={saveProduct} className="space-y-4">
          <FormField label="产品名" name="name" markup="inline" defaultValue={editingProduct?.name} required />
          <FormField label="特点（逗号分隔）" name="features" defaultValue={featureText(editingProduct?.features).replaceAll(' · ', ', ')} />
          <FormField label="卡片核心收益" name="card_summary" markup="inline" defaultValue={editingProduct?.card_summary} placeholder="一句话说明应用价值" />
          <FormField label="前台显示" name="visibility" select defaultValue={editingProduct?.visibility || 'public'} options={[{ value: 'public', label: '显示' }, { value: 'hidden', label: '隐藏' }]} />

          <fieldset className="border border-white/10 p-4">
            <legend className="px-1 text-[12px] uppercase tracking-[0.08em] text-secondary">材料平台</legend>
            <p className="mb-3 text-[12px] leading-5 text-accent">材料平台与产品系列、页面分类相互独立；只勾选当前产品实际采用的平台。</p>
            <div className="space-y-2">
              {MATERIAL_PLATFORMS.map((platform) => <label key={platform.key} className="flex cursor-pointer items-start gap-3 border border-white/10 p-3 text-[13px] text-white hover:border-white/25">
                <input type="checkbox" name="material_platforms" value={platform.key} defaultChecked={editingProduct?.material_platforms?.includes(platform.key)} className="mt-0.5 accent-[#69B2C1]" />
                <span><span className="font-medium">{platform.name}</span><span className="mt-1 block text-[12px] leading-5 text-accent">{platform.description}</span></span>
              </label>)}
            </div>
          </fieldset>

          <fieldset className="border border-white/10 p-4">
            <legend className="px-1 text-[12px] uppercase tracking-[0.08em] text-secondary">分类映射</legend>
            <p className="mb-3 text-[12px] leading-5 text-accent">可选择多个分组。删除分类只解除这里的映射，不会删除当前SKU。</p>
            <div className="space-y-3">
              {roots.map((root) => {
                const rootChildren = categories.filter((category) => category.parent_id === root.id).sort((a, b) => a.order_index - b.order_index)
                return <div key={root.id} className="border border-white/10 p-3">
                  <label className="flex cursor-pointer items-center gap-3 text-[13px] font-medium text-white">
                    <input type="checkbox" name="category_ids" value={root.id} defaultChecked={editingProduct?.category_ids?.includes(root.id)} className="accent-[#69B2C1]" />
                    {root.name}<span className="text-[11px] font-normal text-muted">直接归入一级分类</span>
                  </label>
                  {rootChildren.length > 0 && <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-2">
                    {rootChildren.map((category) => <label key={category.id} className="flex cursor-pointer items-center gap-3 text-[12px] text-accent">
                      <input type="checkbox" name="category_ids" value={category.id} defaultChecked={editingProduct?.category_ids?.includes(category.id)} className="accent-[#69B2C1]" />
                      {category.name}
                    </label>)}
                  </div>}
                </div>
              })}
            </div>
          </fieldset>

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
          <SaveCancelButtons loading={saving} onCancel={() => setShowProductForm(false)} />
        </form>
      </Modal>}
    </div>
  </Dashboard>
}
