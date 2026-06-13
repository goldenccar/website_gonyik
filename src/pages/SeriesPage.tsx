import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getFabricSeriesDetail } from '@/api/client'
import SkuCard from '@/components/SkuCard'
import type { FabricSeries, FabricSku } from '@/types'

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>()
  const [detail, setDetail] = useState<(FabricSeries & { skus: FabricSku[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      setLoading(true)
      getFabricSeriesDetail(slug).then((res) => {
        setDetail(res.data.data)
        setLoading(false)
      }).catch(() => {
        setDetail(null)
        setLoading(false)
      })
    }
  }, [slug])

  if (loading) {
    return (
      <div className="bg-darker flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-accent text-[13px]">加载中...</p>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="bg-darker flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h3 text-white mb-4">系列不存在</h1>
          <Link to="/fabrics" className="text-accent hover:text-white">返回面料数据库</Link>
        </div>
      </div>
    )
  }

  const tag = detail.tagline || detail.name

  return (
    <div className="bg-darker flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
          <Link to="/fabrics" className="flex items-center gap-2 text-accent hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} />
            <span className="text-[13px]">返回面料数据库</span>
          </Link>
          <div className="flex items-start gap-4">
            {detail.cover_image && (
              <img src={detail.cover_image} alt={detail.name} className="h-14 w-auto object-contain" />
            )}
            <div>
              <p className="text-[11px] text-muted tracking-[0.2em] uppercase mb-3">{tag}</p>
              <h1 className="text-[28px] md:text-[36px] font-bold text-white leading-tight">{detail.name}</h1>
              <p className="text-[16px] text-accent mt-3 max-w-[600px]">{detail.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="bg-white/5 border border-borderDark p-12 text-center">
          <p className="text-[14px] text-accent mb-4">技术内容正在完善中</p>
          <p className="text-[12px] text-muted">请联系港翼科技获取详细技术资料</p>
        </div>

        {/* SKU Shelf */}
        {detail.skus && detail.skus.length > 0 && (
          <div className="mt-16">
            <h2 className="text-h4 text-white mb-8">型号规格</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {detail.skus.map((sku) => (
                <SkuCard key={sku.id} sku={sku} variant="white" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
