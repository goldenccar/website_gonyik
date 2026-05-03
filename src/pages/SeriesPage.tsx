import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getFabricSeriesDetail } from '@/api/client'
import type { FabricSeries, FabricSku } from '@/types'

const SERIES_INFO: Record<string, { title: string; subtitle: string; tag: string }> = {
  ottex: {
    tag: 'OTTEX SERIES',
    title: 'Ottex 全流程无氟防水透气',
    subtitle: '3μm UHMWPE 薄膜 + 定制 PUR 复合工艺，仿生防水透气科技',
  },
  'kais-edge': {
    tag: 'KAIS-EDGE',
    title: 'Kais-Edge 铠 · 锋',
    subtitle: '防切割抗穿刺，通过公安部 D3/D2 认证',
  },
  'kais-ignis': {
    tag: 'KAIS-IGNIS',
    title: 'Kais-Ignis 铠 · 焰',
    subtitle: '阻燃隔热，芳纶 + UHMWPE/TPU 复合膜结构',
  },
  rayo: {
    tag: 'RAYO SERIES',
    title: 'Rayo 原生防晒导湿',
    subtitle: 'Coolmax + TiO2 原纱处理，UPF 150+ 洗不掉',
  },
  tread: {
    tag: 'TREAD SERIES',
    title: 'Tread 鞋材级耐磨防护',
    subtitle: '户外鞋与安全鞋专用，耐磨抗撕裂',
  },
}

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>()
  const [detail, setDetail] = useState<(FabricSeries & { skus: FabricSku[] }) | null>(null)
  const info = slug ? SERIES_INFO[slug] : null

  useEffect(() => {
    if (slug && !slug.startsWith('kais')) {
      getFabricSeriesDetail(slug).then((res) => setDetail(res.data.data))
    }
  }, [slug])

  if (!info) {
    return (
      <div className="bg-darker flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h3 text-white mb-4">系列不存在</h1>
          <Link to="/fabrics" className="text-accent hover:text-white">返回面料数据库</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-darker flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
          <Link to="/fabrics" className="flex items-center gap-2 text-accent hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} />
            <span className="text-[13px]">返回面料数据库</span>
          </Link>
          <p className="text-[11px] text-muted tracking-[0.2em] uppercase mb-3">{info.tag}</p>
          <h1 className="text-[28px] md:text-[36px] font-bold text-white leading-tight">{info.title}</h1>
          <p className="text-[16px] text-accent mt-3 max-w-[600px]">{info.subtitle}</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="bg-white/5 border border-borderDark p-12 text-center">
          <p className="text-[14px] text-accent mb-4">技术内容正在完善中</p>
          <p className="text-[12px] text-muted">请联系港翼科技获取详细技术资料</p>
        </div>

        {/* SKU Shelf */}
        {detail && detail.skus && detail.skus.length > 0 && (
          <div className="mt-16">
            <h2 className="text-h4 text-white mb-8">型号规格</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {detail.skus.map((sku) => {
                const features: string[] = sku.features ? JSON.parse(sku.features) : []
                const specs: Record<string, string> = sku.specifications ? JSON.parse(sku.specifications) : {}
                return (
                  <div key={sku.id} className="bg-white group hover:scale-[1.01] transition-all">
                    <div className="aspect-[3/4] bg-[#E0E0E0] relative overflow-hidden">
                      {sku.image ? (
                        <img src={sku.image} alt={sku.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted bg-bg">
                          <span className="text-[12px]">{sku.sku_code}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] text-secondary uppercase tracking-wider mb-1">{sku.sku_code}</p>
                      <h4 className="text-[16px] font-bold text-primary mb-3">{sku.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {features.map((f, i) => (
                          <span key={i} className="text-[11px] uppercase tracking-wider bg-bg px-2 py-1 text-secondary">{f}</span>
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
        )}
      </div>
    </div>
  )
}
