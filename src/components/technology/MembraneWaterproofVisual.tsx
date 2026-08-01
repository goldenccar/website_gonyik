import { useSiteLocale } from '@/i18n/SiteLocale'

const FEATURES = [
  { title: '尺度差', copy: '液滴尺度远大于连通微孔' },
  { title: '超低表面能', copy: '降低液态水对膜面的润湿倾向' },
  { title: '孔口毛细阻力', copy: '进入压力阻止液态水穿透' },
] as const

export default function MembraneWaterproofVisual() {
  const { t } = useSiteLocale()

  return (
    <div className="membrane-waterproof-visual">
      <div className="membrane-waterproof-features">
        {FEATURES.map((feature) => (
          <article key={feature.title}>
            <h3>{t(feature.title)}</h3>
            <p>{t(feature.copy)}</p>
          </article>
        ))}
      </div>
      <figure className="membrane-waterproof-media">
        <img
          src="/visuals/membrane-waterproof-mechanism-v1.jpg"
          alt={t('液滴停留在 RPO-SOTEX 超微孔膜表面')}
          loading="lazy"
          decoding="async"
        />
      </figure>
    </div>
  )
}
