import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getEquipmentCatalog } from '@/api/client'
import PageHero from '@/components/PageHero'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import ApplicationCard from '@/components/ApplicationCard'
import { InlineMarkup } from '@/components/MarkupParser'
import PublicContentLoader from '@/components/PublicContentLoader'
import { useSiteLocale } from '@/i18n/SiteLocale'
import type { EquipmentProduct, PageConfig } from '@/types'
import '@/styles/applications.css'

export default function EndUseEquipment() {
  const { path, t } = useSiteLocale()
  const { hash } = useLocation()
  const [page, setPage] = useState<PageConfig | null>(null)
  const [products, setProducts] = useState<EquipmentProduct[]>([])
  const [activeApplication, setActiveApplication] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let current = true
    getEquipmentCatalog().then(response => {
      if (!current) return
      setPage(response.data.data?.page || null)
      setProducts(response.data.data?.products || [])
    }).finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [])
  useEffect(() => {
    if (loading || !hash) return
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [loading, hash])
  useEffect(() => {
    if (loading) return
    let frame = 0
    const update = () => {
      frame = 0
      const sections = products.map(product => ({id:product.id,top:document.getElementById('application-'+product.id)?.getBoundingClientRect().top ?? Infinity}))
      const passed = sections.filter(section=>section.top <= 150)
      setActiveApplication(passed.at(-1)?.id ?? products[0]?.id ?? null)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll',schedule,{passive:true})
    window.addEventListener('resize',schedule)
    return () => { window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);cancelAnimationFrame(frame) }
  }, [loading, products])
  if (loading) return <PublicContentLoader label={t('正在加载面料应用')} />
  if (!page) return null
  return <div className="applications-page">
    <PageHero variant="editorial" title={page.page_title} subtitle={page.page_subtitle} image={page.hero_background} />
    <CatalogSelectorBar label={t(page.page_title)} groups={[{label:'',items:products.map(product=>({key:product.id,label:t(product.name),active:(activeApplication ?? products[0]?.id)===product.id,href:path('/equipment')+'#application-'+product.id}))}]} />
    <div className="applications-frame applications-stories">
      {products.map(product => <ApplicationCard key={product.id} product={product} />)}
    </div>
    {page.rail_end_card_visible !== false && page.rail_end_card_title && <section className="applications-contact">
      <div className="applications-frame applications-contact-inner">
        <div><h2 className="type-module-title"><InlineMarkup text={page.rail_end_card_title} /></h2>
          {page.rail_end_card_description && <p><InlineMarkup text={page.rail_end_card_description} /></p>}</div>
        {page.rail_end_card_cta_label && page.rail_end_card_cta_href && <Link to={path(page.rail_end_card_cta_href)} className="applications-button"><InlineMarkup text={page.rail_end_card_cta_label} /><ArrowUpRight size={18} aria-hidden="true" /></Link>}
      </div>
    </section>}
  </div>
}
