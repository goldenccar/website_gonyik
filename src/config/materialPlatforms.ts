export const MATERIAL_PLATFORMS = [
  {
    key: 'rpo',
    name: 'RPO 高性能材料平台',
    badge: 'RPO 高性能材料',
    description: '用于实际采用 RPO 平台膜材料、纤维或其他指定材料的终端产品。',
  },
] as const

export type MaterialPlatformKey = (typeof MATERIAL_PLATFORMS)[number]['key']

const MATERIAL_PLATFORM_KEYS = new Set<string>(MATERIAL_PLATFORMS.map((platform) => platform.key))

export function normalizeMaterialPlatforms(value: unknown): MaterialPlatformKey[] {
  let values: unknown[] = []
  if (Array.isArray(value)) values = value
  else if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      values = Array.isArray(parsed) ? parsed : value.split(',')
    } catch {
      values = value.split(',')
    }
  }

  return [...new Set(values.map(String).map((key) => key.trim()).filter((key): key is MaterialPlatformKey => MATERIAL_PLATFORM_KEYS.has(key)))]
}

export function materialPlatformLabel(key: string, variant: 'name' | 'badge' = 'name') {
  return MATERIAL_PLATFORMS.find((platform) => platform.key === key)?.[variant] || key
}
