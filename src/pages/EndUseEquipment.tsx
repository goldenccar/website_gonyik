import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getPageConfig, getEquipmentCategories, getCategoryProducts, getEquipmentScenes } from '@/api/client'
import SceneSelector from '@/components/SceneSelector'
import type { EquipmentCategory, EquipmentProduct, EquipmentScene, PageConfig } from '@/types'

export default function EndUseEquipment() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [products, setProducts] = useState<EquipmentProduct[]>([])
  const [scenes, setScenes] = useState<EquipmentScene[]>([])
  const tabNavRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    getPageConfig('equipment').then((res) => setPageConfig(res.data.data))
    getEquipmentCategories().then((res) => {
      const cats = res.data.data || []
      setCategories(cats)
    })
    getEquipmentScenes().then((res) => {
      setScenes(res.data.data || [])
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

  const handleSceneClick = (slug: string) => {
    setActiveTab(slug)
    setTimeout(() => scrollToCard(slug), 50)
  }

  return (
    <div>
      {/* Hero + Scene Selector */}
      <section className="bg-darker px-6 lg:px-12 pt-[60px] pb-16">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16">
          {/* Left: Hero text */}
          <div className="py-8 shrink-0">
            <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'END USE & EQUIPMENT'}</p>
            <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '终端装备'}</h1>
            <p className="text-body text-accent max-w-[600px]">
              {pageConfig?.page_subtitle || '四大品类，覆盖全场景功能需求'}
            </p>
          </div>
          {/* Right: Scene Selector */}
          {scenes.length > 0 && (
            <SceneSelector
              items={scenes.map((s) => ({
                id: s.id,
                category: s.category,
                label: s.label,
                value: s.equipment_slug,
              }))}
              activeValue={activeTab}
              onSelect={handleSceneClick}
            />
          )}
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
                className="relative h-[110px] sm:h-[130px] cursor-pointer overflow-hidden transition-all duration-300 group"
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

                {/* Background image + overlay merged into one layer for sync transition */}
                {cat.bg_image && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.5) 60%, rgba(0,0,0,0.3) 100%), url(${cat.bg_image})`,
                      backgroundPosition: 'center, center',
                      backgroundSize: `auto, ${cat.image_fit === 'contain' ? 'contain' : cat.image_fit === 'original' ? 'auto' : 'cover'}`,
                      backgroundRepeat: 'no-repeat, no-repeat',
                    }}
                  />
                )}

                {/* No image fallback */}
                {!cat.bg_image && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[var(--gray-4)] to-transparent" />
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
                      const features: string[] = Array.isArray(product.features) ? product.features : (product.features ? JSON.parse(product.features) : [])
                      return (
                        <div key={product.id} className="bg-bg group hover:scale-[1.01] transition-all duration-300 ease-out">
                          <div className="aspect-square bg-[var(--gray-6)] relative overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-[var(--gray-6)]" />
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
