import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { getEquipmentCategories, getEquipmentProducts, getPageConfig } from '@/api/client'
import CatalogCollection from '@/components/CatalogCollection'
import { CatalogCardSkeleton, CatalogEndCta } from '@/components/CatalogCard'
import ApplicationCard from '@/components/ApplicationCard'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { EquipmentCategory, EquipmentProduct, PageConfig } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'

function CategoryTabs({ items, active, onChange, label }: {
  items: EquipmentCategory[]
  active: number | null
  onChange: (category: EquipmentCategory) => void
  label: string
}) {
  return <nav aria-label={label} className="gonyik-rail flex max-w-full items-center gap-8 overflow-x-auto border-b border-border md:gap-11">
    {items.map((item) => {
      const selected = active === item.id
      return <button
        key={item.id}
        type="button"
        aria-current={selected ? 'page' : undefined}
        onClick={() => onChange(item)}
        className={`relative shrink-0 py-4 text-[16px] font-medium tracking-[0.025em] transition-colors duration-[var(--motion-instant)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:origin-left after:bg-[#69B2C1] after:transition-transform after:duration-[var(--motion-switch)] md:py-5 md:text-[17px] ${
          selected ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'
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
  const [filterOpen, setFilterOpen] = useState(false)
  const [draftChildId, setDraftChildId] = useState<number | null>(null)

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

  const draftCategory = children.find((category) => category.id === draftChildId) || null
  const draftResultCount = useMemo(() => {
    if (!activeRoot) return 0
    const acceptedIds = new Set(draftCategory ? [draftCategory.id] : [activeRoot.id, ...children.map((category) => category.id)])
    return products.filter((product) => product.category_ids.some((categoryId) => acceptedIds.has(categoryId))).length
  }, [activeRoot, children, draftCategory, products])

  const activeCategory = activeChild || activeRoot
  const endCardVisible = page?.rail_end_card_visible !== false

  const selectRoot = (category: EquipmentCategory) => {
    const next = new URLSearchParams(searchParams)
    next.set('type', category.slug)
    next.delete('category')
    setSearchParams(next)
    setFilterOpen(false)
  }

  const selectChild = (category: EquipmentCategory | null) => {
    const next = new URLSearchParams(searchParams)
    if (category) next.set('category', category.slug)
    else next.delete('category')
    setSearchParams(next)
  }

  const openCategoryFilter = () => {
    setDraftChildId(activeChild?.id || null)
    setFilterOpen(true)
  }

  const applyCategoryFilter = () => {
    selectChild(draftCategory)
    setFilterOpen(false)
  }

  useEffect(() => {
    if (!filterOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFilterOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [filterOpen])

  return (
    <PageShell>
      <PageHero variant="detail" tag={page?.page_tag || 'END-USE APPLICATIONS'} title={page?.page_title || '从面料到真实应用'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="港翼面料终端应用" />
      <PageSection className="!py-9 lg:!py-12">
        {loading ? <div aria-label="正在加载终端装备内容" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><CatalogCardSkeleton ratio="equipment" /><CatalogCardSkeleton ratio="equipment" /><CatalogCardSkeleton ratio="equipment" /></div> : (
          <div>
            <CategoryTabs items={roots} active={activeRoot?.id || null} onChange={selectRoot} label="终端装备产品类别" />

            <div className="my-7 max-w-[680px] border-l-2 border-[#69B2C1] pl-5 md:my-9">
              <h2 className="type-module-title text-primary"><InlineMarkup text={activeCategory?.name} /></h2>
              <p className="mt-2 text-[14px] leading-6 text-secondary"><InlineMarkup text={activeCategory?.description} /></p>
            </div>

            <div className="relative mb-7 flex min-h-16 items-center justify-between gap-5 border-y border-border py-3">
              <p className="text-[12px] font-medium tracking-[0.1em] text-secondary">
                产品结果 <span className="ml-1 text-primary">（{filteredProducts.length}）</span>
              </p>
              {children.length > 0 && <button
                type="button"
                aria-expanded={filterOpen}
                aria-controls="equipment-category-filter"
                onClick={openCategoryFilter}
                className="group inline-flex min-h-10 items-center gap-2.5 border border-border bg-white px-4 text-[13px] font-medium text-primary transition-[border-color,background-color] duration-[var(--motion-instant)] hover:border-[#69B2C1] hover:bg-[#f7fafb]"
              >
                <SlidersHorizontal aria-hidden="true" size={15} strokeWidth={1.7} />
                <span>{activeChild ? activeChild.name : `全部${activeRoot?.name || ''}`}</span>
                <ChevronDown aria-hidden="true" size={15} className={`transition-transform duration-[var(--motion-switch)] ${filterOpen ? 'rotate-180' : ''}`} />
              </button>}

              {filterOpen && <>
                <button type="button" aria-label="关闭分类筛选" onClick={() => setFilterOpen(false)} className="fixed inset-0 z-40 cursor-default bg-[#041f38]/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none" />
                <section
                  id="equipment-category-filter"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`${activeRoot?.name || ''}分类筛选`}
                  className="motion-content-fade fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto border-t border-border bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 shadow-[0_-18px_55px_rgba(4,31,56,0.16)] md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-[calc(100%+8px)] md:w-[340px] md:border md:p-5 md:shadow-[0_20px_55px_rgba(4,31,56,0.14)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium tracking-[0.1em] text-secondary">筛选分类</p>
                      <p className="mt-1 text-[15px] font-medium text-primary">{activeRoot?.name}</p>
                    </div>
                    <button type="button" aria-label="关闭" onClick={() => setFilterOpen(false)} className="grid size-10 place-items-center text-secondary transition-colors hover:text-primary">
                      <X aria-hidden="true" size={19} />
                    </button>
                  </div>

                  <div role="radiogroup" aria-label={`${activeRoot?.name || ''}分类`} className="border-y border-border">
                    {[null, ...children].map((category) => {
                      const selected = category ? draftChildId === category.id : draftChildId == null
                      return <button
                        key={category?.id || 'all'}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setDraftChildId(category?.id || null)}
                        className={`flex min-h-14 w-full items-center justify-between border-b border-border px-1 text-left text-[14px] transition-colors last:border-b-0 ${
                          selected ? 'font-medium text-primary' : 'text-secondary hover:bg-[#f7fafb] hover:text-primary'
                        }`}
                      >
                        <span>{category ? <InlineMarkup text={category.name} /> : `全部${activeRoot?.name || ''}`}</span>
                        <span aria-hidden="true" className={`grid size-6 place-items-center border transition-colors ${selected ? 'border-[#69B2C1] bg-[#eaf6f8] text-[#2f8191]' : 'border-border text-transparent'}`}>
                          <Check size={14} strokeWidth={2} />
                        </span>
                      </button>
                    })}
                  </div>

                  <div className="mt-5 grid grid-cols-[0.8fr_1.2fr] gap-3">
                    <button type="button" onClick={() => setDraftChildId(null)} disabled={draftChildId == null} className="min-h-11 border border-border px-3 text-[12px] font-medium tracking-[0.08em] text-secondary transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35">清除</button>
                    <button type="button" onClick={applyCategoryFilter} className="min-h-11 bg-primary px-3 text-[12px] font-medium tracking-[0.08em] text-white transition-colors hover:bg-[#123a59]">查看 {draftResultCount} 项</button>
                  </div>
                </section>
              </>}
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
