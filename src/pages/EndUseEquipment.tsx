import { useEffect, useState } from 'react'
import { getCategoryProducts, getEquipmentCategories, getPageConfig } from '@/api/client'
import CatalogCollection from '@/components/CatalogCollection'
import { CatalogCardSkeleton, CatalogEndCta } from '@/components/CatalogCard'
import ApplicationCard from '@/components/ApplicationCard'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { EquipmentCategory, EquipmentProduct, PageConfig } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'

export default function EndUseEquipment() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [active, setActive] = useState('')
  const [products, setProducts] = useState<EquipmentProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    Promise.all([getPageConfig('equipment'), getEquipmentCategories()]).then(([config, list]) => {
      const items = list.data.data || []
      setPage(config.data.data)
      setCategories(items)
      setActive(items[0]?.slug || '')
    })
  }, [])

  useEffect(() => {
    if (!active) return
    let current = true
    setLoadingProducts(true)
    getCategoryProducts(active).then((res) => {
      if (current) setProducts(res.data.data?.products || [])
    }).finally(() => {
      if (current) setLoadingProducts(false)
    })
    return () => { current = false }
  }, [active])

  const category = categories.find((item) => item.slug === active)
  const endCardVisible = page?.rail_end_card_visible !== false

  return (
    <PageShell>
      <PageHero variant="detail" tag={page?.page_tag || 'END-USE APPLICATIONS'} title={page?.page_title || '从面料到真实应用'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="港翼面料终端应用" />
      <PageSection className="!py-9 lg:!py-12">
        <div key={active} className="motion-content-enter">
        <div className="mb-7 flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[680px]"><h2 className="type-module-title text-primary"><InlineMarkup text={category?.name} /></h2><p className="mt-2 text-[14px] leading-6 text-secondary"><InlineMarkup text={category?.description} /></p></div>
          <nav aria-label="终端应用分类" className="flex max-w-full items-center gap-5 overflow-x-auto pb-0.5">{categories.map((item) => <div key={item.id} className="flex shrink-0 items-center gap-5">{item.slug === 'special' && <span aria-hidden="true" className="text-[16px] font-light text-[#c4d0d6]">｜</span>}<button onClick={() => setActive(item.slug)} className={`relative shrink-0 py-2 text-[13px] font-medium tracking-[0.03em] transition-colors duration-[var(--motion-instant)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-[#69B2C1] after:transition-transform after:duration-[var(--motion-switch)] ${active === item.slug ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary'}`}>{item.name}</button></div>)}</nav>
        </div>
        <div className="min-h-[260px]">
        {loadingProducts ? <div aria-label="正在加载该分类内容" className="grid gap-5 md:grid-cols-2"><CatalogCardSkeleton ratio="equipment" /><CatalogCardSkeleton ratio="equipment" /></div> : <>
          <CatalogCollection label={`${category?.name || ''}应用`}>
            {products.map((product) => <ApplicationCard key={product.id} product={product} categoryName={category?.name} />)}
          </CatalogCollection>
          {endCardVisible && <CatalogEndCta title={page?.rail_end_card_title ?? '新应用开发中'} description={page?.rail_end_card_description ?? '围绕新的任务与穿着环境持续开发。'} label={page?.rail_end_card_cta_label ?? '提交应用需求'} href={page?.rail_end_card_cta_href || '/contact'} />}
        </>}
        </div>
        </div>
      </PageSection>
    </PageShell>
  )
}
