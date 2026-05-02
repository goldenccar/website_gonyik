import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, FileText, X } from 'lucide-react'
import { getPageConfig, getFabricSeries, getFabricSeriesDetail, getTestReports } from '@/api/client'
import FileViewer from '@/components/FileViewer'
import type { FabricSeries, FabricSku, PageConfig, TestReport } from '@/types'

export default function FabricDatabase() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [seriesList, setSeriesList] = useState<FabricSeries[]>([])
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [seriesDetail, setSeriesDetail] = useState<(FabricSeries & { skus: FabricSku[] }) | null>(null)
  const [reports, setReports] = useState<TestReport[]>([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerData, setViewerData] = useState<{ url: string; type: string; title: string } | null>(null)

  useEffect(() => {
    getPageConfig('fabrics').then((res) => setPageConfig(res.data.data))
    getFabricSeries().then((res) => setSeriesList(res.data.data || []))
    getTestReports().then((res) => setReports(res.data.data || []))
  }, [])

  useEffect(() => {
    if (selectedSeries) {
      getFabricSeriesDetail(selectedSeries).then((res) => {
        setSeriesDetail(res.data.data)
      })
    } else {
      setSeriesDetail(null)
    }
  }, [selectedSeries])

  const openViewer = (report: TestReport) => {
    setViewerData({
      url: report.file_url,
      type: report.file_type,
      title: report.title,
    })
    setViewerOpen(true)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-darker flex flex-col justify-center px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-8">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'FABRIC DATABASE'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '面料数据库'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '四大核心系列，覆盖户外、运动、工装全场景'}
          </p>
        </div>
      </section>

      {/* Series Grid */}
      <section className="bg-bg px-6 lg:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-h4 text-primary mb-8">面料系列</h2>
          <div className={`gap-6 pb-4 ${seriesList.length > 4 ? 'flex overflow-x-auto snap-x snap-mandatory scroll-smooth' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {seriesList.map((series, idx) => (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-white p-8 cursor-pointer transition-all duration-300 hover:scale-[1.01] group relative overflow-hidden flex flex-col ${
                  selectedSeries === series.slug ? 'ring-2 ring-primary' : ''
                } ${seriesList.length > 4 ? 'w-[280px] sm:w-[300px] lg:w-[320px] flex-shrink-0 snap-start' : ''}`}
                onClick={() => setSelectedSeries(selectedSeries === series.slug ? null : series.slug)}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                <h3 className="text-h4 text-primary mb-2">{series.name} 系列</h3>
                <p className="text-[14px] text-muted leading-relaxed line-clamp-2 flex-1">{series.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="text-label text-secondary">查看详情</span>
                  <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Series Detail / SKU Shelf */}
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
                      <h3 className="text-h3 text-primary">{seriesDetail.name}</h3>
                      <p className="text-body text-muted mt-1">{seriesDetail.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSeries(null)}
                      className="p-2 hover:bg-bg transition-colors"
                    >
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
                                <span key={i} className="text-[11px] uppercase tracking-wider bg-white px-2 py-1 text-secondary">
                                  {f}
                                </span>
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
          <h2 className="text-h3 text-primary mb-2">性能测试与认证</h2>
          <p className="text-body text-muted mb-10">我们的每一款面料均通过严格的国际标准测试</p>

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

      {/* File Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && viewerData && (
          <FileViewer
            url={viewerData.url}
            fileType={viewerData.type}
            title={viewerData.title}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
