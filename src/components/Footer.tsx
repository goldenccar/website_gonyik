import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Shield } from 'lucide-react'
import { getContactConfig, getFooter, getPublicBootstrap, getSocial } from '@/api/client'
import type { ContactConfig, FooterConfig, NavItem, SocialMedia } from '@/types'
import { InlineMarkup } from './MarkupParser'

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
      Promise.all([getFooter(), getContactConfig(), getSocial(), getPublicBootstrap()]).then(([footerRes, contactRes, socialRes, bootstrapRes]) => {
        if (cancelled) return
        setFooter(footerRes.data.data)
        setContact(contactRes.data.data)
        setSocials(socialRes.data.data || [])
        setNavigation(bootstrapRes.data.navigation || [])
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
      <div className="mx-auto w-full max-w-[1760px] px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 md:px-12 md:pb-6 md:pt-16 lg:px-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 border-b border-border pb-10 md:gap-12 md:pb-14 lg:grid-cols-12 lg:gap-10">
          <div className="col-span-2 lg:col-span-5">
            <p className="label-en text-secondary"><InlineMarkup text={footer?.brand_tag} /></p>
            <h2 className="type-module-title mt-3 md:mt-5"><InlineMarkup text={footer?.brand_title} /></h2>
            <p className="mt-5 hidden max-w-[520px] text-[14px] leading-7 text-secondary md:block"><InlineMarkup text={footer?.brand_description} /></p>
          </div>

          <FooterColumn title={footer?.material_title || '材料与应用'} links={navigation.slice(0, 3)} />
          <FooterColumn title={footer?.support_title || '服务与支持'} links={navigation.slice(3)} />

          <div className="col-span-2 lg:col-span-3">
            <p className="label-zh border-b border-border pb-3 text-secondary md:pb-4"><InlineMarkup text={footer?.contact_title} /></p>
            <p className="mt-4 text-[13px] text-secondary md:mt-5"><InlineMarkup text={footer?.contact_subtitle} /></p>
            {contact?.email && <a href={`mailto:${contact.email}`} className="mt-2 block text-[15px] underline decoration-border underline-offset-4 hover:decoration-primary">{contact.email}</a>}
            {visibleSocials.length > 0 && <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 md:mt-7">{visibleSocials.map((item) => <SocialLink key={item.id} item={item} />)}</div>}
          </div>
        </div>

        <div className="pt-6 text-[12px] leading-5 text-secondary md:flex md:items-center md:justify-between">
          <span className="block"><InlineMarkup text={footer?.copyright || '© 2026 港翼科技 GONYIK 版权所有'} /></span>
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_28px] items-end gap-x-4 md:mt-0 md:flex md:items-center md:gap-0">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link to={footer?.privacy_policy_link || '/privacy-policy'} className="hover:text-primary">隐私政策</Link>
              {footer?.icp_number && <a href={footer.icp_link || 'https://beian.miit.gov.cn/'} target="_blank" rel="noreferrer" className="hover:text-primary">{footer.icp_number}</a>}
              {footer?.police_number && (
                <a
                  href={footer.police_link || 'https://beian.mps.gov.cn/'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-primary"
                >
                  {footer.police_badge_url ? (
                    <img src={footer.police_badge_url} alt="" width={17} height={17} loading="lazy" decoding="async" className="h-[17px] w-[17px] shrink-0 object-contain" />
                  ) : (
                    <Shield size={14} strokeWidth={1.6} aria-hidden="true" className="shrink-0" />
                  )}
                  <span>{footer.police_number}</span>
                </a>
              )}
            </div>
            <Link to="/admin" aria-label="进入 CMS" title="进入 CMS" className="inline-flex h-7 w-7 items-center justify-center text-secondary hover:text-primary md:ml-4 md:w-11 md:border-l md:border-border md:pl-4">
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
      <button type="button" className="label-zh text-secondary hover:text-primary focus:outline-none focus-visible:text-primary" aria-label={`查看${label}账号`}>
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
    <div className="min-w-0 lg:col-span-2">
      <p className="label-zh border-b border-border pb-3 text-secondary md:pb-4"><InlineMarkup text={title} /></p>
      <nav className="mt-4 flex flex-col gap-3 md:mt-5 md:gap-4">{links.map((item) => <Link key={item.id} to={item.link} className="w-fit text-[13px] hover:underline hover:underline-offset-4 md:text-[14px]"><InlineMarkup text={item.label} /></Link>)}</nav>
    </div>
  )
}
