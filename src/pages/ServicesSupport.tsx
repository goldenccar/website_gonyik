import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Building2, Newspaper, Code2, Droplets, HelpCircle, Plus, Minus, ChevronRight,
  Sun, Wind, Ban, Download, ArrowRight, FileArchive, FileImage, Box, Package, Palette, Send
} from 'lucide-react'
import {
  getPageConfig, getAboutUs, getNews, getNewsDetail, getCareGuides, getFaqs,
  getDigitalAssets, getFabricSeries
} from '@/api/client'
import SampleForm from '@/components/SampleForm'
import type { PageConfig, AboutUs, Philosophy, Milestone, NewsItem, CareGuide, FAQ, DigitalAsset, FabricSeries } from '@/types'

const ICON_MAP: Record<string, any> = { Droplets, Sun, Wind, Ban, Code2 }

const DEV_SERIES_INFO: Record<string, { name: string; fullName: string; color: string }> = {
  ottex: { name: 'Ottex', fullName: 'Ottex 全流程无氟防水透气', color: '#4A6FA5' },
  kais: { name: 'Kais', fullName: 'Kais 专业防护平台', color: '#8B3A3A' },
  rayo: { name: 'Rayo', fullName: 'Rayo 原生防晒导湿', color: '#C48A4D' },
  tread: { name: 'Tread', fullName: 'Tread 鞋材级耐磨防护', color: '#666666' },
}

const FORMAT_ICONS: Record<string, any> = {
  zip: FileArchive,
  zfab: Box,
  u3ma: Palette,
  sbsar: Package,
  png: FileImage,
}

const SUB_MODULES = [
  { key: 'about', label: '关于我们', icon: Building2 },
  { key: 'news', label: '新闻中心', icon: Newspaper },
  { key: 'dev', label: '开发者支持', icon: Code2 },
  // { key: 'sample', label: '样品申请', icon: Send }, // 暂时关闭
  { key: 'care', label: '洗护指南', icon: Droplets },
  { key: 'faq', label: 'FAQs', icon: HelpCircle },
]

