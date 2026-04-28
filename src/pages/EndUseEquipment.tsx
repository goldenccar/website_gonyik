import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getPageConfig, getEquipmentCategories, getCategoryProducts } from '@/api/client'
import type { EquipmentCategory, EquipmentProduct, PageConfig } from '@/types'

const TABS = [
  { key: 'all', label: 'All' },
]

export default function EndUseEquipment() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<EquipmentProduct[]>([])

  useEffect(() => {
    getPageConfig('equipment').then((res) => setPageConfig(res.data.data))
    getEquipmentCategories().then((res) => {
      const cats = res.data.data || []
      setCategories(cats)
    })
  }, [])

  useEffect(() => {
    if (expandedCategory) {
      getCategoryProducts(expandedCategory).then((res) => {
        setProducts(res.data.data?.products || [])
      })
    } else {
      setProducts([])
    }
  }, [expandedCategory])

  const displayedCategories = activeTab === 'all' ? categories : categories.filter((c) => c.slug === activeTab)

  const allTabs = [
    { key: 'all', label: 'All' },
    ...categories.map((c) => ({ key: c.slug, label: c.name })),
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-darker min-h-[35vh] flex flex-col justify-center px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-16">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'END USE & EQUIPMENT'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '终端装备'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '四大品类，覆盖全场景功能需求'}
          </p>
        </div>
      </section>

      {/* Tab Nav */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-8 overflow-x-auto">
            {allTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setExpandedCategory(null)
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

      {/* Category Cards */}
      <section className="bg-bg px-6 lg:px-12 py-12">
        <div className="max-w-[1440px] mx-auto space-y-4">
          {displayedCategories.map((cat) => {
            const isExpanded = expandedCategory === cat.slug
            return (
              <div key={cat.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative h-[160px] sm:h-[200px] cursor-pointer overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.slug)}
                >
                  {/* Default gradient background */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(to right, #FFFFFF 30%, rgba(255,255,255,0) 70%)',
                    }}
                  />

                  {/* Background image - visible on mobile when expanded, on desktop when hover */}
                  {cat.bg_image && (
                    <div
                      className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 bg-cover bg-center"
                      style={{ backgroundImage: `url(${cat.bg_image})` }}
                    />
                  )}

                  {/* Overlay for readability */}
                  <div
                    className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(to right, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.5) 60%, rgba(0,0,0,0.3) 100%)',
                    }}
                  />

                  {/* No image fallback */}
                  {!cat.bg_image && (
                    <div className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#E8E8E8] to-transparent" />
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

                  {/* Right side hint - always visible on mobile */}
                  <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-10">
                    <span className="text-[11px] uppercase tracking-wider text-secondary md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {isExpanded ? '收起' : '查看产品'}
                    </span>
                  </div>
                </motion.div>

                {/* Product Shelf */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-h4 text-primary">{cat.name} 产品系列</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedCategory(null)
                            }}
                            className="p-2 hover:bg-bg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                          {products.map((product) => {
                            const features: string[] = product.features ? JSON.parse(product.features) : []
                            return (
                              <div key={product.id} className="bg-bg group hover:-translate-y-1 transition-transform duration-300">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
