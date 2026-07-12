import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFabricSeries, getHomeConfig } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell, SectionHeader } from '@/components/PageLayout'
import type { FabricSeries, HomeConfig } from '@/types'

const SERIES_LABELS = {
  otter: { label: '蓝标 OTTER', logo: '/brandmarks/otter-label.svg' },
  rayo: { label: '银标 RAYO', logo: '/brandmarks/rayo-label.svg' },
  kais: { label: '红标 KAIS', logo: '/brandmarks/kais-label.svg' },
} as const

const DEFAULT_HOME: HomeConfig = {
  id: 0,
  hero_tag: 'PERFORMANCE MATERIALS',
  hero_title: '从材料开始\n构建可靠防护',
  hero_slogan: '围绕真实使用环境，开发兼顾防护、舒适与耐用表现的功能面料。',
  hero_background: null,
  primary_btn_text: '探索材料', primary_btn_link: '/fabrics', secondary_btn_text: '探索技术', secondary_btn_link: '/pfas-free-innovation',
  platform_section_title: '', platform_section_subtitle: '', platform_section_link_text: '', platform_section_link: '/pfas-free-innovation', platform_cards: [],
  series_section_title: '', series_section_subtitle: '', series_section_link_text: '', series_section_link: '/fabrics',
  verification_section_title: '', verification_section_subtitle: '', verification_section_link_text: '', verification_section_link: '/fabrics', verifications: [],
}

export default function Home() {
  const [config, setConfig] = useState<HomeConfig>(DEFAULT_HOME)
  const [series, setSeries] = useState<FabricSeries[]>([])

  useEffect(() => {
    Promise.all([getHomeConfig(), getFabricSeries()]).then(([home, fabrics]) => {
      setConfig(home.data.data || null)
      setSeries((fabrics.data.data || []).sort((a: FabricSeries, b: FabricSeries) => a.order_index - b.order_index))
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
        imageAlt="港翼复合面料与膜层微距"
      >
        <div className="mt-8 flex flex-wrap gap-5">
          <Link to={config.primary_btn_link || '/fabrics'} className="bg-dark px-6 py-3 text-[14px] font-medium text-white">{config.primary_btn_text || '探索材料'}</Link>
          <Link to={config.secondary_btn_link || '/pfas-free-innovation'} className="py-3 text-[14px] font-medium text-primary underline underline-offset-4">{config.secondary_btn_text || '探索技术'} →</Link>
        </div>
      </PageHero>

      <PageSection tone="white">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-label text-secondary">MATERIAL SYSTEM</p>
            <h2 className="mt-4 text-[36px] font-semibold leading-[1.15] text-primary">{config.platform_section_title}</h2>
            <p className="mt-4 max-w-[420px] text-body text-secondary">{config.platform_section_subtitle}</p>
            <Link to={config.platform_section_link} className="mt-8 inline-block text-[14px] underline underline-offset-4">{config.platform_section_link_text} →</Link>
          </div>
          <div className="border-t border-border lg:col-span-8">
            {(config.platform_cards || []).slice(0, 3).map((item, index) => (
              <Link to={config.platform_section_link} key={`${item.title}-${index}`} className="group grid gap-3 border-b border-border py-6 md:grid-cols-[56px_180px_1fr_24px] md:items-center">
                <span className="text-label text-secondary">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-[20px] font-semibold text-primary">{item.title}</h3>
                <p className="text-[14px] leading-6 text-secondary">{item.subtitle || item.description}</p>
                <span className="text-primary transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection tone="navy">
        <SectionHeader tag="FABRIC SERIES" title={config.series_section_title} subtitle={config.series_section_subtitle} linkText={config.series_section_link_text} linkTo={config.series_section_link} light />
        <div className="grid items-stretch gap-x-6 gap-y-10 md:grid-cols-3">
          {['otter', 'rayo', 'kais'].map((slug) => series.find((item) => item.slug === slug)).filter(Boolean).map((item) => {
            const mark = SERIES_LABELS[item!.slug as keyof typeof SERIES_LABELS]
            return <Link key={item!.id} to={`/fabrics?series=${item!.slug}`} className={`group relative flex min-w-0 flex-col ${item!.slug === 'kais' ? 'md:before:absolute md:before:-left-3 md:before:inset-y-0 md:before:w-px md:before:bg-white/20' : ''}`}>
              <div className="aspect-[4/3] overflow-hidden bg-dark">{item!.home_image ? <img src={item!.home_image} alt={item!.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /> : <div className="gonyik-fabric-placeholder h-full w-full" />}</div>
              <div className="mt-5 flex min-h-[64px] items-center justify-between gap-5"><img src={mark.logo} alt={`${mark.label} 系列标识`} className="h-[60px] w-[120px] shrink-0 object-contain object-left" /><p className="text-right text-[11px] tracking-[0.12em] text-white/55">{mark.label}</p></div>
              <p className="mt-2 max-w-[360px] text-[14px] leading-6 text-white/65">{item!.tagline}</p>
              <span className="mt-auto inline-block pt-6 text-[14px] text-white underline underline-offset-4">查看系列 →</span>
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
