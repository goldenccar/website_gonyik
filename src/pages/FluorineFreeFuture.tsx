import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPageConfig, getFluorineSections } from '@/api/client'
import MarkupParser from '@/components/MarkupParser'
import type { PageConfig, FluorineSection } from '@/types'

export default function FluorineFreeFuture() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<FluorineSection[]>([])

  useEffect(() => {
    getPageConfig('fluorine-free').then((res) => setPageConfig(res.data.data))
    getFluorineSections().then((res) => setSections(res.data.data || []))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-darker px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-8">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'RPO MATERIAL PLATFORM'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || 'RPO材料平台 · 探索无氟未来'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '以科技创新推动可持续发展，告别 PFAS，拥抱绿色未来'}
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-bg">
        {sections.map((section, idx) => {
          const isEven = idx % 2 === 0
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border-b border-border"
            >
              <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-start`}>
                  {/* Text */}
                  <div className="flex-1 lg:max-w-[55%]">
                    <p className="text-label text-secondary uppercase mb-3">{String(idx + 1).padStart(2, '0')}</p>
                    <h2 className="text-h3 text-primary mb-3">{section.title}</h2>
                    <p className="text-body text-muted mb-8">{section.subtitle}</p>
                    <div className="text-[15px] text-primary leading-relaxed">
                      <MarkupParser text={section.content} />
                    </div>
                  </div>

                  {/* Image */}
                  <div className="lg:w-[40%] shrink-0">
                    {section.image_url ? (
                      <div className="aspect-[4/5] bg-bg overflow-hidden">
                        <img
                          src={section.image_url}
                          alt={section.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/5] bg-[#E0E0E0] flex items-center justify-center">
                        <span className="text-[13px] text-muted">图片占位</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </section>
    </div>
  )
}
