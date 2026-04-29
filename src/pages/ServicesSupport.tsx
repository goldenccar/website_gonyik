import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Newspaper, Code2, Droplets, HelpCircle, Plus, Minus, ChevronRight, Sun, Wind, Ban } from 'lucide-react'
import { getPageConfig, getAboutUs, getNews, getNewsDetail, getCareGuides, getFaqs } from '@/api/client'
import type { PageConfig, AboutUs, Philosophy, Milestone, NewsItem, CareGuide, FAQ } from '@/types'

const ICON_MAP: Record<string, any> = { Droplets, Sun, Wind, Ban, Code2 }

const SUB_MODULES = [
  { key: 'about', label: '关于我们', icon: Building2 },
  { key: 'news', label: '新闻中心', icon: Newspaper },
  { key: 'dev', label: '开发者支持', icon: Code2 },
  { key: 'care', label: '洗护指南', icon: Droplets },
  { key: 'faq', label: 'FAQs', icon: HelpCircle },
]

export default function ServicesSupport() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [activeModule, setActiveModule] = useState('about')
  const [aboutData, setAboutData] = useState<{ about: AboutUs; philosophies: Philosophy[]; milestones: Milestone[] } | null>(null)
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [careGuides, setCareGuides] = useState<CareGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    getPageConfig('services').then((res) => setPageConfig(res.data.data))
    getAboutUs().then((res) => setAboutData(res.data.data))
    getNews().then((res) => setNewsList(res.data.data || []))
    getCareGuides().then((res) => setCareGuides(res.data.data || []))
    getFaqs().then((res) => setFaqs(res.data.data || []))
  }, [])

  const openNews = async (news: NewsItem) => {
    const res = await getNewsDetail(news.id)
    setSelectedNews(res.data.data)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-darker flex flex-col justify-center px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-8">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'SERVICES & SUPPORT'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '服务与支持'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '全方位服务体系，助力您的每一个项目'}
          </p>
        </div>
      </section>

      {/* Content Area */}
      <section className="bg-bg px-6 lg:px-12 py-12">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8">
          {/* Side Nav - Mobile: horizontal scroll tabs; Desktop: sidebar */}
          <aside className="lg:w-[240px] flex-shrink-0">
            <div className="lg:sticky lg:top-[80px] bg-white flex lg:flex-col overflow-x-auto lg:overflow-visible">
              {SUB_MODULES.map((mod) => {
                const Icon = mod.icon
                const isActive = activeModule === mod.key
                return (
                  <button
                    key={mod.key}
                    onClick={() => {
                      setActiveModule(mod.key)
                      setSelectedNews(null)
                    }}
                    className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-3.5 text-[13px] lg:text-[14px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'text-primary bg-[#F5F5F5] border-b-[3px] lg:border-b-0 lg:border-l-[3px] border-primary'
                        : 'text-secondary hover:bg-[#F9F9F9] border-b-[3px] lg:border-b-0 border-transparent'
                    }`}
                  >
                    <Icon size={16} className="lg:w-[18px] lg:h-[18px]" />
                    {mod.label}
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {/* About Us */}
              {activeModule === 'about' && aboutData && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Positioning */}
                  <div className="bg-white p-6 sm:p-10 mb-6">
                    <p className="text-label text-secondary uppercase mb-4">POSITIONING</p>
                    <h2 className="text-h4 text-primary mb-6">{aboutData.about?.positioning_title || '公司定位'}</h2>
                    <p className="text-body text-muted leading-relaxed whitespace-pre-line">
                      {aboutData.about?.positioning_content || '港翼科技（GONYIK）是一家专注于高性能科技面料研发与生产的创新型企业。'}
                    </p>
                  </div>

                  {/* Slogan */}
                  <div className="bg-dark p-8 sm:p-12 mb-6 text-center relative overflow-hidden">
                    <span className="absolute top-4 left-4 sm:left-8 text-[80px] sm:text-[120px] font-serif text-white/5 leading-none select-none">"</span>
                    <p className="text-[22px] sm:text-h3 text-white italic relative z-10">
                      {aboutData.about?.slogan_text || '科技之翼，赋能无限可能'}
                    </p>
                  </div>

                  {/* Philosophies */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    {aboutData.philosophies?.map((p) => (
                      <div key={p.id} className="bg-white p-6 sm:p-8">
                        <span className="text-[36px] sm:text-[48px] font-black text-bg leading-none">{p.number}</span>
                        <h4 className="text-h5 text-primary mt-4 mb-2">{p.title}</h4>
                        <p className="text-[14px] text-muted leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Milestones */}
                  <div className="bg-white p-6 sm:p-10">
                    <h3 className="text-h4 text-primary mb-10">发展里程碑</h3>
                    <div className="relative">
                      <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-border" />
                      <div className="space-y-8">
                        {aboutData.milestones?.map((m, idx) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="relative pl-8"
                          >
                            <div className="absolute left-0 top-1.5 w-4 h-4 bg-primary border-[3px] border-white rounded-full" />
                            <div className="bg-bg p-4 sm:p-6">
                              <span className="text-h5 text-primary">{m.year}</span>
                              <p className="text-[14px] text-muted mt-1">{m.event}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* News */}
              {activeModule === 'news' && (
                <motion.div
                  key="news"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedNews ? (
                    <div className="bg-white p-6 sm:p-10">
                      <button
                        onClick={() => setSelectedNews(null)}
                        className="flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors"
                      >
                        <ChevronRight size={16} className="rotate-180" />
                        返回列表
                      </button>
                      {selectedNews.cover_image && (
                        <img src={selectedNews.cover_image} alt={selectedNews.title} className="w-full aspect-video object-cover mb-8" />
                      )}
                      <p className="text-label text-secondary mb-3">
                        {selectedNews.published_at ? new Date(selectedNews.published_at).toLocaleDateString('zh-CN') : ''}
                      </p>
                      <h2 className="text-[22px] sm:text-h3 text-primary mb-6">{selectedNews.title}</h2>
                      <div
                        className="prose prose-sm max-w-none text-muted"
                        dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {newsList.map((news, idx) => (
                        <motion.div
                          key={news.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                          className="bg-white cursor-pointer group hover:-translate-y-1 transition-transform duration-300"
                          onClick={() => openNews(news)}
                        >
                          <div className="aspect-[16/10] bg-bg overflow-hidden">
                            {news.cover_image ? (
                              <img src={news.cover_image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#E0E0E0] to-[#CCCCCC]" />
                            )}
                          </div>
                          <div className="p-5 sm:p-6">
                            <p className="text-label text-secondary mb-2">
                              {news.published_at ? new Date(news.published_at).toLocaleDateString('zh-CN') : ''}
                            </p>
                            <h4 className="text-[16px] sm:text-[18px] font-bold text-primary line-clamp-2 mb-2">{news.title}</h4>
                            <p className="text-[13px] sm:text-[14px] text-muted line-clamp-3" dangerouslySetInnerHTML={{ __html: news.content?.slice(0, 120) + '...' }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Developer Support */}
              {activeModule === 'dev' && (
                <motion.div
                  key="dev"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-10 sm:p-16 text-center"
                >
                  <Code2 size={48} className="mx-auto text-muted mb-6" />
                  <h3 className="text-h3 text-primary mb-4">开发者支持</h3>
                  <p className="text-body text-muted mb-8">开发者文档与 API 即将开放，敬请期待</p>
                  <a href="mailto:dev@gonyik.com" className="text-primary hover:underline">dev@gonyik.com</a>
                </motion.div>
              )}

              {/* Care Guides */}
              {activeModule === 'care' && (
                <motion.div
                  key="care"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {careGuides.map((guide, idx) => {
                    const IconComponent = ICON_MAP[guide.icon] || Droplets
                    return (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="bg-white p-8"
                      >
                        <IconComponent size={40} className="text-primary mb-4" />
                        <h4 className="text-h5 text-primary mb-3">{guide.title}</h4>
                        <p className="text-[14px] text-muted leading-relaxed">{guide.content}</p>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* FAQs */}
              {activeModule === 'faq' && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white"
                >
                  {faqs.map((faq) => {
                    const isOpen = openFaq === faq.id
                    return (
                      <div key={faq.id} className="border-b border-border last:border-0">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                          className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-[#F9F9F9] transition-colors"
                        >
                          <span className="text-[16px] font-bold text-primary pr-4">{faq.question}</span>
                          {isOpen ? <Minus size={18} className="text-secondary flex-shrink-0" /> : <Plus size={18} className="text-secondary flex-shrink-0" />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-8 pb-6">
                                <p className="text-[14px] text-muted leading-relaxed">{faq.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* News Drawer */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={() => setSelectedNews(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
