import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getEquipmentCategories, getEquipmentProducts, getPageConfig } from '@/api/client'
import CatalogCollection from '@/components/CatalogCollection'
import { CatalogCardSkeleton, CatalogEndCta } from '@/components/CatalogCard'
import ApplicationCard from '@/components/ApplicationCard'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { EquipmentCategory, EquipmentProduct, PageConfig } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'

export default function EndUseEquipment() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState<PageConfig | null>(null)
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [products, setProducts] = useState<EquipmentProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let current = true
    Promise.all([getPageConfig('equipment'), getEquipmentCategories(), getEquipmentProducts()])
      .then(([config, categoryRes, productRes]) => {
        if (!current) return
        setPage(config.data.data)
        setCategories(categoryRes.data.data || [])
        setProducts(productRes.data.data?.products || [])
      })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [])

  const roots = useMemo(
    () => categories.filter((category) => category.parent_id == null).sort((a, b) => a.order_index - b.order_index),
    [categories],
  )
  const requestedRoot = searchParams.get('type')
  const activeRoot = roots.find((category) => category.slug === requestedRoot) || roots[0] || null
  const children = useMemo(
    () => categories.filter((category) => category.parent_id === activeRoot?.id).sort((a, b) => a.order_index - b.order_index),
    [activeRoot?.id, categories],
  )
  const requestedChild = searchParams.get('category')
  const activeChild = children.find((category) => category.slug === requestedChild) || null

  useEffect(() => {
    if (!activeRoot || requestedRoot === activeRoot.slug) return
    const next = new URLSearchParams(searchParams)
    next.set('type', activeRoot.slug)
    next.delete('category')
    setSearchParams(next, { replace: true })
  }, [activeRoot, requestedRoot, searchParams, setSearchParams])

  useEffect(() => {
    if (loading || !requestedChild || activeChild) return
    const next = new URLSearchParams(searchParams)
    next.delete('category')
    setSearchParams(next, { replace: true })
  }, [activeChild, loading, requestedChild, searchParams, setSearchParams])

  const filteredProducts = useMemo(() => {
    if (!activeRoot) return []
    const acceptedIds = new Set(activeChild ? [activeChild.id] : [activeRoot.id, ...children.map((category) => category.id)])
    return products.filter((product) => product.category_ids.some((categoryId) => acceptedIds.has(categoryId)))
  }, [activeChild, activeRoot, children, products])

  const activeCategory = activeChild || activeRoot
  const endCardVisible = page?.rail_end_card_visible !== false

  const selectRoot = (category: EquipmentCategory) => {
    const next = new URLSearchParams(searchParams)
    next.set('type', category.slug)
    next.delete('category')
    setSearchParams(next)
  }

  const selectChild = (category: EquipmentCategory | null) => {
    const next = new URLSearchParams(searchParams)
    if (category) next.set('category', category.slug)
    else next.delete('category')
    setSearchParams(next)
  }

  return (
    <PageShell>
      <PageHero title={page?.page_title || '产品应用'} subtitle={page?.page_subtitle || '查看港翼面料在成衣、鞋履与配件中的应用，以及材料与产品之间的对应关系。'} image={page?.hero_background} imageAlt="港翼面料终端应用" />
      {!loading && <CatalogSelectorBar
        label="终端装备分类"
        groups={[
          {
            label: '产品类别',
            items: roots.map((category) => ({ key: category.id, label: category.name, active: activeRoot?.id === category.id, onSelect: () => selectRoot(category) })),
          },
          ...(children.length > 0 ? [{
            label: `${activeRoot?.name || ''}分类`,
            items: [
              { key: 'all', label: `全部${activeRoot?.name || ''}`, active: !activeChild, onSelect: () => selectChild(null) },
              ...children.map((category) => ({ key: category.id, label: category.name, active: activeChild?.id === category.id, onSelect: () => selectChild(category) })),
            ],
          }] : []),
        ]}
      />}
      <PageSection className="!py-9 lg:!py-12">
        {loading ? <div aria-label="正在加载终端装备内容" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><CatalogCardSkeleton ratio="equipment" /><CatalogCardSkeleton ratio="equipment" /><CatalogCardSkeleton ratio="equipment" /></div> : (
          <div>
            <div className="mb-7 max-w-[680px] border-l-2 border-[#69B2C1] pl-5 md:mb-9">
              <h2 className="type-module-title text-primary"><InlineMarkup text={activeCategory?.name} /></h2>
              <p className="mt-2 text-[14px] leading-6 text-secondary"><InlineMarkup text={activeCategory?.description} /></p>
            </div>

            <div className="min-h-[260px] motion-content-fade" key={`${activeRoot?.id || 'none'}-${activeChild?.id || 'all'}`}>
              {filteredProducts.length > 0 && <CatalogCollection label={`${activeCategory?.name || ''}应用`} desktopColumns={3}>
                {filteredProducts.map((product) => {
                  const mappedCategory = activeChild
                    || product.categories?.find((category) => category.parent_id === activeRoot?.id)
                    || activeRoot
                  return <ApplicationCard key={product.id} product={product} categoryName={mappedCategory?.name} />
                })}
              </CatalogCollection>}
              {endCardVisible && filteredProducts.length === 0 && <CatalogEndCta title={page?.rail_end_card_title ?? '应用合作咨询'} description={page?.rail_end_card_description ?? '围绕具体任务、穿着环境与性能目标，共同确认适用材料和产品方案。'} label={page?.rail_end_card_cta_label ?? '咨询应用方案'} href={page?.rail_end_card_cta_href || '/contact'} />}
            </div>
          </div>
        )}
      </PageSection>
    </PageShell>
  )
}
