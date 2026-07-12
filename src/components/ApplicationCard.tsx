import type { EquipmentProduct } from '@/types'

function parseFeatures(value: string) {
  try { return JSON.parse(value) as string[] } catch { return [] }
}

export default function ApplicationCard({ product, categoryName }: { product: EquipmentProduct; categoryName?: string }) {
  return <article className="min-w-0 snap-start">
    <div className="aspect-video overflow-hidden bg-white">{product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <div className="gonyik-material-placeholder h-full w-full" />}</div>
    <p className="mt-3 text-label uppercase text-secondary">{categoryName}</p>
    <h3 className="mt-1 text-h5 text-primary">{product.name}</h3>
    <p className="mt-2 text-[14px] text-secondary">{product.card_summary || parseFeatures(product.features).slice(0, 3).join(' · ')}</p>
  </article>
}
