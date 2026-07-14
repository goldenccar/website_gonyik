import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getHomeConfig } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell, SectionHeader } from '@/components/PageLayout'
import type { FabricSeries, HomeConfig } from '@/types'
import MotionInView from '@/components/MotionInView'

const SERIES_TITLES: Record<string, string> = {
  otter: '蓝标 OTTER',
  rayo: '银标 RAYO',
  kais: '红标 KAIS',
}

const DEFAULT_HOME: HomeConfig = {
  id: 0,
  hero_tag: 'PERFORMANCE MATERIALS',
  hero_title: '从材料开始\n构建可靠防护',
  hero_slogan: '围绕真实使用环境，开发兼顾防护、舒适与耐用表现的功能面料。',
  hero_background: null,
  hero_mobile_background: null,
  primary_btn_text: '探索材料', primary_btn_link: '/fabrics', secondary_btn_text: '探索技术', secondary_btn_link: '/pfas-free-innovation',
  platform_section_title: '', platform_section_subtitle: '', platform_section_link_text: '', platform_section_link: '/pfas-free-innovation', platform_cards: [],
  series_section_title: '', series_section_subtitle: '', series_section_link_text: '', series_section_link: '/fabrics',
  verification_section_title: '', verification_section_subtitle: '', verification_section_link_text: '', verification_section_link: '/fabrics', verifications: [],
}

export default function Home() {
  const [config, setConfig] = useState<HomeConfig>(DEFAULT_HOME)
  const [series, setSeries] = useState<FabricSeries[]>([])

  useEffect(() => {
    getHomeConfig().then((home) => {
      setConfig(home.data.data || DEFAULT_HOME)
      setSeries((home.data.series || []).sort((a: FabricSeries, b: FabricSeries) => a.order_index - b.order_index))
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
      >
        <div className="mt-8 flex flex-wrap items-center gap-7">
          <Link to={config.primary_btn_link || '/fabrics'} className="bg-[#0b4f87] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#12649f]">{config.primary_btn_text || '探索材料'}</Link>
          <Link to={config.secondary_btn_link || '/pfas-free-innovation'} className="py-3 text-[14px] font-medium text-white underline decoration-white/60 underline-offset-4 hover:decoration-white">{config.secondary_btn_text || '探索技术'} →</Link>
        </div>
      </PageHero>

      <PageSection className="lg:!py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-label text-secondary">MATERIAL SYSTEM</p>
            <h2 className="mt-4 text-[36px] font-semibold leading-[1.15] text-primary">{config.platform_section_title}</h2>
            <p className="mt-4 max-w-[420px] text-body text-secondary">{config.platform_section_subtitle}</p>
            <Link to={config.platform_section_link} className="mt-8 inline-block text-[14px] underline underline-offset-4">{config.platform_section_link_text} →</Link>
          </div>
          <MotionInView className="relative grid md:grid-cols-3 lg:col-span-8">
            <span aria-hidden="true" className="motion-process-line absolute inset-x-0 top-0 h-px bg-[#69B2C1]" />
            {(config.platform_cards || []).slice(0, 3).map((item, index) => (
              <Link data-motion-item style={{ '--motion-delay': `${index * 75}ms` } as CSSProperties} to={config.platform_section_link} key={`${item.title}-${index}`} className="group flex min-h-[190px] flex-col border-b border-border py-6 md:border-r md:px-7 md:last:border-r-0">
                <span className="text-label text-secondary">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 text-[20px] font-semibold text-primary">{item.title}</h3>
                <p className="mt-4 text-[14px] leading-6 text-secondary">{item.subtitle || item.description}</p>
                <span className="mt-auto self-end pt-5 text-primary transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </MotionInView>
        </div>
      </PageSection>

      <PageSection tone="navy">
        <SectionHeader tag="FABRIC SERIES" title={config.series_section_title} subtitle={config.series_section_subtitle} linkText={config.series_section_link_text} linkTo={config.series_section_link} light />
        <div className="grid items-stretch gap-x-6 gap-y-10 md:grid-cols-3">
          {['otter', 'rayo', 'kais'].map((slug) => series.find((item) => item.slug === slug)).filter(Boolean).map((item) => {
            return <Link key={item!.id} to={`/fabrics?series=${item!.slug}`} className={`group relative flex min-w-0 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#69B2C1] ${item!.slug === 'kais' ? 'md:before:absolute md:before:-left-3 md:before:inset-y-0 md:before:w-px md:before:bg-white/20' : ''}`}>
              <div className="relative aspect-[16/10] overflow-hidden bg-dark md:aspect-[4/3]">
                {item!.home_image ? <img src={item!.home_image} alt={item!.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-[transform,filter] duration-[var(--motion-media)] ease-apple group-hover:scale-[1.022] group-hover:brightness-[1.04] group-focus-visible:scale-[1.022] group-focus-visible:brightness-[1.04]" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}
                {item!.home_badge_image && <img src={item!.home_badge_image} alt={`${item!.name} 系列徽章`} loading="lazy" decoding="async" className="absolute bottom-4 left-4 z-10 w-[96px] object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.28)] transition-transform duration-[var(--motion-media)] ease-apple group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 md:bottom-5 md:left-5 md:w-[112px]" />}
              </div>
              <h3 className="mt-5 text-[20px] font-semibold text-white">{SERIES_TITLES[item!.slug] || item!.name}</h3>
              <p className="mt-2 max-w-[360px] text-[15px] leading-6 text-white/65">{item!.tagline}</p>
              <span className="mt-auto pt-6 text-[14px] text-white"><span className="relative inline-block after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-[var(--motion-instant)] group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">查看系列 <span className="inline-block transition-transform duration-[var(--motion-instant)] group-hover:translate-x-1 group-focus-visible:translate-x-1">→</span></span></span>
            </Link>
          })}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeader tag="VALIDATION" title={config.verification_section_title} subtitle={config.verification_section_subtitle} linkText={config.verification_section_link_text} linkTo={config.verification_section_link} />
        <div className="grid gap-8 md:grid-cols-2">
          {(config.verifications || []).slice(0, 2).map((item, index) => <div key={`${item.title}-${index}`} className="border-t border-primary pt-6"><p className="text-label text-secondary">{String(index + 1).padStart(2, '0')}</p><h3 className="mt-4 text-[22px] font-semibold text-primary">{item.title}</h3><p className="mt-3 max-w-[520px] text-body text-secondary">{item.subtitle}</p></div>)}
        </div>
      </PageSection>
    </PageShell>
  )
}
