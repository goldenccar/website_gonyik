import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getContentSections } from '@/api/client'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import MarkupParser, { InlineMarkup } from '@/components/MarkupParser'
import { PageSection, PageShell } from '@/components/PageLayout'
import MembraneStructureStory from '@/components/technology/MembraneStructureStory'
import PfasSystemStory from '@/components/technology/PfasSystemStory'
import { getTechnologyPagePath, TECHNOLOGY_GROUPS, TECHNOLOGY_PAGES } from '@/config/technologyPages'
import { useSiteLocale } from '@/i18n/SiteLocale'
import type { FluorineSection } from '@/types'

const PREVIEW_MESSAGE = 'gonyik:technology-preview'
const DEFAULT_TECHNOLOGY_HERO_IMAGES: Record<string, string> = {
  'pfas-free-system': '/visuals/pfas-system-hero-v8.jpg',
  'rpo-material-platform': '/visuals/technology-rpo-platform-hero-v1.webp',
  'rpo-sotex-membrane': '/visuals/technology-membrane-production-hero-v1.webp',
  'high-performance-fiber': '/visuals/technology-fiber-production-hero-v2.webp',
  'lamination': '/visuals/technology-lamination-hero-v1.webp',
  'supply-chain': '/visuals/technology-supply-chain-hero-v1.webp',
  'testing-certification': '/visuals/technology-testing-hero-v2.jpg',
}
const DEFAULT_PFAS_SECTION: FluorineSection = {
  id: 0,
  page_key: 'pfas-free-innovation',
  section_key: 'pfas-free-system',
  order_index: 0,
  title: '无氟技术体系',
  subtitle: '从新的材料体系出发，重建高性能防护的结构与体验。',
  content: '',
  image_url: '/visuals/pfas-system-hero-v8.jpg',
  image_fit: 'cover',
}

export default function TechnologyPage() {
  const { technologyKey = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { path: localePath, t } = useSiteLocale()
  const previewMode = new URLSearchParams(location.search).has('cms-preview')
  const [sections, setSections] = useState<FluorineSection[]>([])
  const [previewSection, setPreviewSection] = useState<FluorineSection | null>(null)

  useEffect(() => {
    getContentSections('pfas-free-innovation')
      .then((response) => setSections(response.data.data || []))
      .catch(() => setSections([]))
  }, [])

  useEffect(() => {
    if (!previewMode) return
    const receivePreview = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      if (event.data?.type !== PREVIEW_MESSAGE || !event.data?.payload) return
      const next = event.data.payload as FluorineSection
      if (next.section_key === technologyKey) setPreviewSection(next)
    }
    window.addEventListener('message', receivePreview)
    window.parent.postMessage({ type: `${PREVIEW_MESSAGE}:ready`, sectionKey: technologyKey }, window.location.origin)
    return () => window.removeEventListener('message', receivePreview)
  }, [previewMode, technologyKey])

  const section = useMemo(() => (
    previewSection
    || sections.find((item) => item.section_key === technologyKey)
    || null
  ), [previewSection, sections, technologyKey])
  const definitionExists = TECHNOLOGY_PAGES.some((page) => page.sectionKey === technologyKey)
  const isPfasSystem = technologyKey === 'pfas-free-system'
  const isMembraneTechnology = technologyKey === 'rpo-sotex-membrane'
  const effectiveSection = isPfasSystem
    ? { ...DEFAULT_PFAS_SECTION, ...(section || {}), image_url: section?.image_url || DEFAULT_PFAS_SECTION.image_url }
    : section
  const heroImage = effectiveSection?.image_url
    || DEFAULT_TECHNOLOGY_HERO_IMAGES[technologyKey]
    || null
  const selectorSections = previewSection
    ? sections.some((item) => item.section_key === previewSection.section_key)
      ? sections.map((item) => item.section_key === previewSection.section_key ? previewSection : item)
      : [...sections, previewSection]
    : sections

  if (!definitionExists) {
    return <Navigate to={localePath(getTechnologyPagePath(TECHNOLOGY_PAGES[0].sectionKey))} replace />
  }

  return (
    <PageShell className="technology-reading">
      <section className="technology-feature-shell bg-[#041f38]">
        <div className={`technology-feature-hero ${heroImage ? 'has-image' : ''} relative flex w-full items-center overflow-hidden`}>
          {heroImage
            ? <img src={heroImage} alt="" loading="eager" fetchPriority="high" decoding="async" className={`absolute inset-0 h-full w-full ${effectiveSection?.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`} />
            : <div className="technology-feature-fallback absolute inset-0" aria-hidden="true" />}
          <div className="technology-feature-shade absolute inset-0" />
          <div className="technology-feature-copy relative z-10 w-full text-white">
            <div className="mx-auto w-full max-w-[1760px] px-7 py-24 md:px-12 md:py-28 lg:px-20 lg:py-32">
              <h1 className="type-hero max-w-[900px] text-balance text-white">
                <InlineMarkup text={effectiveSection?.title || '材料科技'} />
              </h1>
              {effectiveSection?.subtitle && <p className="body-copy mt-5 max-w-[660px] text-white/78"><InlineMarkup text={effectiveSection.subtitle} /></p>}
              {isPfasSystem && effectiveSection?.hero_statement && (
                <p className="mt-7 max-w-[980px] text-balance text-[20px] font-medium leading-[1.45] text-white/92 md:text-[25px]">
                  <InlineMarkup text={effectiveSection.hero_statement} />
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <CatalogSelectorBar
        label={t('材料科技')}
        variant="technology"
        groups={TECHNOLOGY_GROUPS.map((group) => ({
          label: t(group.label),
          items: group.pages.flatMap((page) => {
            const cmsSection = selectorSections.find((item) => item.section_key === page.sectionKey)
            if (!cmsSection && sections.length > 0) return []
            return [{
              key: page.sectionKey,
              label: t(cmsSection?.nav_label || page.menuLabel),
              active: page.sectionKey === technologyKey,
              onSelect: () => navigate(localePath(getTechnologyPagePath(page.sectionKey))),
            }]
          }),
        }))}
      />

      {isPfasSystem ? (
        <PfasSystemStory section={effectiveSection as FluorineSection} />
      ) : (
        <>
          {isMembraneTechnology && effectiveSection
            ? <MembraneStructureStory section={effectiveSection} />
            : section?.content ? (
              <PageSection tone="white" className="min-h-[520px]">
                <article className="max-w-[820px]">
                  <MarkupParser text={section.content} className="technical-copy text-secondary" />
                  {technologyKey === 'testing-certification' && (
                    <Link to={localePath('/contact')} className="mt-8 inline-block text-[14px] font-medium text-primary underline decoration-border underline-offset-4 hover:decoration-primary">
                      <InlineMarkup text="获取适用型号的 TDS 与测试资料" /> →
                    </Link>
                  )}
                </article>
              </PageSection>
            ) : null}
        </>
      )}
    </PageShell>
  )
}