export default function ServicesSupport() {
  const [searchParams] = useSearchParams()
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [activeModule, setActiveModule] = useState(
    searchParams.get('tab') === 'sample' ? 'about' : (searchParams.get('tab') || 'about')
  )
  const [aboutData, setAboutData] = useState<{ about: AboutUs; philosophies: Philosophy[]; milestones: Milestone[] } | null>(null)
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [careGuides, setCareGuides] = useState<CareGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Developer Support states
  const [selectedDevSeries, setSelectedDevSeries] = useState<string>('ottex')
  const [devAssets, setDevAssets] = useState<DigitalAsset[]>([])
  const [devSeriesList, setDevSeriesList] = useState<FabricSeries[]>([])

  useEffect(() => {
    getPageConfig('services').then((res) => setPageConfig(res.data.data))
    getAboutUs().then((res) => setAboutData(res.data.data))
    getNews().then((res) => setNewsList(res.data.data || []))
    getCareGuides().then((res) => setCareGuides(res.data.data || []))
    getFaqs().then((res) => setFaqs(res.data.data || []))
    getFabricSeries().then((res) => setDevSeriesList(res.data.data || []))
  }, [])

  useEffect(() => {
    if (activeModule === 'dev') {
      getDigitalAssets(selectedDevSeries).then((res) => setDevAssets(res.data.data || []))
    }
  }, [activeModule, selectedDevSeries])

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
                          className="bg-white cursor-pointer group hover:scale-[1.01] transition-all duration-300 ease-out"
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
                >
                  {/* 3D Digital Assets */}
                  <div className="bg-white p-6 sm:p-10 mb-6">
                    <h3 className="text-h4 text-primary mb-3">3D 面料数字资产包</h3>
                    <p className="text-body text-muted max-w-[700px] mb-8">
                      面向数字时尚设计师，提供 GONYIK 各系列面料的 3D 材质包。支持 CLO3D、Marvelous Designer 等主流软件直接导入，附带完整面料物理参数预设。
                    </p>

                    <div className="border-t border-border mb-8">
                      {[
                        { label: '支持软件', value: 'CLO3D · Marvelous Designer · Style3D' },
                        { label: '面料系列', value: 'Ottex · Kais · Rayo · Tread 全系列' },
                        { label: '物理参数', value: '悬垂度 · 刚度 · 厚度 · 摩擦系数' },
                        { label: '贴图分辨率', value: '4K PBR 材质（漫反射、法线、粗糙度）' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-3.5 border-b border-border">
                          <span className="text-[14px] text-muted">{row.label}</span>
                          <span className="text-[14px] text-primary">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[14px] text-secondary uppercase tracking-wider mb-4">选择系列下载</p>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {Object.entries(DEV_SERIES_INFO).map(([slug, s]) => (
                        <button
                          key={slug}
                          onClick={() => setSelectedDevSeries(slug)}
                          className={`px-5 py-2.5 text-[14px] font-medium border transition-all ${
                            selectedDevSeries === slug
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-primary border-border hover:border-primary'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>

                    <motion.div
                      key={selectedDevSeries}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-bg border border-border p-6 mb-6"
                    >
                      <h4 className="text-[18px] font-bold text-primary mb-1">{DEV_SERIES_INFO[selectedDevSeries].fullName}</h4>
                      <p className="text-[14px] text-muted mb-5">{DEV_SERIES_INFO[selectedDevSeries].name} 系列面料 3D 资产包</p>

                      {devAssets.length > 0 ? (
                        <div className="space-y-3">
                          {devAssets.map((asset) => (
                            <a
                              key={asset.id}
                              href={asset.file_url}
                              download
                              className="flex items-center gap-4 p-4 bg-white border border-border hover:border-primary transition-all group"
                            >
                              <Download size={18} className="text-muted group-hover:text-primary transition-colors" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] text-primary truncate">{asset.file_name}</p>
                                <p className="text-[12px] text-muted">{asset.file_type}</p>
                              </div>
                              <span className="text-[12px] text-secondary group-hover:text-primary transition-colors shrink-0">下载</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white border border-border text-muted">
                          <Download size={18} />
                          <span className="text-[14px]">资产包即将上线，敬请期待</span>
                        </div>
                      )}
                    </motion.div>

                    <div className="flex flex-wrap gap-2">
                      {['.zfab', '.u3ma', '.sbsar', '.zip', '.png (4K)'].map((fmt) => (
                        <span key={fmt} className="px-3 py-1.5 text-[12px] text-secondary bg-bg border border-border">{fmt}</span>
                      ))}
                    </div>
                  </div>

                  {/* Physical Sample Request */}
                  <div className="bg-darker p-6 sm:p-10">
                    <h3 className="text-h4 text-white mb-3">面料实物样品申请</h3>
                    <p className="text-body text-accent max-w-[700px] mb-8">
                      面向传统版型师和采购团队。实物接触是数字模拟无法替代的——通过我们的样品申请计划，直接获取 GONYIK 各系列面料实物，感受真实的面料触感与性能。
                    </p>

                    <div className="border-t border-white/10 mb-8">
                      {[
                        { label: '覆盖系列', value: 'Ottex · Kais · Rayo · Tread' },
                        { label: '附送文件', value: 'SGS 认证检测报告（如需）' },
                        { label: '适用对象', value: '版型师 · 采购 · 品牌研发' },
                        { label: '响应周期', value: '3 个工作日内联系确认' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-3.5 border-b border-white/10">
                          <span className="text-[14px] text-white/50">{row.label}</span>
                          <span className="text-[14px] text-white/80">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-3 px-8 py-4 border border-white/30 text-white text-[14px] font-medium hover:bg-white hover:text-primary transition-all"
                    >
                      <span>前往申请页面</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Sample Request */}
              {activeModule === 'sample' && (
                <motion.div
                  key="sample"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white p-6 sm:p-10 mb-6">
                    <h3 className="text-h4 text-primary mb-3">申请面料样品</h3>
                    <p className="text-body text-muted max-w-[700px] mb-8">
                      填写以下信息，我们会尽快与您联系。支持全系列面料样品申请，附带完整技术规格书。
                    </p>
                    <SampleForm />
                  </div>
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
