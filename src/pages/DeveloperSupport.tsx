import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, ArrowRight, FileArchive, FileImage, Box, Package, Palette } from 'lucide-react'
import { getPageConfig, getDigitalAssets, getFabricSeries } from '@/api/client'
import type { DigitalAsset, FabricSeries, PageConfig } from '@/types'

const SERIES_INFO: Record<string, { name: string; fullName: string; color: string }> = {
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

export default function DeveloperSupport() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<string>('ottex')
  const [assets, setAssets] = useState<DigitalAsset[]>([])
  const [seriesList, setSeriesList] = useState<FabricSeries[]>([])

  useEffect(() => {
    getPageConfig('developer-support').then((res) => setPageConfig(res.data.data))
    getFabricSeries().then((res) => setSeriesList(res.data.data || []))
  }, [])

  useEffect(() => {
    getDigitalAssets(selectedSeries).then((res) => setAssets(res.data.data || []))
  }, [selectedSeries])

  const info = SERIES_INFO[selectedSeries]

  return (
    <div>
      {/* Hero */}
      <section className="bg-darker flex flex-col justify-center px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-12">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'DEVELOPER SUPPORT'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '开发者支持'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '为数字时尚设计师与采购团队提供 3D 面料资产与实物样品支持'}
          </p>
        </div>
      </section>

      {/* 3D Digital Assets */}
      <section className="bg-white px-6 lg:px-12 py-20">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-h3 text-primary mb-4">3D 面料数字资产包</h2>
          <p className="text-body text-muted max-w-[700px] mb-12">
            面向数字时尚设计师，提供 GONYIK 各系列面料的 3D 材质包。支持 CLO3D、Marvelous Designer 等主流软件直接导入，附带完整面料物理参数预设。
          </p>

          {/* Info Table */}
          <div className="border-t border-border mb-12">
            {[
              { label: '支持软件', value: 'CLO3D · Marvelous Designer · Style3D' },
              { label: '面料系列', value: 'Ottex · Kais · Rayo · Tread 全系列' },
              { label: '物理参数', value: '悬垂度 · 刚度 · 厚度 · 摩擦系数' },
              { label: '贴图分辨率', value: '4K PBR 材质（漫反射、法线、粗糙度）' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border">
                <span className="text-[14px] text-muted">{row.label}</span>
                <span className="text-[14px] text-primary">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Series Selector */}
          <h3 className="text-[14px] text-secondary uppercase tracking-wider mb-4">选择系列下载</h3>
          <div className="flex flex-wrap gap-3 mb-8">
            {Object.entries(SERIES_INFO).map(([slug, s]) => (
              <button
                key={slug}
                onClick={() => setSelectedSeries(slug)}
                className={`px-6 py-3 text-[14px] font-medium border transition-all ${
                  selectedSeries === slug
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-border hover:border-primary'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Download Card */}
          <motion.div
            key={selectedSeries}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-bg border border-border p-8 mb-8"
          >
            <h4 className="text-[20px] font-bold text-primary mb-2">{info.fullName}</h4>
            <p className="text-[14px] text-muted mb-6">{info.name} 系列面料 3D 资产包</p>

            {assets.length > 0 ? (
              <div className="space-y-3">
                {assets.map((asset) => (
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

          {/* Format Tags */}
          <div className="flex flex-wrap gap-2">
            {['.zfab', '.u3ma', '.sbsar', '.zip', '.png (4K)'].map((fmt) => (
              <span key={fmt} className="px-3 py-1.5 text-[12px] text-secondary bg-bg border border-border">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Physical Sample Request */}
      <section className="bg-darker px-6 lg:px-12 py-20">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-h3 text-white mb-4">面料实物样品申请</h2>
          <p className="text-body text-accent max-w-[700px] mb-12">
            面向传统版型师和采购团队。实物接触是数字模拟无法替代的——通过我们的样品申请计划，直接获取 GONYIK 各系列面料实物，感受真实的面料触感与性能。
          </p>

          {/* Info Table */}
          <div className="border-t border-white/10 mb-12">
            {[
              { label: '覆盖系列', value: 'Ottex · Kais · Rayo · Tread' },
              { label: '附送文件', value: 'SGS 认证检测报告（如需）' },
              { label: '适用对象', value: '版型师 · 采购 · 品牌研发' },
              { label: '响应周期', value: '3 个工作日内联系确认' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-white/10">
                <span className="text-[14px] text-white/50">{row.label}</span>
                <span className="text-[14px] text-white/80">{row.value}</span>
              </div>
            ))}
          </div>

          <Link
            to="/sample-request"
            className="inline-flex items-center gap-3 px-8 py-4 border border-white/30 text-white text-[14px] font-medium hover:bg-white hover:text-primary transition-all"
          >
            <span>前往申请页面</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
