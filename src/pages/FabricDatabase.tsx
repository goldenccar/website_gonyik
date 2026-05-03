import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, X, Shield, Sun, Droplets, Footprints } from 'lucide-react'
import { getPageConfig, getFabricSeries, getFabricSeriesDetail, getTestReports } from '@/api/client'
import FileViewer from '@/components/FileViewer'
import type { FabricSeries, FabricSku, PageConfig, TestReport } from '@/types'

const SERIES_META: Record<string, { accent: string; icon: any; tagline: string }> = {
  ottex: { accent: '#4A6FA5', icon: Droplets, tagline: '全流程无氟 · 仿生防水透气' },
  kais: { accent: '#8B3A3A', icon: Shield, tagline: '专业防护平台 · 防刺/防火/防化' },
  rayo: { accent: '#C48A4D', icon: Sun, tagline: '原生防晒 · 导湿凉感' },
  tread: { accent: '#666666', icon: Footprints, tagline: '鞋材级 · 耐磨抗撕裂' },
}

const SCENES = [
  { label: '户外硬壳', series: 'ottex' },
  { label: '战术防护', series: 'kais-edge' },
  { label: '阻燃工装', series: 'kais-ignis' },
  { label: '运动防晒', series: 'rayo' },
  { label: '鞋材应用', series: 'tread' },
  { label: '城市通勤', series: 'rayo' },
]

export default function FabricDatabase() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [seriesList, setSeriesList] = useState<FabricSeries[]>([])
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [seriesDetail, setSeriesDetail] = useState<(FabricSeries & { skus: FabricSku[] }) | null>(null)
  const [reports, setReports] = useState<TestReport[]>([])
  const [reportFilter, setReportFilter] = useState<string>('all')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerData, setViewerData] = useState<{ url: string; type: string; title: string } | null>(null)
  const [showKaisSub, setShowKaisSub] = useState(false)

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



  return (
    <div>
      {/* Hero */}
      <section className="bg-darker flex flex-col justify-center px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-8">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'MATERIAL PLATFORMS'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '高性能功能面料技术平台'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '四大核心技术系列，从仿生防水到专业防护，覆盖户外、工装与运动全场景'}
          </p>
        </div>
      </section>

      {/* Series Cards */}
      <section className="bg-bg px-6 lg:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-h4 text-primary mb-8">面料系列</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seriesList.map((series, idx) => {
              const meta = SERIES_META[series.slug] || SERIES_META['ottex']
              const Icon = meta.icon
              const isKais = series.slug === 'kais'
              return (
                <motion.div
                  key={series.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white cursor-pointer transition-all duration-300 hover:scale-[1.01] group relative overflow-hidden flex flex-col"
                  style={{ borderLeft: `3px solid ${meta.accent}` }}
                  onClick={() => {
                    if (isKais) {
                      setShowKaisSub(!showKaisSub)
                    } else {
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
                      <span className="text-label text-secondary">{isKais ? '选择子系列' : '查看详情'}</span>
                      <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Kais Sub-series */}
          <AnimatePresence>
            {showKaisSub && (
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
                      <h3 className="text-h3 text-primary">Kais 专业防护平台</h3>
                      <p className="text-body text-muted mt-1">基于 UHMWPE 纤维基材的多场景防护解决方案</p>
                    </div>
                    <button onClick={() => setShowKaisSub(false)} className="p-2 hover:bg-bg transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Link to="/fabrics/kais-edge" className="bg-bg p-6 hover:bg-white hover:ring-1 hover:ring-primary transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield size={20} className="text-[#8B3A3A]" />
                        <h4 className="text-[18px] font-bold text-primary">Kais-Edge</h4>
                      </div>
                      <p className="text-[13px] text-muted mb-1">铠 · 锋</p>
                      <p className="text-[13px] text-secondary">防切割抗穿刺，通过公安部 D3/D2 认证</p>
                      <div className="flex items-center gap-2 mt-4 text-[12px] text-secondary group-hover:text-primary transition-colors">
                        <span>查看技术详情</span>
                        <ArrowRight size={14} />
                      </div>
                    </Link>
                    <Link to="/fabrics/kais-ignis" className="bg-bg p-6 hover:bg-white hover:ring-1 hover:ring-primary transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield size={20} className="text-[#C45D3A]" />
                        <h4 className="text-[18px] font-bold text-primary">Kais-Ignis</h4>
                      </div>
                      <p className="text-[13px] text-muted mb-1">铠 · 焰</p>
                      <p className="text-[13px] text-secondary">阻燃隔热，芳纶 + UHMWPE/TPU 复合膜结构</p>
                      <div className="flex items-center gap-2 mt-4 text-[12px] text-secondary group-hover:text-primary transition-colors">
                        <span>查看技术详情</span>
                        <ArrowRight size={14} />
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
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

      {/* Scene Selector */}
      <section className="bg-darker px-6 lg:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-h4 text-white mb-8">按应用场景选择</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCENES.map((scene) => (
              <button
                key={scene.label}
                className="text-left p-5 bg-white/5 border border-white/10 text-accent hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                onClick={() => {
                  if (scene.series.startsWith('kais')) {
                    setShowKaisSub(true)
                    setSelectedSeries(null)
                    window.scrollTo({ top: 300, behavior: 'smooth' })
                  } else {
                    setShowKaisSub(false)
                    setSelectedSeries(scene.series)
                    window.scrollTo({ top: 300, behavior: 'smooth' })
                  }
                }}
              >
                <span className="text-[14px] font-medium text-white block mb-1">{scene.label}</span>
                <span className="text-[12px] text-muted">推荐系列：{scene.series === 'kais-edge' ? 'Kais-Edge' : scene.series === 'kais-ignis' ? 'Kais-Ignis' : SERIES_META[scene.series]?.tagline || scene.series}</span>
              </button>
            ))}
          </div>
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
            {reports.map((report, idx) =>(
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
