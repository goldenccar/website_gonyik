import { useState } from 'react'
import AnimatedDisclosure from '@/components/AnimatedDisclosure'
import { InlineMarkup } from '@/components/MarkupParser'
import type { FAQ } from '@/types'

export default function ServiceFaqList({ items }: { items: FAQ[] }) {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <section className="grid gap-8 border-t border-border pt-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <h2 className="text-[26px] font-medium tracking-[-0.02em] text-primary md:text-[32px]">相关问题</h2>
      </div>
      <div className="border-t border-border lg:col-span-8">
        {items.map((item) => {
          const isOpen = openId === item.id
          return (
            <article key={item.id} className="border-b border-border">
              <button type="button" onClick={() => setOpenId(isOpen ? null : item.id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-5 py-5 text-left text-[16px] font-medium text-primary md:py-6">
                <span><InlineMarkup text={item.question} /></span>
                <span aria-hidden="true" className="relative h-5 w-5 shrink-0 text-[#4e9bab]">
                  <span className="absolute left-0 top-1/2 h-px w-5 bg-current" />
                  <span className={`absolute left-1/2 top-0 h-5 w-px bg-current transition-transform duration-[var(--motion-switch)] ease-apple ${isOpen ? 'scale-y-0' : 'scale-y-100'}`} />
                </span>
              </button>
              <AnimatedDisclosure open={isOpen}>
                <p className="mb-6 max-w-[700px] border-l-2 border-[#69B2C1] pl-5 text-body text-secondary"><InlineMarkup text={item.answer} /></p>
              </AnimatedDisclosure>
            </article>
          )
        })}
      </div>
    </section>
  )
}
