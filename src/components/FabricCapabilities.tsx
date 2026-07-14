import { useState } from 'react'

export interface FabricCapability {
  id: string
  label: string
  aliases?: string[]
}

export const FABRIC_CAPABILITIES: FabricCapability[] = [
  { id: 'waterproof', label: '防水性', aliases: ['防水', '防水透气'] },
  { id: 'moisture-permeable', label: '透湿性', aliases: ['透湿', '防水透气'] },
  { id: 'windproof', label: '防风性', aliases: ['防风'] },
  { id: 'weather-resistant', label: '耐候性', aliases: ['耐候'] },
  { id: 'air-permeable', label: '透气性', aliases: ['透气'] },
  { id: 'uv-protective', label: '防晒性', aliases: ['防晒', '防紫外线', 'UPF'] },
  { id: 'moisture-wicking', label: '吸湿排汗', aliases: ['吸湿', '排汗', '导湿'] },
  { id: 'quick-dry', label: '速干性', aliases: ['速干'] },
  { id: 'thermal', label: '保暖性', aliases: ['保暖', '保温'] },
  { id: 'abrasion-resistant', label: '耐磨性', aliases: ['耐磨'] },
  { id: 'stretch', label: '弹力', aliases: ['高弹', '四面弹'] },
  { id: 'tear-resistant', label: '抗撕裂', aliases: ['抗撕裂', '防撕裂'] },
  { id: 'flame-resistant', label: '阻燃性', aliases: ['阻燃'] },
  { id: 'antistatic', label: '防静电', aliases: ['抗静电'] },
  { id: 'cooling', label: '凉感', aliases: ['凉感', '冷感'] },
  { id: 'stain-resistant', label: '防污性', aliases: ['防污', '易去污'] },
]

function readValues(value?: unknown) {
  if (!value) return []
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    return value.split(/[,、·]/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export function getFabricCapabilityIds(features?: unknown, legacySummary?: unknown) {
  const values = [...readValues(features), ...readValues(legacySummary)]
  return FABRIC_CAPABILITIES.filter((capability) => values.some((value) => {
    const normalized = value.trim().toLowerCase()
    if (normalized === capability.id || normalized === capability.label.toLowerCase()) return true
    return capability.aliases?.some((alias) => normalized === alias.toLowerCase())
  })).map((capability) => capability.id)
}

export function FabricCapabilityTags({ features, legacySummary, limit = 4 }: { features?: unknown; legacySummary?: unknown; limit?: number }) {
  const selected = getFabricCapabilityIds(features, legacySummary)
    .map((id) => FABRIC_CAPABILITIES.find((item) => item.id === id))
    .filter((item): item is FabricCapability => Boolean(item))
    .slice(0, limit)

  if (!selected.length) return <div className="h-8" aria-hidden="true" />

  return (
    <ul className="flex min-h-8 flex-wrap items-center gap-2" aria-label={selected.map((item) => item.label).join('、')}>
      {selected.map(({ id, label }) => (
        <li key={id} className="flex h-7 items-center border border-border px-2.5 text-[12px] leading-none text-secondary">
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}

export function FabricCapabilitySelector({ features, legacySummary, max = 4 }: { features?: unknown; legacySummary?: unknown; max?: number }) {
  const [selected, setSelected] = useState(() => getFabricCapabilityIds(features, legacySummary).slice(0, max))
  return (
    <fieldset>
      <legend className="mb-1 block text-[12px] uppercase text-secondary">卡片性能标签</legend>
      <p className="mb-3 text-[12px] text-muted">选择与该型号相符的性能，最多 {max} 项。前台以文字特性标签展示。</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FABRIC_CAPABILITIES.map(({ id, label }) => {
          const checked = selected.includes(id)
          const disabled = !checked && selected.length >= max
          return (
            <label key={id} className="flex min-h-11 cursor-pointer items-center gap-2 border border-borderDark bg-white/5 px-3 text-[13px] text-white has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-35">
              <input type="checkbox" name="capabilities" value={id} checked={checked} disabled={disabled} onChange={() => setSelected((current) => checked ? current.filter((item) => item !== id) : [...current, id])} className="sr-only" />
              <span>{label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
