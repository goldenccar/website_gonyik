import {
  AirVent,
  ArrowLeftRight,
  CloudSun,
  Droplets,
  Flame,
  Gauge,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  Thermometer,
  Timer,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

export interface FabricCapability {
  id: string
  label: string
  icon: LucideIcon
  aliases?: string[]
}

export const FABRIC_CAPABILITIES: FabricCapability[] = [
  { id: 'waterproof', label: '防水性', icon: Droplets, aliases: ['防水', '防水透气'] },
  { id: 'moisture-permeable', label: '透湿性', icon: CloudSun, aliases: ['透湿', '防水透气'] },
  { id: 'windproof', label: '防风性', icon: Wind, aliases: ['防风'] },
  { id: 'weather-resistant', label: '耐候性', icon: ShieldCheck, aliases: ['耐候'] },
  { id: 'air-permeable', label: '透气性', icon: AirVent, aliases: ['透气'] },
  { id: 'uv-protective', label: '防晒性', icon: Sun, aliases: ['防晒', '防紫外线', 'UPF'] },
  { id: 'moisture-wicking', label: '吸湿排汗', icon: Waves, aliases: ['吸湿', '排汗', '导湿'] },
  { id: 'quick-dry', label: '速干性', icon: Timer, aliases: ['速干'] },
  { id: 'thermal', label: '保暖性', icon: Thermometer, aliases: ['保暖', '保温'] },
  { id: 'abrasion-resistant', label: '耐磨性', icon: Gauge, aliases: ['耐磨'] },
  { id: 'stretch', label: '弹力', icon: ArrowLeftRight, aliases: ['高弹', '四面弹'] },
  { id: 'tear-resistant', label: '抗撕裂', icon: ShieldCheck, aliases: ['抗撕裂', '防撕裂'] },
  { id: 'flame-resistant', label: '阻燃性', icon: Flame, aliases: ['阻燃'] },
  { id: 'antistatic', label: '防静电', icon: Zap, aliases: ['抗静电'] },
  { id: 'cooling', label: '凉感', icon: Snowflake, aliases: ['凉感', '冷感'] },
  { id: 'stain-resistant', label: '防污性', icon: Sparkles, aliases: ['防污', '易去污'] },
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

export function FabricCapabilityIcons({ features, legacySummary, limit = 4 }: { features?: unknown; legacySummary?: unknown; limit?: number }) {
  const selected = getFabricCapabilityIds(features, legacySummary)
    .map((id) => FABRIC_CAPABILITIES.find((item) => item.id === id))
    .filter((item): item is FabricCapability => Boolean(item))
    .slice(0, limit)

  if (!selected.length) return <div className="h-8" aria-hidden="true" />

  return (
    <ul className="flex min-h-8 items-center gap-2" aria-label={selected.map((item) => item.label).join('、')}>
      {selected.map(({ id, label, icon: Icon }) => (
        <li key={id} className="flex h-8 w-8 items-center justify-center border border-border text-secondary" title={label} aria-label={label}>
          <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ul>
  )
}

export function FabricCapabilitySelector({ features, legacySummary, max = 4 }: { features?: unknown; legacySummary?: unknown; max?: number }) {
  const [selected, setSelected] = useState(() => getFabricCapabilityIds(features, legacySummary).slice(0, max))
  return (
    <fieldset>
      <legend className="mb-1 block text-[12px] uppercase text-secondary">卡片性能图标</legend>
      <p className="mb-3 text-[12px] text-muted">选择与该型号相符的性能，最多 {max} 项。前台按固定图标和名称展示。</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FABRIC_CAPABILITIES.map(({ id, label, icon: Icon }) => {
          const checked = selected.includes(id)
          const disabled = !checked && selected.length >= max
          return (
            <label key={id} className="flex min-h-11 cursor-pointer items-center gap-2 border border-borderDark bg-white/5 px-3 text-[13px] text-white has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-35">
              <input type="checkbox" name="capabilities" value={id} checked={checked} disabled={disabled} onChange={() => setSelected((current) => checked ? current.filter((item) => item !== id) : [...current, id])} className="sr-only" />
              <Icon size={16} className="text-accent" aria-hidden="true" />
              <span>{label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
