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
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        <div>
          {seriesName && (
            <div
              className="flex items-center gap-1.5 mb-2"
              style={{ color: seriesAccent }}
            >
              <span className="text-[9px] uppercase tracking-[1.5px] font-medium">
                {seriesName} SERIES
              </span>
              {Icon && <Icon size={12} />}
            </div>
          )}

          <h3 className="text-[24px] sm:text-[28px] font-bold text-white leading-none mb-1">
            {sku.sku_code}
          </h3>
          <p className="text-[13px] text-white/90 font-medium mb-2 line-clamp-1">{sku.name}</p>

          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {features.slice(0, 4).map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/30 text-[10px] text-white/90"
                >
                  <span
                    className="w-0.5 h-0.5 rounded-full"
                    style={{ backgroundColor: seriesAccent }}
                  />
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="min-w-0">
            {scenario && (
              <p className="text-[11px] text-white/70 mb-1 line-clamp-1">{scenario}</p>
            )}
            <p className="text-[9px] text-white/50 uppercase tracking-wider">
              {seriesTagline || 'PFAS-FREE | 无氟体系'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-primary transition-all shrink-0 ml-2">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}
