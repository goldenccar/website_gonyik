import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getPageConfig, getEquipmentCategories, getCategoryProducts } from '@/api/client'
import type { EquipmentCategory, EquipmentProduct, PageConfig } from '@/types'

const TABS = [
  { key: 'all', label: 'All' },
]

export default function EndUseEquipment() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [products, setProducts] = useState<EquipmentProduct[]>([])
  const tabNavRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    getPageConfig('equipment').then((res) => setPageConfig(res.data.data))
    getEquipmentCategories().then((res) => {
      const cats = res.data.data || []
      setCategories(cats)
    })
  }, [])

  useEffect(() => {
    if (activeTab !== 'all') {
      getCategoryProducts(activeTab).then((res) => {
        setProducts(res.data.data?.products || [])
      })
    } else {
      setProducts([])
    }
  }, [activeTab])

  const displayedCategories = activeTab === 'all' ? categories : categories.filter((c) => c.slug === activeTab)

  const allTabs = [
    { key: 'all', label: 'All' },
    ...categories.map((c) => ({ key: c.slug, label: c.name })),
  ]

  const scrollToTabNav = () => {
    if (tabNavRef.current) {
      const y = tabNavRef.current.getBoundingClientRect().top + window.scrollY - 60
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const scrollToCard = (slug: string) => {
    const el = cardRefs.current[slug]
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 124
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-darker flex flex-col justify-center px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-8">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'END USE & EQUIPMENT'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '终端装备'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '四大品类，覆盖全场景功能需求'}
          </p>
        </div>
      </section>

      {/* Tab Nav */}
      <div ref={tabNavRef} className="sticky top-[60px] z-40 bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-8 overflow-x-auto">
            {allTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  if (tab.key !== 'all') {
                    setTimeout(() => scrollToCard(tab.key), 50)
                  }
                }}
                className={`py-4 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-primary border-primary'
                    : 'text-secondary border-transparent hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Cards + Products */}
      <section className="bg-bg px-6 lg:px-12 py-12">
        <div className="max-w-[1440px] mx-auto space-y-4">
          {displayedCategories.map((cat) => (
            <div key={cat.id} ref={(el) => { cardRefs.current[cat.slug] = el }}>
              {/* Category Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative h-[110px] sm:h-[130px] cursor-pointer overflow-hidden transition-all duration-300 group rounded-2xl shadow-sm hover:shadow-md"
                onClick={() => {
                  setActiveTab(cat.slug)
                  scrollToTabNav()
                }}
              >
                {/* Default gradient background */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${cat.bg_image ? 'group-hover:opacity-0' : ''}`}
                  style={{
                    background: 'linear-gradient(to right, #FFFFFF 30%, rgba(255,255,255,0) 70%)',
                  }}
                />

                {/* Background image */}
                {cat.bg_image && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-cover bg-center"
                    style={{ backgroundImage: `url(${cat.bg_image})` }}
                  />
                )}

                {/* Overlay for readability */}
                {cat.bg_image && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(to right, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.5) 60%, rgba(0,0,0,0.3) 100%)',
                    }}
                  />
                )}

                {/* No image fallback */}
                {!cat.bg_image && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#E8E8E8] to-transparent" />
                )}

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 max-w-[60%] sm:max-w-[40%]">
                  <h3 className="text-[18px] sm:text-h4 text-primary mb-2 transition-transform duration-300 origin-left">
                    {cat.name}
                  </h3>
                  <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                {/* Right side hint */}
                <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-10">
                  <span className="text-[11px] uppercase tracking-wider text-secondary md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    查看产品
                  </span>
                </div>
              </motion.div>

              {/* Products */}
              {activeTab === cat.slug && products.length > 0 && (
                <div className="bg-white p-8 mt-0">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-h4 text-primary">{cat.name} 产品系列</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {products.map((product) => {
                      const features: string[] = product.features ? JSON.parse(product.features) : []
                      return (
                        <div key={product.id} className="bg-bg group hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl shadow-sm overflow-hidden">
                          <div className="aspect-square bg-[#E0E0E0] relative overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#E0E0E0] to-[#CCCCCC]" />
                            )}
                          </div>
                          <div className="p-5">
                            <h5 className="text-[16px] font-bold text-primary mb-3">{product.name}</h5>
                            <div className="flex flex-wrap gap-2">
                              {features.map((f, i) => (
                                <span key={i} className="text-[11px] uppercase tracking-wider bg-white px-2 py-1 text-secondary">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
