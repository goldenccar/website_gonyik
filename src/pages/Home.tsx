import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import { InlineMarkup } from '@/components/MarkupParser'
import { MaterialSystemVisual, MaterialValidationSummary } from '@/components/HomeTechnicalVisuals'
import { useSiteLocale } from '@/i18n/SiteLocale'

export default function Home() {
  const { path, t, bootstrap } = useSiteLocale()
  const c = bootstrap.home_config
  const series = ['otter', 'rayo', 'kais'].flatMap(slug => bootstrap.series.filter(s => s.slug === slug))
  const [selected, setSelected] = useState('otter')
  const active = series.find(s => s.slug === selected) || series[0]
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  return <PageShell className="home-release">
    <div id="H01"><PageHero variant="home" tag={c.hero_tag} title={c.hero_title} subtitle={c.hero_slogan} image={c.hero_background} mobileImage={c.hero_mobile_background} imageAlt="港翼户外服装应用" scrollLabel="下滑探索港翼科技" scrollTarget="#H03">
      <div className="flex flex-wrap items-center gap-7">
        {c.primary_btn_text && c.primary_btn_link && <Link to={path(c.primary_btn_link)} className="bg-[#0b4f87] px-6 py-3 ui-copy text-white transition-colors hover:bg-[#12649f]"><InlineMarkup text={c.primary_btn_text} /></Link>}
        {c.secondary_btn_text && c.secondary_btn_link && <Link to={path(c.secondary_btn_link)} className="py-3 ui-copy text-white underline decoration-white/60 underline-offset-4 hover:decoration-white"><InlineMarkup text={c.secondary_btn_text} /> →</Link>}
      </div>
    </PageHero></div>

    {!!series.length && <PageSection variant="home" id="H03" tone="white" className="!py-12 md:!py-16" outerClassName="home-section-frame scroll-mt-[60px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <h2 className="type-section-title text-primary"><InlineMarkup text={c.series_section_title || '面料系列'} /></h2>
      <div role="tablist" aria-label={t('面料系列')} className="home-series-tabs">
        {series.map((s, index) => <button key={s.slug} type="button" role="tab" id={`home-tab-${s.slug}`} aria-controls={`home-panel-${s.slug}`} aria-selected={active?.slug === s.slug} tabIndex={active?.slug === s.slug ? 0 : -1} ref={node => { tabs.current[index] = node }}
          onClick={() => setSelected(s.slug)}
          onKeyDown={event => {
            const next = event.key === 'ArrowRight' ? (index + 1) % series.length : event.key === 'ArrowLeft' ? (index - 1 + series.length) % series.length : event.key === 'Home' ? 0 : event.key === 'End' ? series.length - 1 : null
            if (next === null) return
            event.preventDefault()
            setSelected(series[next].slug)
            tabs.current[next]?.focus()
          }}
          className="type-small-title">{s.slug.toUpperCase()}</button>)}
      </div>
      </div>
      {series.map(s => {
        const copy = c.series_entries?.[s.slug]
        return <div key={s.slug} id={`home-panel-${s.slug}`} role="tabpanel" aria-labelledby={`home-tab-${s.slug}`} hidden={active?.slug !== s.slug} tabIndex={0} className="pt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:pt-8">
          <div className="home-series-stage">
            <div className="home-series-image">
              {s.home_image ? <img src={s.home_image} alt={`${s.slug.toUpperCase()} ${t('系列面料')}`} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}
            </div>
            <div className="home-series-copy">
              <h3 className="type-hero type-heading-en text-white">{s.slug.toUpperCase()}</h3>
              {copy?.title && <p className="type-card-title mt-5 text-white"><InlineMarkup text={copy.title} /></p>}
              {copy?.description && <p className="body-copy mt-2 max-w-[420px] text-white/75"><InlineMarkup text={copy.description} /></p>}
              <Link to={path('/fabrics/series/' + s.slug)} className="home-series-link ui-copy"><span>{t('探索系列')}</span><ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      })}
    </PageSection>}

    <PageSection variant="home" id="home-rpo-platform" className="scroll-mt-[60px] lg:!py-16" outerClassName="home-section-frame">
      <div className="home-technology-intro">
        <div>
          <h2 className="type-section-title text-primary"><InlineMarkup text={c.platform_section_title} /></h2>
          <p className="body-copy mt-4 text-secondary"><InlineMarkup text={c.platform_section_subtitle} /></p>
        </div>
        <Link to={path(c.platform_section_link)} className="home-technology-link ui-copy"><InlineMarkup text={c.platform_section_link_text} /><ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" /></Link>
      </div>
      <div className="home-technology-layout">
        <MaterialValidationSummary image={c.verification_image} images={c.verification_images || []} title={c.verification_section_title} subtitle={c.verification_section_subtitle} linkText={c.verification_section_link_text} linkTo={path(c.verification_section_link || '/pfas-free-innovation/testing-certification')} />
        <MaterialSystemVisual items={c.platform_cards || []} />
      </div>
    </PageSection>
  </PageShell>
}
