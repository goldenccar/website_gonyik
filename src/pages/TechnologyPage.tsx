import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { getContentSections } from '@/api/client'
import { InlineMarkup } from '@/components/MarkupParser'
import { PageSection, PageShell } from '@/components/PageLayout'
import PageHero from '@/components/PageHero'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import RpoPlatformStory from '@/components/technology/RpoPlatformStory'
import { SupplyChainVisual } from '@/components/HomeTechnicalVisuals'
import { getTechnologyPagePath, TECHNOLOGY_PAGES } from '@/config/technologyPages'
import { RPO_LABELS } from '@/config/rpoContent'
import { useSiteLocale } from '@/i18n/SiteLocale'
import type { FluorineSection } from '@/types'
import PublicContentLoader from '@/components/PublicContentLoader'
import '@/styles/rpo-platform.css'

const PREVIEW_MESSAGE = 'gonyik:technology-preview'

export default function TechnologyPage() {
  const { technologyKey = '' } = useParams()
  const location = useLocation()
  const { path: localePath, t } = useSiteLocale()
  const previewMode = new URLSearchParams(location.search).has('cms-preview')
  const [sections, setSections] = useState<FluorineSection[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [previewSection, setPreviewSection] = useState<FluorineSection | null>(null)
  const loadSections = useCallback(() => {
    setStatus('loading')
    getContentSections('pfas-free-innovation')
      .then(response => { setSections(response.data.data || []); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [])
  useEffect(loadSections, [loadSections])

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

  useEffect(() => {
    if (status !== 'ready') return
    if (!location.hash) return
    const frame = requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start', behavior: 'instant' }))
    return () => cancelAnimationFrame(frame)
  }, [technologyKey, location.hash, status])

  const definition = TECHNOLOGY_PAGES.find(page => page.sectionKey === technologyKey)
  const section = previewSection?.section_key === technologyKey ? previewSection : sections.find(item => item.section_key === technologyKey)
  if (!definition) return <Navigate to={localePath(`${getTechnologyPagePath('rpo-material-platform')}${technologyKey === 'pfas-free-system' ? '#material-choice' : ''}`)} replace />
  if (status === 'loading' && !previewSection) return <PublicContentLoader label="正在加载材料科技内容" />
  if (status === 'error' && !previewSection) return <PageShell><PageSection tone="white"><div role="alert"><p>{t('材料科技内容加载失败。')}</p><button type="button" onClick={loadSections} className="mt-4 underline">{t('重新加载')}</button></div></PageSection></PageShell>
  if (!section) return <PageShell><PageSection><p>{t('该页面暂未开放。')}</p><Link to={localePath('/pfas-free-innovation')}>{t(RPO_LABELS.overview)}</Link></PageSection></PageShell>
  const effectiveSection = section
  const heroImage = section.image_url
  return <PageShell className={`technology-reading rpo-page rpo-page--${technologyKey} ${section.hero_visual === 'supply' ? 'rpo-hero-has-animation' : ''}`}>
    {technologyKey === 'rpo-material-platform' ? <PageHero variant="editorial" title={section.title} subtitle={section.subtitle} image={heroImage}>
      {section.hero_scroll_label && section.hero_link && <Link className="rpo-text-link" to={localePath(section.hero_link)}><InlineMarkup text={section.hero_scroll_label} /><span aria-hidden="true">↓</span></Link>}
    </PageHero> : <section className="technology-feature-shell bg-[#041f38]">
      <div className="technology-feature-hero has-image relative flex w-full items-center overflow-hidden">
        {section.hero_visual === 'supply'
          ? <div className="rpo-supply-hero"><SupplyChainVisual /></div>
          : <>{heroImage && <img src={heroImage} alt="" loading="eager" fetchPriority="high" decoding="async" className={`absolute inset-0 h-full w-full ${effectiveSection.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`} />}<div className="technology-feature-shade absolute inset-0" /></>}
        <div className="technology-feature-copy relative z-10 w-full text-white"><div className="rpo-container">
          {section.eyebrow && <span className="rpo-hero-kicker"><InlineMarkup text={section.eyebrow} /></span>}
          <h1 className="type-hero text-white"><InlineMarkup text={effectiveSection.title} /></h1>
          <p><InlineMarkup text={effectiveSection.subtitle} /></p>
          {section.hero_scroll_label && section.hero_link && <Link className="rpo-text-link" to={localePath(section.hero_link)}><InlineMarkup text={section.hero_scroll_label} /><span aria-hidden="true">↓</span></Link>}
        </div></div>
      </div>
    </section>}
    <CatalogSelectorBar label={t('材料科技')} overview={{label: t(sections.find(item => item.section_key === 'rpo-material-platform')?.nav_label || ''), href:localePath(getTechnologyPagePath('rpo-material-platform'))}} groups={[{label:'',items:TECHNOLOGY_PAGES.filter(page => page.sectionKey !== 'rpo-material-platform' && (sections.some(item => item.section_key === page.sectionKey) || previewSection?.section_key === page.sectionKey)).map(page=>({key:page.sectionKey,label:t(sections.find(item=>item.section_key===page.sectionKey)?.nav_label || page.menuLabel),active:page.sectionKey===technologyKey,href:localePath(getTechnologyPagePath(page.sectionKey))}))}]} />
    <RpoPlatformStory key={technologyKey} section={effectiveSection} />
  </PageShell>
}
