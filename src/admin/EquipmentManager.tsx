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
import { SERIES_FEATURE_ICONS } from '@/config/seriesFeatures'
import { useSiteLocale } from '@/i18n/SiteLocale'

const DEFAULT_RAIL: RailEndCardConfig = { rail_end_card_visible: true, rail_end_card_title: '', rail_end_card_description: '', rail_end_card_cta_label: '', rail_end_card_cta_href: '' }


export default function AdminEquipmentManager() {
  const { bootstrap } = useSiteLocale()
  const [featureRows, setFeatureRows] = useState<Array<{ text: string; icon: string }>>([])
  const [sceneRows, setSceneRows] = useState<NonNullable<EquipmentProduct['scene_images']>>([])
  const [selectedSeries, setSelectedSeries] = useState<number[]>([])
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
      ? `该分类当前关联 ${category.product_count} 个条目。删除只会解除映射，不会删除条目。`
      : '删除分类不会删除任何条目。'
    if (!confirm(`${detail}\n\n确定删除“${category.name}”？`)) return
    try {
      await api.delete(`/equipment/admin/categories/${category.id}`)
      await loadCatalog()
      showMessage('分类已删除，条目数据保持不变')
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
    setSceneRows(product?.scene_images || [])
    setSelectedSeries(product?.related_series_ids || [])
    let values: string[] = []
    try { const parsed = JSON.parse(product?.features || '[]'); if (Array.isArray(parsed)) values = parsed.map(String) } catch {}
    setFeatureRows(values.map((text, i) => ({ text, icon: product?.feature_icons?.[i] || 'none' })))
    setProductImage({ file: null, removeCurrent: false })
    setFormError('')
    setShowProductForm(true)
  }

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const formData = new FormData()
    formData.append('name', String(form.get('name') || ''))
    formData.append('entry_type', String(form.get('entry_type') || 'application'))
    formData.append('scene_images', JSON.stringify(sceneRows.filter(scene => scene.image.trim())))
    formData.append('sample_ids', JSON.stringify(form.getAll('sample_ids').map(Number)))
    const validFeatures = featureRows.filter(row => row.text.trim())
    formData.append('features', JSON.stringify(validFeatures.map(row => row.text.trim())))
    formData.append('feature_icons', JSON.stringify(validFeatures.map(row => row.icon)))
    for (const key of ['case_label', 'image', 'image_alt', 'image_caption', 'image_fit', 'image_position', 'features_label', 'detail_title', 'detail_body', 'series_label', 'cta_label', 'cta_href']) formData.append(key, String(form.get(key) || ''))
      formData.append('related_series_ids', JSON.stringify(selectedSeries))
    formData.append('market_visibility', JSON.stringify(Object.fromEntries(bootstrap.markets.map(market => [market.code, String(form.get('market_' + market.code) || 'inherit')]))))
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
      showMessage('条目保存成功')
    } catch (error: any) {
      setFormError(error?.response?.data?.error || '保存失败，请检查必填项后重试')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('确定删除该应用条目？分类调整不需要删除条目。')) return
    await api.delete(`/equipment/admin/products/${id}`)
    await loadCatalog()
    showMessage('条目删除成功')
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
    showMessage('页尾咨询保存成功')
  }

  return <Dashboard>
    <div>
      <AdminHeader title="面料应用管理" />
      {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
      <div className="border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] leading-5 text-muted">
        条目与分类独立维护。分类保留内部归档与显示控制，前台按应用逐项展示；隐藏分类会保留全部映射，删除分类只解除映射，不会删除条目。前台至少保留一个显示中的一级分类。
      </div>

      <CatalogCrudSection
        title="一级分类"
        description="保留分类与历史映射；空分类不会出现在公开目录。"
        actionLabel="新增一级分类"
        filters={[{ value: 'all', label: '全部一级分类' }]}
        filterValue="all"
        onFilterChange={() => {}}
        items={roots}
        columns={[
          { label: '分类', render: (category) => <span className="font-medium">{category.name}</span> },
          { label: '标识', render: (category) => <span className="text-accent">{category.slug}</span> },
          { label: '关联条目', render: (category) => <span className="text-accent">{category.product_count || 0}</span> },
        ]}
        getTitle={(category) => category.name}
        getSubtitle={(category) => `${category.slug} · ${category.product_count || 0} 个直接关联条目`}
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
          { label: '关联条目', render: (category) => <span className="text-accent">{category.product_count || 0}</span> },
        ]}
        getTitle={(category) => category.name}
        getSubtitle={(category) => `${categoryName(category.parent_id || 0)} / ${category.slug} · ${category.product_count || 0} 个条目`}
        onAdd={() => openCategoryForm(null, Number(secondaryRootFilter) || roots[0]?.id || null)}
        onEdit={(category) => openCategoryForm(category)}
        onDelete={deleteCategory}
        onVisibility={toggleCategoryVisibility}
        onMove={(index, direction) => moveCategory(children, index, direction, Number(secondaryRootFilter))}
        orderHint="二级分类可单独隐藏；上级一级分类隐藏时，其二级分类会同时从前台消失，但自身显隐状态和映射不变。"
        emptyLabel="该一级分类暂无二级分类"
      />

      <CatalogCrudSection
        title="应用条目"
        description="统一维护全部条目。一个条目可以映射到多个分类；未分组条目会保留在CMS，但不会出现在前台目录。"
        actionLabel="新增应用条目"
        filters={[
          { value: 'all', label: '全部条目' },
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
        orderHint={productFilter === 'all' ? '此处维护唯一的全局条目顺序；各分类只按映射过滤，不保存另一套排序。' : '当前列表继承全部条目的全局顺序。'}
        emptyLabel="暂无应用条目"
      />

      <EndCardEditor config={rail} onChange={(patch) => setRail({ ...rail, ...patch })} onSave={saveRail} title="应用页尾咨询" />

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

      {showProductForm && <Modal title={editingProduct ? '编辑应用条目' : '新增应用条目'} onClose={() => setShowProductForm(false)} maxWidth="max-w-[720px]">
        <form onSubmit={saveProduct} className="space-y-4">
          <FormField label="产品名" name="name" markup="inline" defaultValue={editingProduct?.name} required />
          <fieldset className="space-y-3 border border-white/10 p-4">
            <legend className="px-1 text-sm">选材要点与图标</legend>
            <FormField label="要点区域标题（可留空）" name="features_label" defaultValue={editingProduct?.features_label} />
            {featureRows.map((row, index) => <div key={index} className="grid grid-cols-[1fr_150px_auto] gap-2">
              <FormField label={"要点 " + (index + 1)} name={"feature_" + index} value={row.text} onChange={event => setFeatureRows(rows => rows.map((value, i) => i === index ? { ...value, text: event.target.value } : value))} />
              <FormField label="图标" name={"icon_" + index} select value={row.icon} options={SERIES_FEATURE_ICONS.map(icon => ({ value: icon.key, label: icon.label }))} onChange={event => setFeatureRows(rows => rows.map((value, i) => i === index ? { ...value, icon: event.target.value } : value))} />
              <button type="button" className="self-end p-2 text-sm text-muted" onClick={() => setFeatureRows(rows => rows.filter((_, i) => i !== index))}>移除</button>
            </div>)}
            {featureRows.length < 8 && <button type="button" className="text-sm text-accent" onClick={() => setFeatureRows(rows => [...rows, { text: '', icon: 'none' }])}>＋ 添加选材要点</button>}
          </fieldset>
          <FormField label="条目类型" name="entry_type" select defaultValue={editingProduct?.entry_type || 'application'} options={[{value:'application',label:'应用方向（页面大模块）'},{value:'sample',label:'具体产品 / 开发样品（关联展示）'}]} />
          <fieldset className="border border-white/10 p-4 space-y-3">
            <legend className="px-1 text-sm">关联产品与开发样品</legend>
            <p className="text-xs text-muted">保留历史产品关联供内部维护。前台不再单独展示成品卡片或成品详情页。</p>
            {products.filter(item => item.entry_type === 'sample' && item.id !== editingProduct?.id).map(item => <label key={item.id} className="flex gap-3 text-sm"><input type="checkbox" name="sample_ids" value={item.id} defaultChecked={editingProduct?.sample_ids?.includes(item.id)} />{item.name}{item.visibility === 'hidden' ? '（隐藏）' : ''}</label>)}
          </fieldset>
          <fieldset className="space-y-4 border border-white/10 p-4">
            <legend className="px-1 text-sm">应用场景小图</legend>
            <p className="text-xs text-muted">放在本模块图文下方，桌面四张、手机两张；超过四张可手动左右循环切换，不自动播放。前台不显示标题或图注；可从媒体库复制地址，替代文本供无障碍阅读使用。</p>
            {sceneRows.map((scene,index)=><div key={index} className="space-y-2 border-b border-white/10 pb-4">
              {scene.image && <img src={scene.image} alt="" className="h-24 w-36 object-cover" />}
              <FormField label={'场景图片 '+(index+1)} name={'scene_image_'+index} value={scene.image} onChange={event=>setSceneRows(rows=>rows.map((row,i)=>i===index?{...row,image:event.target.value}:row))}/>
              <FormField label="替代文本" name={'scene_alt_'+index} value={scene.alt} onChange={event=>setSceneRows(rows=>rows.map((row,i)=>i===index?{...row,alt:event.target.value}:row))}/>
              <div className="flex gap-4 text-sm"><button type="button" disabled={index===0} className="text-accent disabled:opacity-30" onClick={()=>setSceneRows(rows=>{const next=[...rows];[next[index-1],next[index]]=[next[index],next[index-1]];return next})}>上移</button><button type="button" disabled={index===sceneRows.length-1} className="text-accent disabled:opacity-30" onClick={()=>setSceneRows(rows=>{const next=[...rows];[next[index+1],next[index]]=[next[index],next[index+1]];return next})}>下移</button><button type="button" className="text-muted" onClick={()=>setSceneRows(rows=>rows.filter((_,i)=>i!==index))}>移除</button></div>
            </div>)}
            {sceneRows.length<16 && <button type="button" className="text-sm text-accent" onClick={()=>setSceneRows(rows=>[...rows,{image:'',alt:''}])}>＋ 添加场景图片</button>}
          </fieldset>
          <FormField label="应用简介" name="card_summary" markup="inline" defaultValue={editingProduct?.card_summary} placeholder="一句话说明应用价值" />
          <FormField label="前台显示" name="visibility" select defaultValue={editingProduct?.visibility || 'public'} options={[{ value: 'public', label: '显示' }, { value: 'hidden', label: '隐藏' }]} />

          <FormField label="内容性质（如应用方向、开发实例，可留空）" name="case_label" defaultValue={editingProduct?.case_label} />
          <FormField label="补充标题（可留空）" name="detail_title" defaultValue={editingProduct?.detail_title} />
          <FormField label="补充说明（可留空）" name="detail_body" textarea rows={3} defaultValue={editingProduct?.detail_body} />
          <FormField label="系列区域标题（可留空）" name="series_label" defaultValue={editingProduct?.series_label} />
          <fieldset className="border border-white/10 p-4">
            <legend className="px-1 text-sm">关联系列（独立于型号，可多选）</legend>
            <div className="flex flex-wrap gap-5">{fabricSeries.map(series => <label key={series.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedSeries.includes(series.id)} onChange={event => setSelectedSeries(current => event.target.checked ? [...current, series.id] : current.filter(id => id !== series.id))} />{series.name}</label>)}</div>
            <ol className="mt-4 space-y-2">{selectedSeries.map((id, index) => <li key={id} className="flex items-center justify-between text-sm"><span>{fabricSeries.find(series => series.id === id)?.name}</span>{index > 0 && <button type="button" className="text-accent" onClick={() => setSelectedSeries(current => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next })}>上移</button>}</li>)}</ol>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="咨询按钮文字" name="cta_label" defaultValue={editingProduct?.cta_label} /><FormField label="咨询按钮链接" name="cta_href" defaultValue={editingProduct?.cta_href} /></div>
          <fieldset className="grid gap-3 border border-white/10 p-4 sm:grid-cols-2"><legend className="px-1 text-sm">市场可见性</legend>{bootstrap.markets.map(market => <FormField key={market.code} label={market.label} name={'market_' + market.code} select defaultValue={editingProduct?.market_visibility?.[market.code] || 'inherit'} options={[{value:'inherit',label:'跟随市场默认'},{value:'public',label:'显示'},{value:'hidden',label:'隐藏'}]} />)}</fieldset>
          <fieldset className="border border-white/10 p-4">
            <legend className="px-1 text-[12px] uppercase tracking-[0.08em] text-secondary">材料平台（内部关联保留）</legend>
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
            <p className="mb-3 text-[12px] leading-5 text-accent">可选择多个分组。删除分类只解除这里的映射，不会删除当前条目。</p>
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
            <p className="mb-3 text-[12px] leading-5 text-accent">保留实际采用面料的内部关联，不作为场景图的性能证明。</p>
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
          <FormField label="图片地址（可粘贴媒体库地址，留空可清除）" name="image" defaultValue={editingProduct?.image || ''} />
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="图片替代文字" name="image_alt" defaultValue={editingProduct?.image_alt} /><FormField label="图片说明（如应用示意）" name="image_caption" defaultValue={editingProduct?.image_caption} /></div>
          <FormField label="图片焦点（横向% 纵向%，如 70% 50%）" name="image_position" defaultValue={editingProduct?.image_position || ''} />
          <FormField label="图片适配" name="image_fit" select defaultValue={editingProduct?.image_fit || 'cover'} options={[{value:'cover',label:'铺满裁切'},{value:'contain',label:'完整展示'}]} />
          <CroppedImageField key={editingProduct?.id || 'new'} label="上传应用图片" currentSrc={editingProduct?.image} aspect={4/3} fileBaseName="application" outputType="image/webp" fit="cover" onChange={setProductImage} help="建议 4:3 场景或产品图。上传将替换图片地址；生成图应在图片说明中标注应用示意。" />
          {formError && <p className="border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error">{formError}</p>}
          <SaveCancelButtons loading={saving} onCancel={() => setShowProductForm(false)} />
        </form>
      </Modal>}
    </div>
  </Dashboard>
}
