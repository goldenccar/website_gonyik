import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import AnimatedDisclosure from '@/components/AnimatedDisclosure'
import HorizontalRail from '@/components/HorizontalRail'
import { isServiceModuleType, type ServiceModuleType } from '@/config/serviceModules'
import type { CareGuide, ContentSection, FAQ } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'

interface ServiceModuleProps {
  section: ContentSection
  care: CareGuide[]
  faqs: FAQ[]
  openFaqId: number | null
  onToggleFaq: (id: number) => void
}

function ServiceSectionHeader({ section }: { section: ContentSection }) {
  return <>
    {section.eyebrow && <p className="label-en text-secondary"><InlineMarkup text={section.eyebrow} /></p>}
    <h2 className="type-module-title mt-3 text-primary"><InlineMarkup text={section.title} /></h2>
    {section.subtitle && <p className="body-copy mt-3 max-w-[760px] text-secondary"><InlineMarkup text={section.subtitle} /></p>}
  </>
}

function CareModule({ section, care }: ServiceModuleProps) {
  return <div>
    <ServiceSectionHeader section={section} />
    <div className="mt-8">
      <HorizontalRail label={section.nav_label || section.title} mobileStack>
        {care.map((item, index) => <article key={item.id} className="snap-start border-t border-primary pt-5">
          <p className="label-en text-secondary">{String(index + 1).padStart(2, '0')}</p>
          <h3 className="mt-4 text-h5 text-primary"><InlineMarkup text={item.title} /></h3>
          <p className="mt-3 text-[14px] leading-7 text-secondary"><InlineMarkup text={item.content} /></p>
        </article>)}
      </HorizontalRail>
    </div>
  </div>
}

function FaqModule({ section, faqs, openFaqId, onToggleFaq }: ServiceModuleProps) {
  return <div>
    <ServiceSectionHeader section={section} />
    <div className="mt-7 border-t border-border">
      {faqs.map((item) => {
        const isOpen = openFaqId === item.id
        return <article key={item.id} className="border-b border-border">
          <button type="button" onClick={() => onToggleFaq(item.id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-5 py-5 text-left text-[16px] font-medium text-primary">
            <span><InlineMarkup text={item.question} /></span><span aria-hidden="true">{isOpen ? '−' : '+'}</span>
          </button>
          <AnimatedDisclosure open={isOpen}><p className="max-w-[720px] pb-5 text-body text-secondary"><InlineMarkup text={item.answer} /></p></AnimatedDisclosure>
        </article>
      })}
    </div>
  </div>
}

function ContactModule({ section }: ServiceModuleProps) {
  return <div>
    <ServiceSectionHeader section={section} />
    <Link to="/contact" className="mt-8 inline-block bg-dark px-6 py-3 text-[14px] font-medium text-white">进入联系页面</Link>
  </div>
}

const serviceModuleComponents: Record<ServiceModuleType, ComponentType<ServiceModuleProps>> = {
  care: CareModule,
  faq: FaqModule,
  contact: ContactModule,
}

export function supportsServiceModule(section: ContentSection) {
  return isServiceModuleType(section.module_type)
}

export default function ServiceModule(props: ServiceModuleProps) {
  if (!isServiceModuleType(props.section.module_type)) return null
  const Component = serviceModuleComponents[props.section.module_type]
  return <Component {...props} />
}
