import type { EquipmentProduct } from '@/types'

function parseFeatures(value: string) {
  try { return JSON.parse(value) as string[] } catch { return [] }
}

export default function ApplicationCard({ product, categoryName }: { product: EquipmentProduct; categoryName?: string }) {
  return <article className="group min-w-0 snap-start">
    <div className="aspect-[4/3] overflow-hidden bg-white sm:aspect-video">{product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-[transform,filter] duration-[var(--motion-media)] ease-apple group-hover:scale-[1.022] group-hover:brightness-[1.04]" /> : <div className="gonyik-material-placeholder h-full w-full" />}</div>
    <p className="mt-3 text-label uppercase text-secondary">{categoryName}</p>
    <h3 className="mt-1 text-h5 text-primary">{product.name}</h3>
    <p className="mt-2 text-[14px] text-secondary">{product.card_summary || parseFeatures(product.features).slice(0, 3).join(' · ')}</p>
  </article>
}
