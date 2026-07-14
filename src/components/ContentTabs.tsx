import { useEffect, useRef } from 'react'

interface ContentTab {
  id: string
  label: string
}

export default function ContentTabs({ items, active, onChange, label, variant = 'panel' }: {
  items: ContentTab[]
  active: string
  onChange: (id: string) => void
  label: string
  variant?: 'panel' | 'scrollspy'
}) {
  const navRef = useRef<HTMLElement>(null)
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    if (variant !== 'scrollspy' || window.innerWidth >= 1024) return
    const nav = navRef.current
    const button = buttonRefs.current.get(active)
    if (!nav || !button) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    nav.scrollTo({
      left: button.offsetLeft - (nav.clientWidth - button.clientWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [active, variant])

  const navClass = variant === 'scrollspy'
    ? 'gonyik-rail sticky top-[60px] z-30 -mx-7 flex overflow-x-auto border-y border-border bg-bg/95 px-7 backdrop-blur lg:top-[84px] lg:z-20 lg:mx-0 lg:mt-12 lg:block lg:self-start lg:overflow-visible lg:border-y-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none'
    : 'gonyik-rail mb-8 flex gap-3 overflow-x-auto pb-4 lg:sticky lg:top-[84px] lg:mb-0 lg:block lg:self-start lg:overflow-visible lg:pb-0'

  return (
    <nav ref={navRef} aria-label={label} className={navClass}>
      {items.map((item, index) => {
        const selected = active === item.id
        const buttonClass = variant === 'scrollspy'
          ? `shrink-0 border-b-2 px-4 py-3.5 text-left lg:block lg:w-full lg:border-b lg:border-l-[3px] lg:py-4 ${selected ? 'border-b-[#69B2C1] text-primary lg:border-b-border lg:border-l-[#69B2C1] lg:bg-white' : 'border-b-transparent text-secondary hover:text-primary lg:border-b-border lg:border-l-transparent'}`
          : `shrink-0 border-l-[3px] px-4 py-3 text-left lg:block lg:w-full lg:border-b lg:border-b-border lg:py-4 ${selected ? 'border-l-[#69B2C1] bg-white text-primary' : 'border-l-transparent text-secondary hover:text-primary'}`
        return <button
          key={item.id}
          ref={(node) => { if (node) buttonRefs.current.set(item.id, node); else buttonRefs.current.delete(item.id) }}
          type="button"
          aria-current={selected ? 'true' : undefined}
          onClick={() => onChange(item.id)}
          className={buttonClass}
        ><span className="mr-3 text-label">{String(index + 1).padStart(2, '0')}</span><span className="text-[14px] font-medium">{item.label}</span></button>
      })}
    </nav>
  )
}
