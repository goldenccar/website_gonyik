import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicBootstrap } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { FabricSeries, HomeConfig } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'
import { MaterialSystemVisual, MaterialValidationSummary } from '@/components/HomeTechnicalVisuals'
import { useSiteLocale } from '@/i18n/SiteLocale'

const SERIES_TITLES: Record<string, string> = {
  otter: '蓝标 OTTER',
  rayo: '银标 RAYO',
  kais: '黑标 KAIS',
}

const DEFAULT_HOME: HomeConfig = {
  id: 0,
  hero_tag: 'PERFORMANCE TEXTILE TECHNOLOGY',
  hero_title: '以材料科技\n重构高性能面料',
  hero_slogan: '港翼围绕底层材料、结构设计、制造与验证，开发面向真实应用的功能面料和材料解决方案。',
  hero_background: null,
  hero_mobile_background: null,
  primary_btn_text: '探索材料', primary_btn_link: '/fabrics', secondary_btn_text: '探索技术', secondary_btn_link: '/pfas-free-innovation',
  platform_section_title: '', platform_section_subtitle: '', platform_section_link_text: '', platform_section_link: '/pfas-free-innovation', platform_cards: [],
  series_section_title: '', series_section_subtitle: '', series_section_link_text: '查看全部面料产品', series_section_link: '/fabrics',
  verification_image: null, verification_images: [],
  verification_section_title: '', verification_section_subtitle: '', verification_section_link_text: '', verification_section_link: '/pfas-free-innovation#technology-testing-certification', verifications: [],
}

export default function Home() {
  const [config, setConfig] = useState<HomeConfig>(DEFAULT_HOME)
  const [series, setSeries] = useState<FabricSeries[]>([])
  const { path: localePath } = useSiteLocale()

  useEffect(() => {
    getPublicBootstrap().then((response) => {
      setConfig(response.data.home_config || DEFAULT_HOME)
      setSeries((response.data.series || []).sort((a: FabricSeries, b: FabricSeries) => a.order_index - b.order_index))
    })
  }, [])

  return (
    <PageShell>
      <PageHero
        variant="home"
        tag={config.hero_tag || 'PERFORMANCE MATERIALS'}
        title={config.hero_title || '从材料开始\n构建可靠防护'}
        subtitle={config.hero_slogan}
        image={config.hero_background}
        mobileImage={config.hero_mobile_background}
        imageAlt="港翼复合面料与膜层微距"
        scrollLabel="下滑探索港翼科技"
        scrollTarget="#home-rpo-platform"
      >
        <div className="flex flex-wrap items-center gap-7">
          <Link to={localePath(config.primary_btn_link || '/fabrics')} className="bg-[#0b4f87] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#12649f]"><InlineMarkup text={config.primary_btn_text || '探索材料'} /></Link>
          <Link to={localePath(config.secondary_btn_link || '/pfas-free-innovation')} className="py-3 text-[14px] font-medium text-white underline decoration-white/60 underline-offset-4 hover:decoration-white"><InlineMarkup text={config.secondary_btn_text || '探索技术'} /> →</Link>
        </div>
      </PageHero>

      <PageSection id="home-rpo-platform" className="scroll-mt-[60px] lg:!py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-12">
          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
            <h2 className="type-section-title text-primary"><InlineMarkup text={config.platform_section_title} /></h2>
            <p className="body-copy mt-4 max-w-[420px] text-secondary"><InlineMarkup text={config.platform_section_subtitle} /></p>
            <Link to={localePath(config.platform_section_link)} className="mt-8 inline-block text-[14px] underline underline-offset-4"><InlineMarkup text={config.platform_section_link_text} /> →</Link>
          </div>
          <MaterialSystemVisual
            items={config.platform_cards || []}
            href={localePath(config.platform_section_link)}
            itemHrefs={[
              localePath('/pfas-free-innovation/rpo-sotex-membrane'),
              localePath('/pfas-free-innovation/lamination'),
              localePath('/pfas-free-innovation/supply-chain'),
            ]}
          />
          <MaterialValidationSummary
            image={config.verification_image}
            images={config.verification_images || []}
            title={config.verification_section_title}
            subtitle={config.verification_section_subtitle}
            items={config.verifications || []}
            linkText={config.verification_section_link_text}
            linkTo={localePath(config.verification_section_link || '/pfas-free-innovation#technology-testing-certification')}
          />
        </div>
      </PageSection>

      <PageSection tone="white" className="!py-20 md:!py-24 lg:!py-28">
        <div className="mx-auto max-w-[940px] text-center">
          <h2 className="text-balance text-[clamp(34px,4vw,58px)] font-semibold leading-[1.12] tracking-[-.035em] text-primary"><InlineMarkup text={config.series_section_title} /></h2>
          <p className="mx-auto mt-6 max-w-[760px] text-[16px] leading-8 text-secondary md:text-[18px]"><InlineMarkup text={config.series_section_subtitle} /></p>
          {config.series_section_link_text && <Link to={localePath(config.series_section_link || '/fabrics')} className="mt-7 inline-block border-b border-primary/35 pb-1 text-[14px] font-medium text-primary"><InlineMarkup text={config.series_section_link_text} /> →</Link>}
        </div>

        <div className="mt-14 grid items-stretch gap-x-7 gap-y-12 md:mt-16 md:grid-cols-3">
          {['otter', 'rayo', 'kais'].map((slug) => series.find((item) => item.slug === slug)).filter(Boolean).map((item) => {
            return <Link key={item!.id} to={localePath(`/fabrics/series/${item!.slug}`)} className="group relative flex h-full min-w-0 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#69B2C1]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#edf2f4]">
                {item!.home_image ? <img src={item!.home_image} alt={item!.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-[transform,filter] duration-[var(--motion-media)] ease-apple group-hover:scale-[1.022] group-hover:brightness-[1.04] group-focus-visible:scale-[1.022] group-focus-visible:brightness-[1.04]" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#69B2C1] transition-transform duration-[var(--motion-switch)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </div>
              <h3 className="mt-6 text-[26px] font-semibold tracking-[-.025em] text-primary"><InlineMarkup text={SERIES_TITLES[item!.slug] || item!.name} /></h3>
              <p className="mt-2 max-w-[360px] text-[15px] leading-6 text-secondary"><InlineMarkup text={item!.tagline} /></p>
              <span className="mt-auto pt-6 text-[13px] font-medium text-primary"><span className="border-b border-primary/30 pb-1 transition-colors group-hover:border-[#69B2C1] group-focus-visible:border-[#69B2C1]">探索系列 <span className="ml-1 inline-block transition-transform duration-[var(--motion-instant)] group-hover:translate-x-1 group-focus-visible:translate-x-1">→</span></span></span>
            </Link>
          })}
        </div>
      </PageSection>
    </PageShell>
  )
}
