import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { ArrowUpRight } from 'lucide-react'
import AnimatedDisclosure from '@/components/AnimatedDisclosure'
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

function ServiceSectionHeader({ section, light = false }: { section: ContentSection; light?: boolean }) {
  return <>
    {section.eyebrow && <p className={`label-en ${light ? 'text-white/60' : 'text-secondary'}`}><InlineMarkup text={section.eyebrow} /></p>}
    <h2 className={`type-module-title mt-3 ${light ? 'text-white' : 'text-primary'}`}><InlineMarkup text={section.title} /></h2>
    {section.subtitle && <p className={`body-copy mt-3 max-w-[760px] ${light ? 'text-white/70' : 'text-secondary'}`}><InlineMarkup text={section.subtitle} /></p>}
  </>
}

function CareModule({ section, care }: ServiceModuleProps) {
  return <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
    <div className="lg:col-span-4">
      <ServiceSectionHeader section={section} />
      <p className="label-en mt-8 hidden text-[#4e9bab] lg:block">CARE PROTOCOL · {String(care.length).padStart(2, '0')} STEPS</p>
    </div>
    <ol className="mt-9 border-t border-primary lg:col-span-8 lg:mt-0">
      {care.map((item, index) => <li key={item.id} className="grid gap-3 border-b border-border py-6 sm:grid-cols-[56px_160px_minmax(0,1fr)] sm:gap-5 md:py-7">
        <span className="label-en pt-1 text-[#4e9bab]">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="text-[17px] font-medium leading-7 text-primary"><InlineMarkup text={item.title} /></h3>
        <p className="text-[14px] leading-7 text-secondary"><InlineMarkup text={item.content} /></p>
      </li>)}
    </ol>
  </div>
}

function FaqModule({ section, faqs, openFaqId, onToggleFaq }: ServiceModuleProps) {
  return <div>
    <ServiceSectionHeader section={section} />
    <div className="mt-7 border-t border-border">
      {faqs.map((item) => {
        const isOpen = openFaqId === item.id
        return <article key={item.id} className="border-b border-border">
          <button type="button" onClick={() => onToggleFaq(item.id)} aria-expanded={isOpen} className="group flex w-full items-center justify-between gap-5 py-5 text-left text-[16px] font-medium text-primary md:py-6">
            <span><InlineMarkup text={item.question} /></span><span aria-hidden="true" className="relative h-5 w-5 shrink-0 text-[#4e9bab]"><span className="absolute left-0 top-1/2 h-px w-5 bg-current" /><span className={`absolute left-1/2 top-0 h-5 w-px bg-current transition-transform duration-[var(--motion-switch)] ease-apple ${isOpen ? 'scale-y-0' : 'scale-y-100'}`} /></span>
          </button>
          <AnimatedDisclosure open={isOpen}><div className="mb-6 max-w-[760px] border-l-2 border-[#69B2C1] pl-5 text-body text-secondary"><InlineMarkup text={item.answer} /></div></AnimatedDisclosure>
        </article>
      })}
    </div>
  </div>
}

function ContactModule({ section }: ServiceModuleProps) {
  return <div className="bg-dark px-6 py-9 md:px-10 md:py-12 lg:flex lg:items-end lg:justify-between lg:gap-12">
    <div><ServiceSectionHeader section={section} light /></div>
    <Link to="/contact" className="mt-8 inline-flex shrink-0 items-center gap-3 border border-white/25 px-5 py-3 text-[14px] font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-primary lg:mt-0">进入联系页面 <ArrowUpRight size={16} /></Link>
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
