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

  // Prefer scenario-like spec keys
  const scenario =
    specs['适用场景'] || specs['场景'] || specs['应用'] || specs['description'] || ''

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-darker border border-white/10 aspect-[16/10]">
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
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div>
          {seriesName && (
            <div
              className="flex items-center gap-2 mb-4"
              style={{ color: seriesAccent }}
            >
              <span className="text-[11px] uppercase tracking-[2px] font-medium">
                {seriesName} SERIES
              </span>
              {Icon && <Icon size={16} />}
            </div>
          )}

          <h3 className="text-[40px] font-bold text-white leading-none mb-2">
            {sku.sku_code}
          </h3>
          <p className="text-[16px] text-white/90 font-medium mb-4">{sku.name}</p>

          {features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.slice(0, 4).map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/30 text-[11px] text-white/90"
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: seriesAccent }}
                  />
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            {scenario && (
              <p className="text-[13px] text-white/70 mb-2">{scenario}</p>
            )}
            <p className="text-[11px] text-white/50 uppercase tracking-wider">
              {seriesTagline || 'PFAS-FREE | 无氟体系'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-primary transition-all">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </div>
  )
}
