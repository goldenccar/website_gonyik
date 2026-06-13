import { ArrowRight } from 'lucide-react'
import type { FabricSku } from '@/types'

function parseJsonField<T>(value: any): T {
  if (value == null) return {} as T
  if (Array.isArray(value) || typeof value === 'object') return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return {} as T
  }
}

interface SkuCardProps {
  sku: FabricSku
  seriesName?: string
  seriesIcon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  seriesAccent?: string
  seriesTagline?: string
}

export default function SkuCard({
  sku,
  seriesName,
  seriesIcon: Icon,
  seriesAccent = '#1B2A44',
  seriesTagline,
}: SkuCardProps) {
  const features = parseJsonField<string[]>(sku.features)
  const specs = parseJsonField<Record<string, string>>(sku.specifications)

  const scenario =
    specs['适用场景'] || specs['场景'] || specs['应用'] || specs['description'] || ''

  return (
    <div className="relative group overflow-hidden rounded-xl bg-darker border border-white/10 aspect-[16/10]">
      {/* Background */}
      {sku.image ? (
        <img
          src={sku.image}
          alt={sku.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-darker" />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        <div>
          {seriesName && (
            <div
              className="flex items-center gap-1.5 mb-3"
              style={{ color: seriesAccent }}
            >
              <span className="text-[10px] uppercase tracking-[1.5px] font-semibold">
                {seriesName} SERIES
              </span>
              {Icon && <Icon size={12} />}
            </div>
          )}

          <h3 className="text-[22px] sm:text-[24px] font-bold text-white leading-tight mb-1">
            {sku.sku_code}
          </h3>
          <p className="text-[13px] text-white/80 font-medium mb-3 line-clamp-1">
            {sku.name}
          </p>

          {features.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-white/70">
              {features.slice(0, 4).map((f, i, arr) => (
                <span key={i} className="inline-flex items-center">
                  {f}
                  {i < arr.length - 1 && (
                    <span className="ml-2 text-white/30">·</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <p className="text-[11px] text-white/60 line-clamp-1">
            {scenario || seriesTagline || 'PFAS-FREE · 无氟体系'}
          </p>
          <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-primary transition-all shrink-0 ml-3">
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </div>
  )
}
