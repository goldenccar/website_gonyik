import { useEffect, useState } from 'react'
import { getCareGuides, getContactConfig, getContentSections, getFaqs, getPageConfig, getSupportResources } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageShell } from '@/components/PageLayout'
import ScrollSpySections from '@/components/ScrollSpySections'
import ServiceModule, { supportsServiceModule } from '@/components/service/ServiceModule'
import type { CareGuide, ContactConfig, ContentSection, FAQ, PageConfig, SupportResource } from '@/types'

export default function ServicesSupport() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [care, setCare] = useState<CareGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [resources, setResources] = useState<SupportResource[]>([])
  const [contact, setContact] = useState<ContactConfig | null>(null)
  const [sectionConfig, setSectionConfig] = useState<ContentSection[]>([])
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getPageConfig('services'), getCareGuides(), getFaqs(), getSupportResources(), getContactConfig(), getContentSections('services')]).then(([config, guides, questions, files, contactConfig, content]) => {
      setPage(config.data.data)
      setCare(guides.data.data || [])
      setFaqs(questions.data.data || [])
      setResources(files.data.data || [])
      setContact(contactConfig.data.data || null)
      setSectionConfig(content.data.data || [])
    })
  }, [])

  const sections = sectionConfig.filter(supportsServiceModule).map((section) => ({
    id: section.section_key || String(section.id),
    label: section.nav_label || section.title,
    content: <ServiceModule section={section} care={care} faqs={faqs} resources={resources} contact={contact} openFaqId={open} onToggleFaq={(id) => setOpen(open === id ? null : id)} />,
  }))

  return (
    <PageShell>
      <PageHero tag={page?.page_tag || 'CARE & SUPPORT'} title={page?.page_title || '服务与支持'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="功能面料洗涤与保养" />
      <ScrollSpySections idPrefix="service" label="服务目录" showIndex={false} topNav items={sections} />
    </PageShell>
  )
}
