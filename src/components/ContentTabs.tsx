interface ContentTab {
  id: string
  label: string
}

export default function ContentTabs({ items, active, onChange, label }: {
  items: ContentTab[]
  active: string
  onChange: (id: string) => void
  label: string
}) {
  return (
    <nav aria-label={label} className="gonyik-rail mb-8 flex gap-3 overflow-x-auto pb-4 lg:sticky lg:top-[84px] lg:mb-0 lg:block lg:self-start lg:overflow-visible lg:pb-0">
      {items.map((item, index) => <button key={item.id} onClick={() => onChange(item.id)} className={`shrink-0 border-l-[3px] px-4 py-3 text-left lg:block lg:w-full lg:border-b lg:border-b-border lg:py-4 ${active === item.id ? 'border-l-[#69B2C1] bg-white text-primary' : 'border-l-transparent text-secondary hover:text-primary'}`}><span className="mr-3 text-label">{String(index + 1).padStart(2, '0')}</span><span className="text-[14px] font-medium">{item.label}</span></button>)}
    </nav>
  )
}
