interface SceneItem {
  id: number
  category: string
  label: string
  value: string
}

interface SceneSelectorProps {
  items: SceneItem[]
  activeValue?: string | null
  onSelect: (value: string) => void
  title?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  '都市生活': '#6B7B8C',
  '轻户外': '#5A8A6E',
  '专业运动': '#4A7BA7',
  '特种防护': '#8B3A3A',
}

export default function SceneSelector({
  items,
  activeValue,
  onSelect,
  title = '按应用场景选择',
}: SceneSelectorProps) {
  const grouped = items.reduce<Record<string, SceneItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="py-8 lg:min-w-[420px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-6 h-[1px] bg-white/20" />
        <span className="text-[11px] text-white/40 uppercase tracking-widest">
          {title}
        </span>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, scenes]) => {
          const color = CATEGORY_COLORS[category] || '#6B7B8C'
          return (
            <div key={category} className="flex items-start gap-4">
              <div className="flex items-center gap-2 shrink-0 mt-1.5 min-w-[80px]">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[13px] text-white/60 whitespace-nowrap">
                  {category}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {scenes.map((scene) => {
                  const isActive = activeValue === scene.value
                  return (
                    <button
                      key={scene.id}
                      onClick={() => onSelect(scene.value)}
                      className={`px-3.5 py-1.5 text-[13px] border transition-all ${
                        isActive
                          ? 'text-white border-white/25 bg-white/10'
                          : 'text-white/70 border-white/[0.08] hover:text-white hover:border-white/25 hover:bg-white/5'
                      }`}
                    >
                      {scene.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
