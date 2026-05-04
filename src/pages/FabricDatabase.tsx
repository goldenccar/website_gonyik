import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight, FileText, X, Shield, Sun, Droplets, Footprints,
  Briefcase, TreePine, Waves, Mountain, Bike, Tent, HardHat, Sailboat, Snowflake
} from 'lucide-react'
import { getPageConfig, getFabricSeries, getFabricSeriesDetail, getTestReports } from '@/api/client'
import FileViewer from '@/components/FileViewer'
import type { FabricSeries, FabricSku, PageConfig, TestReport } from '@/types'

const SERIES_META: Record<string, { accent: string; icon: any; tagline: string }> = {
  ottex: { accent: '#4A6FA5', icon: Droplets, tagline: '全流程无氟 · 仿生防水透气' },
  kais: { accent: '#8B3A3A', icon: Shield, tagline: '专业防护平台 · 防刺/防火/防化' },
  rayo: { accent: '#C48A4D', icon: Sun, tagline: '原生防晒 · 导湿凉感' },
  tread: { accent: '#666666', icon: Footprints, tagline: '鞋材级 · 耐磨抗撕裂' },
}

// Scene categories inspired by Gore-Tex vertical layout
interface Scene {
  label: string
  series: string
  icon: any
}

interface Category {
  id: string
  name: string
  subtitle: string
  icon: any
  color: string
  bgColor: string
  scenes: Scene[]
}

const CATEGORIES: Category[] = [
  {
    id: 'urban',
    name: '都市生活',
    subtitle: '日常 · 通勤 · 差旅',
    icon: Briefcase,
    color: '#6B7B8C',
    bgColor: 'rgba(107,123,140,0.08)',
    scenes: [
      { label: '日常通勤', series: 'rayo', icon: Bike },
      { label: '商务差旅', series: 'ottex', icon: Briefcase },
      { label: '城市轻户外', series: 'rayo', icon: Mountain },
    ],
  },
  {
    id: 'light-outdoor',
    name: '轻户外',
    subtitle: '休闲 · 露营 · 徒步',
    icon: TreePine,
    color: '#5A8A6E',
    bgColor: 'rgba(90,138,110,0.08)',
    scenes: [
      { label: '徒步旅行', series: 'ottex', icon: Mountain },
      { label: '露营休闲', series: 'ottex', icon: Tent },
      { label: '城市骑行', series: 'rayo', icon: Bike },
    ],
  },
  {
    id: 'pro-sport',
    name: '专业运动',
    subtitle: '极限 · 竞速 · 水域',
    icon: Waves,
    color: '#4A7BA7',
    bgColor: 'rgba(74,123,167,0.08)',
    scenes: [
      { label: '滑雪登山', series: 'ottex', icon: Snowflake },
      { label: '水域活动', series: 'ottex', icon: Sailboat },
      { label: '越野跑步', series: 'rayo', icon: Footprints },
    ],
  },
  {
    id: 'special',
    name: '特种防护',
    subtitle: '战术 · 工业 · 安全',
    icon: Shield,
    color: '#8B3A3A',
    bgColor: 'rgba(139,58,58,0.08)',
    scenes: [
      { label: '战术防护', series: 'kais-edge', icon: Shield },
      { label: '阻燃工装', series: 'kais-ignis', icon: HardHat },
      { label: '工业安全', series: 'kais-edge', icon: HardHat },
      { label: '鞋材应用', series: 'tread', icon: Footprints },
    ],
  },
]

