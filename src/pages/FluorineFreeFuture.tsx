import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getPageConfig, getFluorineSections, getFluorineValueChain } from '@/api/client'
import MarkupParser from '@/components/MarkupParser'
import type { PageConfig, FluorineSection } from '@/types'

function LazyImage({
  src,
  alt,
  className,
  fit,
}: {
  src: string
  alt: string
  className?: string
  fit?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const isOriginal = fit === 'original'
  const isContain = fit === 'contain'

  return (
    <div
      className={`bg-darker overflow-hidden ${isOriginal ? '' : 'aspect-[4/5]'}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${
          isOriginal
            ? 'h-auto max-h-[600px] object-contain mx-auto'
            : isContain
            ? 'h-full object-contain'
            : 'h-full object-cover'
        } ${className || ''}`}
      />
    </div>
  )
}

interface ValueChainColumn {
  tag: string
  tag_cn: string
  title: string
  description: string
  items: string[]
}

interface ValueChainData {
  module_tag: string
  title: string
  subtitle: string
  columns: ValueChainColumn[]
}

export default function FluorineFreeFuture() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<FluorineSection[]>([])
  const [valueChain, setValueChain] = useState<ValueChainData | null>(null)

  useEffect(() => {
    getPageConfig('fluorine-free').then((res) => setPageConfig(res.data.data))
    getFluorineSections().then((res) => setSections(res.data.data || []))
    getFluorineValueChain().then((res) => setValueChain(res.data.data))
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
      <section className="bg-darker">
        {sections.map((section, idx) => {
          const isEven = idx % 2 === 0
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border-b border-white/10"
            >
              <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-start`}>
                  {/* Text */}
                  <div className="flex-1 lg:max-w-[55%]">
                    <p className="text-label text-accent uppercase mb-3">{String(idx + 1).padStart(2, '0')}</p>
                    <h2 className="text-h3 text-white mb-3">{section.title}</h2>
                    <p className="text-body text-accent mb-8">{section.subtitle}</p>
                    <div className="text-[15px] text-white leading-relaxed">
                      <MarkupParser text={section.content} />
                    </div>
                  </div>

                  {/* Image */}
                  <div className="lg:w-[40%] shrink-0">
                    {section.image_url ? (
                      <LazyImage
                        src={section.image_url}
                        alt={section.title}
                        fit={section.image_fit}
                      />
                    ) : (
                      <div className="aspect-[4/5] bg-white/10 flex items-center justify-center">
                        <span className="text-[13px] text-accent">图片占位</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </section>

      {/* Value Chain */}
      {valueChain && (
        <section className="bg-bg px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-[1440px] mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h2 className="text-h3 text-primary mb-4">{valueChain.title}</h2>
              <p className="text-body text-muted max-w-[700px]">
                {valueChain.subtitle}
              </p>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {valueChain.columns.map((col, idx) => (
                <motion.div
                  key={col.tag}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="relative"
                >
                  {/* Column Header */}
                  <div className="bg-[var(--gray-4)] px-6 py-4">
                    <p className="text-[11px] text-muted uppercase tracking-widest mb-1">{col.tag}</p>
                    <p className="text-[13px] text-primary">{col.tag_cn}</p>
                  </div>
                  {/* Column Content */}
                  <div className="bg-white p-6 lg:p-8 min-h-[320px]">
                    <h3 className="text-[18px] font-bold text-primary mb-3">{col.title}</h3>
                    <p className="text-[14px] text-muted leading-relaxed mb-6">{col.description}</p>
                    <div className="space-y-2.5">
                      {col.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <span className="w-4 h-[1px] bg-muted shrink-0" />
                          <span className="text-[13px] text-secondary">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Arrow between columns (not on last) */}
                  {idx < valueChain.columns.length - 1 && (
                    <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 items-center justify-center w-8 h-8 bg-white border border-border shadow-sm">
                      <ArrowRight size={14} className="text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
