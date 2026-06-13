import { FileText } from 'lucide-react'
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
  variant?: 'default' | 'white'
}

export default function SkuCard({ sku, variant = 'default' }: SkuCardProps) {
  const features = parseJsonField<string[]>(sku.features)
  const specs = parseJsonField<Record<string, string>>(sku.specifications)
  const bgClass = variant === 'white' ? 'bg-white' : 'bg-bg'

  return (
    <div className={`${bgClass} group hover:scale-[1.01] transition-all duration-300 ease-out`}>
      <div className="hidden aspect-[3/4] bg-[var(--gray-6)] relative overflow-hidden">
        {sku.image ? (
          <img
            src={sku.image}
            alt={sku.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <FileText size={32} />
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-[11px] text-secondary uppercase tracking-wider mb-1">
          {sku.sku_code}
        </p>
        <h4 className="text-[16px] font-bold text-primary mb-3">{sku.name}</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {features.map((f, i) => (
            <span
              key={i}
              className="text-[11px] uppercase tracking-wider bg-white px-2 py-1 text-secondary"
            >
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
}
