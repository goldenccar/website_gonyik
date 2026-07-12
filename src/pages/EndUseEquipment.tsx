import { useEffect, useState } from 'react'
import { getCategoryProducts, getEquipmentCategories, getPageConfig } from '@/api/client'
import HorizontalRail from '@/components/HorizontalRail'
import ApplicationCard from '@/components/ApplicationCard'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { EquipmentCategory, EquipmentProduct, PageConfig } from '@/types'

export default function EndUseEquipment() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [active, setActive] = useState('')
  const [products, setProducts] = useState<EquipmentProduct[]>([])

  useEffect(() => {
    Promise.all([getPageConfig('equipment'), getEquipmentCategories()]).then(([config, list]) => {
      const items = list.data.data || []
      setPage(config.data.data)
      setCategories(items)
      setActive(items[0]?.slug || '')
    })
  }, [])

  useEffect(() => {
    if (active) getCategoryProducts(active).then((res) => setProducts(res.data.data?.products || []))
  }, [active])

  const category = categories.find((item) => item.slug === active)

  return (
    <PageShell>
      <PageHero variant="detail" tag={page?.page_tag || 'END-USE APPLICATIONS'} title={page?.page_title || '从面料到真实应用'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="港翼面料终端应用" />
      <PageSection className="!py-8 lg:!py-10">
        <div className="mb-7 flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[680px]"><p className="text-label uppercase text-secondary">REPRESENTATIVE APPLICATIONS</p><h2 className="mt-2 text-[28px] font-bold text-primary">{category?.name}</h2><p className="mt-2 text-[14px] text-secondary">{category?.description}</p></div>
          <nav aria-label="终端应用分类" className="flex flex-wrap items-center gap-2">{categories.map((item) => <span key={item.id} className="contents">{item.slug === 'special' && <span aria-hidden="true" className="mx-2 h-5 w-px self-center bg-border" />}<button onClick={() => setActive(item.slug)} className={`px-4 py-2 text-[13px] tracking-[0.03em] ${active === item.slug ? 'bg-dark text-white' : 'border border-border text-primary'}`}>{item.name}</button></span>)}</nav>
        </div>
        <HorizontalRail label={`${category?.name || ''}应用`}>
          {products.map((product) => <ApplicationCard key={product.id} product={product} categoryName={category?.name} />)}
          {page?.rail_end_card_visible !== false && <article className="flex snap-start items-end bg-white p-7"><div><p className="text-label text-secondary">IN DEVELOPMENT</p><h3 className="mt-3 text-h4 text-primary">{page?.rail_end_card_title || '新应用开发中'}</h3><p className="mt-3 text-body text-secondary">{page?.rail_end_card_description || '围绕新的任务与穿着环境持续开发。'}</p>{page?.rail_end_card_cta_label && <a href={page.rail_end_card_cta_href || '/contact'} className="mt-6 inline-block text-[14px] underline underline-offset-4">{page.rail_end_card_cta_label} →</a>}</div></article>}
        </HorizontalRail>
      </PageSection>
    </PageShell>
  )
}
