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

function CategoryTabs({ items, active, onChange, label, level }: {
  items: EquipmentCategory[]
  active: number | null
  onChange: (category: EquipmentCategory) => void
  label: string
  level: 'primary' | 'secondary'
}) {
  return <nav aria-label={label} className={`gonyik-rail flex max-w-full items-center overflow-x-auto ${level === 'primary' ? 'gap-7 border-b border-border' : 'gap-5'}`}>
    {items.map((item) => {
      const selected = active === item.id
      return <button
        key={item.id}
        type="button"
        aria-current={selected ? 'page' : undefined}
        onClick={() => onChange(item)}
        className={`relative shrink-0 transition-colors duration-[var(--motion-instant)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-[#69B2C1] after:transition-transform after:duration-[var(--motion-switch)] ${
          level === 'primary'
            ? `py-4 text-[15px] font-semibold tracking-[0.04em] ${selected ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'}`
            : `py-2 text-[13px] font-medium tracking-[0.03em] ${selected ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'}`
        }`}
      ><InlineMarkup text={item.name} /></button>
    })}
  </nav>
}

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
      <PageHero variant="detail" tag={page?.page_tag || 'END-USE APPLICATIONS'} title={page?.page_title || '从面料到真实应用'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="港翼面料终端应用" />
      <PageSection className="!py-9 lg:!py-12">
        {loading ? <div aria-label="正在加载终端装备内容" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><CatalogCardSkeleton ratio="equipment" /><CatalogCardSkeleton ratio="equipment" /><CatalogCardSkeleton ratio="equipment" /></div> : (
          <div>
            <CategoryTabs items={roots} active={activeRoot?.id || null} onChange={selectRoot} label="终端装备一级分类" level="primary" />
            <div className="mb-7 flex flex-col gap-5 border-b border-border py-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[680px]">
                <h2 className="type-module-title text-primary"><InlineMarkup text={activeCategory?.name} /></h2>
                <p className="mt-2 text-[14px] leading-6 text-secondary"><InlineMarkup text={activeCategory?.description} /></p>
              </div>
              {children.length > 0 && <div className="flex items-center gap-5 overflow-x-auto">
                <button
                  type="button"
                  aria-current={!activeChild ? 'page' : undefined}
                  onClick={() => selectChild(null)}
                  className={`relative shrink-0 py-2 text-[13px] font-medium tracking-[0.03em] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#69B2C1] after:transition-transform ${!activeChild ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'}`}
                >全部</button>
                <span aria-hidden="true" className="h-4 w-px shrink-0 bg-[#cbd6db]" />
                <CategoryTabs items={children} active={activeChild?.id || null} onChange={selectChild} label={`${activeRoot?.name || ''}二级分类`} level="secondary" />
              </div>}
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
              {endCardVisible && filteredProducts.length === 0 && <CatalogEndCta title={page?.rail_end_card_title ?? '新应用开发中'} description={page?.rail_end_card_description ?? '围绕新的任务与穿着环境持续开发。'} label={page?.rail_end_card_cta_label ?? '提交应用需求'} href={page?.rail_end_card_cta_href || '/contact'} />}
            </div>
          </div>
        )}
      </PageSection>
    </PageShell>
  )
}