export default function FabricDatabase() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [seriesList, setSeriesList] = useState<FabricSeries[]>([])
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [seriesDetail, setSeriesDetail] = useState<(FabricSeries & { skus: FabricSku[] }) | null>(null)
  const [reports, setReports] = useState<TestReport[]>([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerData, setViewerData] = useState<{ url: string; type: string; title: string } | null>(null)
  const [showKaisSub, setShowKaisSub] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  useEffect(() => {
    getPageConfig('fabrics').then((res) => setPageConfig(res.data.data))
    getFabricSeries().then((res) => setSeriesList(res.data.data || []))
    getTestReports().then((res) => setReports(res.data.data || []))
  }, [])

  useEffect(() => {
    if (selectedSeries && selectedSeries !== 'kais') {
      getFabricSeriesDetail(selectedSeries).then((res) => {
        setSeriesDetail(res.data.data)
      })
    } else {
      setSeriesDetail(null)
    }
  }, [selectedSeries])

  const openViewer = (report: TestReport) => {
    setViewerData({ url: report.file_url, type: report.file_type, title: report.title })
    setViewerOpen(true)
  }

  const handleSceneClick = (series: string) => {
    if (series.startsWith('kais')) {
      setShowKaisSub(true)
      setSelectedSeries(null)
    } else {
      setShowKaisSub(false)
      setSelectedSeries(series)
    }
    // Smooth scroll to series section
    const el = document.getElementById('series-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const seriesCardRef = (slug: string) => {
    return selectedSeries === slug || (slug === 'kais' && showKaisSub)
  }

  return (
    <div>
      {/* Hero + Scene Selector — side by side */}
      <section className="bg-darker px-6 lg:px-12 pt-[60px] pb-16">
        <div className="max-w-[1440px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
            {/* Left: Title */}
            <div className="lg:w-[40%] lg:shrink-0 py-8 lg:py-12">
              <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'MATERIAL PLATFORMS'}</p>
              <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '高性能功能面料技术平台'}</h1>
              <p className="text-body text-accent max-w-[520px]">
                {pageConfig?.page_subtitle || '四大核心技术系列，从仿生防水到专业防护，覆盖户外、工装与运动全场景'}
              </p>
            </div>

            {/* Right: Scene Selector */}
            <div className="lg:flex-1 lg:py-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-[1px] bg-white/20" />
                <span className="text-[11px] text-white/40 uppercase tracking-widest">按应用场景选择</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon
                  const isExpanded = expandedCategory === cat.id
                  return (
                    <motion.div
                      key={cat.id}
                      layout
                      className="relative"
                    >
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        className={`w-full text-left p-5 border transition-all duration-300 ${
                          isExpanded
                            ? 'bg-white/10 border-white/30'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 flex items-center justify-center shrink-0"
                            style={{ backgroundColor: cat.bgColor }}
                          >
                            <CatIcon size={18} style={{ color: cat.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[14px] font-medium text-white">{cat.name}</h3>
                              <motion.div
                                animate={{ rotate: isExpanded ? 45 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-white/40 text-base ml-2"
                              >
                                +
                              </motion.div>
                            </div>
                            <p className="text-[11px] text-white/40 mt-0.5">{cat.subtitle}</p>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 pt-2 bg-white/[0.02] border-x border-b border-white/10">
                              <div className="flex flex-wrap gap-1.5">
                                {cat.scenes.map((scene) => {
                                  const SceneIcon = scene.icon
                                  return (
                                    <button
                                      key={scene.label}
                                      onClick={() => handleSceneClick(scene.series)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
                                    >
                                      <SceneIcon size={11} style={{ color: cat.color }} />
                                      {scene.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Series Cards */}
      <section id="series-section" className="bg-bg px-6 lg:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-h4 text-primary mb-8">面料系列</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seriesList.map((series, idx) => {
              const meta = SERIES_META[series.slug] || SERIES_META['ottex']
              const Icon = meta.icon
              const isKais = series.slug === 'kais'
              const isActive = seriesCardRef(series.slug)
              return (
                <motion.div
                  key={series.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`bg-white cursor-pointer transition-all duration-300 hover:scale-[1.01] group relative overflow-hidden flex flex-col ${
                    isActive ? 'ring-1 ring-primary shadow-lg' : ''
                  }`}
                  style={{ borderLeft: `3px solid ${meta.accent}` }}
                  onClick={() => {
                    if (isKais) {
                      setSelectedSeries(null)
                      setSeriesDetail(null)
                      setShowKaisSub(!showKaisSub)
                    } else {
                      setShowKaisSub(false)
                      setSelectedSeries(selectedSeries === series.slug ? null : series.slug)
                    }
                  }}
                >
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={20} style={{ color: meta.accent }} />
                      <h3 className="text-h4 text-primary">{series.name}</h3>
                    </div>
                    <p className="text-[13px] text-muted leading-relaxed flex-1">{series.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <span className="text-label text-secondary">{isKais ? '选择子系列' : (series.tagline || '查看详情')}</span>
                      <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Kais Sub-series */}
          <AnimatePresence>
            {showKaisSub && (() => {
              const kaisSeries = seriesList.find((s) => s.slug === 'kais')
              const subData = kaisSeries?.sub_series_data
              const subSeries: any[] = subData ? (() => { try { return JSON.parse(subData) } catch { return [] } })() : []
              return (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden mt-8"
                >
                  <div className="bg-white p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-h3 text-primary">{kaisSeries?.name || 'Kais'} 专业防护平台</h3>
                        <p className="text-body text-muted mt-1">{kaisSeries?.description || '基于 UHMWPE 纤维基材的多场景防护解决方案'}</p>
                      </div>
                      <button onClick={() => setShowKaisSub(false)} className="p-2 hover:bg-bg transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {subSeries.map((sub: any) => (
                        <Link key={sub.slug} to={sub.link || `/fabrics/${sub.slug}`} className="bg-bg p-6 hover:bg-white hover:ring-1 hover:ring-primary transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <Shield size={20} style={{ color: sub.accent_color || '#8B3A3A' }} />
                            <h4 className="text-[18px] font-bold text-primary">{sub.name}</h4>
                          </div>
                          {sub.subtitle && <p className="text-[13px] text-muted mb-1">{sub.subtitle}</p>}
                          <p className="text-[13px] text-secondary">{sub.description}</p>
                          <div className="flex items-center gap-2 mt-4 text-[12px] text-secondary group-hover:text-primary transition-colors">
                            <span>查看技术详情</span>
                            <ArrowRight size={14} />
                          </div>
                        </Link>
                      ))}
                      {subSeries.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-muted text-[13px]">暂无子系列数据</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>

          {/* Series Detail / SKU Shelf (for non-Kais) */}
          <AnimatePresence>
            {seriesDetail && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden mt-8"
              >
                <div className="bg-white p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-h3 text-primary">{seriesDetail.name} 系列</h3>
                      <p className="text-body text-muted mt-1">{seriesDetail.description}</p>
                    </div>
                    <button onClick={() => setSelectedSeries(null)} className="p-2 hover:bg-bg transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {seriesDetail.skus?.map((sku) => {
                      const features: string[] = sku.features ? JSON.parse(sku.features) : []
                      const specs: Record<string, string> = sku.specifications ? JSON.parse(sku.specifications) : {}
                      return (
                        <div key={sku.id} className="bg-bg group hover:scale-[1.01] transition-all duration-300 ease-out">
                          <div className="aspect-[3/4] bg-[#E0E0E0] relative overflow-hidden">
                            {sku.image ? (
                              <img src={sku.image} alt={sku.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted">
                                <FileText size={32} />
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <p className="text-[11px] text-secondary uppercase tracking-wider mb-1">{sku.sku_code}</p>
                            <h4 className="text-[16px] font-bold text-primary mb-3">{sku.name}</h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {features.map((f, i) => (
                                <span key={i} className="text-[11px] uppercase tracking-wider bg-white px-2 py-1 text-secondary">{f}</span>
                              ))}
                            </div>
                            <div className="space-y-1">
                              {Object.entries(specs).slice(0, 3).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-[12px]">
                                  <span className="text-muted capitalize">{k}</span>
                                  <span className="text-primary font-medium">{v}</span>
                                </div>
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
      </section>

      {/* Test Reports */}
      <section className="bg-white px-6 lg:px-12 py-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-10">
            <h2 className="text-h3 text-primary mb-2">性能测试与认证</h2>
            <p className="text-body text-muted">我们的每一款面料均通过严格的国际标准测试</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="cursor-pointer group"
                onClick={() => openViewer(report)}
              >
                <div className="aspect-[3/4] bg-bg mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-[#E8E8E8] transition-colors">
                  {report.file_type === 'pdf' ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={48} className="text-muted" />
                      <span className="text-[11px] uppercase tracking-wider text-secondary bg-white px-3 py-1">PDF</span>
                    </div>
                  ) : ['png', 'jpg', 'jpeg', 'webp'].includes(report.file_type) ? (
                    <img src={report.file_url} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : report.file_type === 'svg' ? (
                    <img src={report.file_url} alt={report.title} className="w-2/3 h-2/3 object-contain" />
                  ) : (
                    <FileText size={48} className="text-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/60 px-3 py-1.5 transition-opacity">点击预览</span>
                  </div>
                </div>
                <h4 className="text-[16px] font-bold text-primary mb-1 group-hover:underline">{report.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider bg-bg px-2 py-0.5 text-secondary">{report.file_type}</span>
                  {report.category && (
                    <span className="text-[11px] uppercase tracking-wider bg-bg px-2 py-0.5 text-secondary">{report.category}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-darker px-6 lg:px-12 py-20">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-h3 text-white mb-3">找到适合你产品的面料方案？</h2>
          <p className="text-body text-accent mb-8">申请免费面料小样，附带完整技术规格书</p>
          <Link
            to="/sample-request"
            className="inline-block px-8 py-3.5 bg-white text-primary text-[14px] font-medium hover:bg-bg transition-all duration-250 hover:scale-[1.02] active:scale-[0.98]"
          >
            申请面料样品
          </Link>
        </div>
      </section>

      {/* File Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && viewerData && (
          <FileViewer url={viewerData.url} fileType={viewerData.type} title={viewerData.title} onClose={() => setViewerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
