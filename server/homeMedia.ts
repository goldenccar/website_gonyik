// These fields are content, not position-dependent presentation defaults.
export function normalizeHomeMedia(incoming: Record<string, any>) {
  const result = { ...incoming }
  const url = (value: unknown) => {
    if (typeof value !== 'string' || /[\\\u0000-\u001f\u007f]/.test(value)) return ''
    const text = value.trim().slice(0, 1500)
    if (/^(\/(?!\/)|#)/.test(text)) return text
    if (!/^https?:\/\//i.test(text)) return ''
    try { return new URL(text).hostname ? text : '' } catch { return '' }
  }
  if (Object.hasOwn(incoming, 'platform_cards')) {
    result.platform_cards = (Array.isArray(incoming.platform_cards) ? incoming.platform_cards : []).slice(0, 3).map((item: any) => ({
      title: String(item?.title ?? '').trim(),
      subtitle: String(item?.subtitle ?? '').trim(),
      link: url(item?.link),
      visual: ['membrane', 'lamination', 'supply', 'image', 'none'].includes(item?.visual) ? item.visual : 'none',
      image_url: url(item?.image_url),
    }))
  }
  if (Object.hasOwn(incoming, 'technical_visuals')) {
    const value = incoming.technical_visuals && typeof incoming.technical_visuals === 'object' ? incoming.technical_visuals : {}
    const fields = ['membrane_image', 'membrane_label', 'lamination_top_image', 'lamination_membrane_image', 'lamination_backing_image', 'lamination_label', 'supply_ribbon_image', 'supply_lab_image', 'supply_factory_image', 'supply_retail_image', 'supply_materials_image', 'supply_material_image', 'supply_label', 'supply_home_center', 'supply_rpo_center']
    result.technical_visuals = Object.fromEntries(fields.map(key => [key, key.endsWith('_image') ? url(value[key]) : String(value[key] ?? '').trim().slice(0, 500)]))
  }
  delete result.verifications
  return result
}
