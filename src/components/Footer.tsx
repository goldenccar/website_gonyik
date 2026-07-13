import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { getContactConfig, getFooter, getNavigation, getSocial } from '@/api/client'
import type { ContactConfig, FooterConfig, NavItem, SocialMedia } from '@/types'

const SOCIAL_LABELS: Record<string, string> = {
  wechat: '微信',
  xiaohongshu: '小红书',
  douyin: '抖音',
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const [footer, setFooter] = useState<FooterConfig | null>(null)
  const [contact, setContact] = useState<ContactConfig | null>(null)
  const [socials, setSocials] = useState<SocialMedia[]>([])
  const [navigation, setNavigation] = useState<NavItem[]>([])

  useEffect(() => {
    let cancelled = false
    const loadFooterData = () => {
      Promise.all([getFooter(), getContactConfig(), getSocial(), getNavigation()]).then(([footerRes, contactRes, socialRes, navigationRes]) => {
        if (cancelled) return
        setFooter(footerRes.data.data)
        setContact(contactRes.data.data)
        setSocials(socialRes.data.data || [])
        setNavigation(navigationRes.data.data || [])
      })
    }

    const element = footerRef.current
    if (!element || !('IntersectionObserver' in window)) {
      loadFooterData()
      return () => { cancelled = true }
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      loadFooterData()
    }, { rootMargin: '300px' })

    observer.observe(element)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  const visibleSocials = socials.filter((item) => item.account || item.qrcode_url)

  return (
    <footer ref={footerRef} className="border-t border-border bg-white px-4 text-primary md:px-6">
      <div className="mx-auto w-full max-w-[1760px] px-7 pb-6 pt-14 md:px-12 md:pt-16 lg:px-16">
        <div className="grid gap-12 border-b border-border pb-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="text-label uppercase tracking-[0.18em] text-secondary">{footer?.brand_tag}</p>
            <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.02em]">{footer?.brand_title}</h2>
            <p className="mt-5 max-w-[520px] text-[14px] leading-7 text-secondary">{footer?.brand_description}</p>
          </div>

          <FooterColumn title={footer?.material_title || '材料与应用'} links={navigation.slice(0, 3)} />
          <FooterColumn title={footer?.support_title || '服务与支持'} links={navigation.slice(3)} />

          <div className="lg:col-span-3">
            <p className="border-b border-border pb-4 text-label uppercase tracking-[0.16em] text-secondary">{footer?.contact_title}</p>
            <p className="mt-5 text-[13px] text-secondary">{footer?.contact_subtitle}</p>
            {contact?.email && <a href={`mailto:${contact.email}`} className="mt-2 block text-[15px] underline decoration-border underline-offset-4 hover:decoration-primary">{contact.email}</a>}
            {visibleSocials.length > 0 && <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">{visibleSocials.map((item) => <SocialLink key={item.id} item={item} />)}</div>}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[11px] leading-5 text-secondary md:flex-row md:items-center md:justify-between">
          <span>{footer?.copyright || '© 2026 港翼科技 GONYIK 版权所有'}</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to={footer?.privacy_policy_link || '/privacy-policy'} className="hover:text-primary">隐私政策</Link>
            {footer?.icp_number && <a href={footer.icp_link || 'https://beian.miit.gov.cn/'} target="_blank" rel="noreferrer" className="hover:text-primary">{footer.icp_number}</a>}
            {footer?.police_number && <a href={footer.police_link || 'https://beian.mps.gov.cn/'} target="_blank" rel="noreferrer" className="hover:text-primary">{footer.police_number}</a>}
            <Link to="/admin" aria-label="进入 CMS" title="进入 CMS" className="ml-1 inline-flex h-7 w-7 items-center justify-center border-l border-border pl-3 text-secondary hover:text-primary">
              <Settings size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ item }: { item: SocialMedia }) {
  const label = SOCIAL_LABELS[item.platform] || item.platform

  return (
    <span className="group relative inline-flex">
      <button type="button" className="text-[12px] tracking-[0.08em] text-secondary hover:text-primary focus:outline-none focus-visible:text-primary" aria-label={`查看${label}账号`}>
        {label}
      </button>
      <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-3 hidden w-[168px] border border-border bg-white p-3 text-center shadow-lg group-hover:block group-focus-within:block">
        {item.qrcode_url && <img src={item.qrcode_url} alt={`${label}二维码`} loading="lazy" decoding="async" className="mx-auto h-[136px] w-[136px] object-contain" />}
        {item.account && <span className={`${item.qrcode_url ? 'mt-2' : ''} block break-words text-[12px] leading-5 text-primary`}>{item.account}</span>}
      </span>
    </span>
  )
}

function FooterColumn({ title, links }: { title: string; links: NavItem[] }) {
  return (
    <div className="lg:col-span-2">
      <p className="border-b border-border pb-4 text-label uppercase tracking-[0.16em] text-secondary">{title}</p>
      <nav className="mt-5 flex flex-col gap-4">{links.map((item) => <Link key={item.id} to={item.link} className="w-fit text-[14px] hover:underline hover:underline-offset-4">{item.label}</Link>)}</nav>
    </div>
  )
}
