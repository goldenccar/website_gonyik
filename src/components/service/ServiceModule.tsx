import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { ArrowDownToLine, ArrowUpRight, FileText } from 'lucide-react'
import AnimatedDisclosure from '@/components/AnimatedDisclosure'
import { isServiceModuleType, type ServiceModuleType } from '@/config/serviceModules'
import type { CareGuide, ContactConfig, ContentSection, FAQ, SupportResource } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'

interface ServiceModuleProps {
  section: ContentSection
  care: CareGuide[]
  faqs: FAQ[]
  resources: SupportResource[]
  contact: ContactConfig | null
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
    </div>
    <ol className="mt-9 grid gap-px border border-border/80 bg-border/80 sm:grid-cols-2 lg:col-span-8 lg:mt-0">
      {care.map((item, index) => <li key={item.id} className="min-w-0 bg-white/70 px-5 py-6 md:px-6 md:py-7">
        <span className="label-en text-[#4e9bab]">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="mt-4 text-[17px] font-medium leading-7 text-primary"><InlineMarkup text={item.title} /></h3>
        <p className="mt-2 text-[14px] leading-7 text-secondary"><InlineMarkup text={item.content} /></p>
      </li>)}
    </ol>
  </div>
}

function FaqModule({ section, faqs, openFaqId, onToggleFaq }: ServiceModuleProps) {
  return <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
    <div className="lg:col-span-4"><ServiceSectionHeader section={section} /></div>
    <div className="mt-8 border-t border-border lg:col-span-8 lg:mt-0">
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

function ResourcesModule({ section, resources }: ServiceModuleProps) {
  return <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
    <div className="lg:col-span-4"><ServiceSectionHeader section={section} /></div>
    <div className="mt-8 border-t border-border lg:col-span-8 lg:mt-0">
      {resources.length > 0 ? resources.map((item) => <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer" className="group grid gap-4 border-b border-border py-5 transition-colors hover:bg-white/60 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center sm:px-3 md:py-6">
        <span className="flex h-11 w-11 items-center justify-center border border-border text-[#4e9bab]"><FileText size={19} /></span>
        <span className="min-w-0"><strong className="block text-[16px] font-medium text-primary"><InlineMarkup text={item.title} /></strong>{item.description && <span className="mt-1 block text-[13px] leading-6 text-secondary"><InlineMarkup text={item.description} /></span>}</span>
        <span className="flex items-center gap-3 text-[12px] font-medium tracking-[0.08em] text-secondary group-hover:text-primary"><span>{item.file_type || 'FILE'}</span><ArrowDownToLine size={16} /></span>
      </a>) : <p className="border-b border-border py-6 text-[14px] text-secondary">暂无公开资料。如需 TDS 或测试文件，请通过联系页面提交需求。</p>}
    </div>
  </div>
}

function ContactModule({ section, contact }: ServiceModuleProps) {
  return <div className="grid overflow-hidden bg-dark lg:grid-cols-12">
    <div className="px-6 py-9 md:px-10 md:py-12 lg:col-span-7"><ServiceSectionHeader section={section} light /></div>
    <div className="border-t border-white/15 px-6 py-8 md:px-10 lg:col-span-5 lg:border-l lg:border-t-0 lg:py-12">
      <dl className="space-y-4 text-[13px] text-white/75">
        {contact?.email && <div><dt className="label-en text-white/45">EMAIL</dt><dd className="mt-1.5 text-[15px] text-white"><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>}
        {contact?.phone && <div><dt className="label-en text-white/45">PHONE</dt><dd className="mt-1.5 text-[15px] text-white"><InlineMarkup text={contact.phone} /></dd></div>}
      </dl>
      <Link to="/contact" className="mt-7 inline-flex items-center gap-3 border border-white/25 px-5 py-3 text-[14px] font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-primary">提交项目需求 <ArrowUpRight size={16} /></Link>
    </div>
  </div>
}

const serviceModuleComponents: Record<ServiceModuleType, ComponentType<ServiceModuleProps>> = {
  care: CareModule,
  faq: FaqModule,
  resources: ResourcesModule,
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
