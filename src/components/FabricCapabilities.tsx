import { useState } from 'react'
import {
  DEFAULT_FABRIC_CAPABILITIES,
  FABRIC_CAPABILITY_THEME_CLASSES,
  type FabricCapabilityDefinition,
} from '@/config/fabricCapabilities'

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

export function getFabricCapabilityIds(features?: unknown, legacySummary?: unknown, capabilities: FabricCapabilityDefinition[] = DEFAULT_FABRIC_CAPABILITIES) {
  const values = [...readValues(features), ...readValues(legacySummary)]
  return capabilities.filter((capability) => values.some((value) => {
    const normalized = value.trim().toLowerCase()
    if (normalized === capability.key || normalized === capability.label.toLowerCase()) return true
    return capability.aliases?.some((alias) => normalized === alias.toLowerCase())
  })).map((capability) => capability.key)
}

export function FabricCapabilityTags({ features, legacySummary, capabilities = DEFAULT_FABRIC_CAPABILITIES, limit = 4, align = 'end' }: { features?: unknown; legacySummary?: unknown; capabilities?: FabricCapabilityDefinition[]; limit?: number; align?: 'start' | 'end' }) {
  const selected = getFabricCapabilityIds(features, legacySummary, capabilities)
    .map((key) => capabilities.find((item) => item.key === key))
    .filter((item): item is FabricCapabilityDefinition => Boolean(item))
    .slice(0, limit)

  if (!selected.length) return null

  return (
    <ul className={`flex flex-wrap items-center gap-1.5 ${align === 'start' ? 'justify-start' : 'justify-end'}`} aria-label={selected.map((item) => item.label).join('、')}>
      {selected.map(({ key, label, theme }) => (
        <li key={key} className={`flex h-7 items-center whitespace-nowrap border px-2.5 text-[12px] leading-none ${FABRIC_CAPABILITY_THEME_CLASSES[theme] || FABRIC_CAPABILITY_THEME_CLASSES.neutral}`}>
          {label}
        </li>
      ))}
    </ul>
  )
}

export function FabricCapabilitySelector({ features, legacySummary, capabilities = DEFAULT_FABRIC_CAPABILITIES, max = 4 }: { features?: unknown; legacySummary?: unknown; capabilities?: FabricCapabilityDefinition[]; max?: number }) {
  const [selected, setSelected] = useState(() => getFabricCapabilityIds(features, legacySummary, capabilities).slice(0, max))
  return (
    <fieldset>
      <legend className="mb-1 block text-[12px] uppercase text-secondary">卡片性能标签</legend>
      <p className="mb-3 text-[12px] text-muted">选择与该型号相符的性能，最多 {max} 项。</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {capabilities.map(({ key, label, theme }) => {
          const checked = selected.includes(key)
          const disabled = !checked && selected.length >= max
          return (
            <label key={key} className={`flex min-h-11 cursor-pointer items-center border px-3 text-[13px] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-35 ${FABRIC_CAPABILITY_THEME_CLASSES[theme] || FABRIC_CAPABILITY_THEME_CLASSES.neutral} ${checked ? 'ring-1 ring-white' : 'opacity-70'}`}>
              <input type="checkbox" name="capabilities" value={key} checked={checked} disabled={disabled} onChange={() => setSelected((current) => checked ? current.filter((item) => item !== key) : [...current, key])} className="sr-only" />
              <span>{label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
