import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContactConfig, getFooter, getNavigation, getSocial } from '@/api/client'
import type { ContactConfig, FooterConfig, NavItem, SocialMedia } from '@/types'

export default function Footer() {
  const [footer, setFooter] = useState<FooterConfig | null>(null)
  const [contact, setContact] = useState<ContactConfig | null>(null)
  const [socials, setSocials] = useState<SocialMedia[]>([])
  const [navigation, setNavigation] = useState<NavItem[]>([])

  useEffect(() => {
    Promise.all([getFooter(), getContactConfig(), getSocial(), getNavigation()]).then(([footerRes, contactRes, socialRes, navigationRes]) => {
      setFooter(footerRes.data.data)
      setContact(contactRes.data.data)
      setSocials(socialRes.data.data || [])
      setNavigation(navigationRes.data.data || [])
    })
  }, [])

  const visibleSocials = socials.filter((item) => item.account)

  return (
    <footer className="border-t border-border bg-white px-4 text-primary md:px-6">
      <div className="mx-auto w-full max-w-[1760px] px-7 pb-6 pt-14 md:px-12 md:pt-16 lg:px-20">
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
            {visibleSocials.length > 0 && <div className="mt-7 flex flex-wrap gap-4">{visibleSocials.map((item) => <span key={item.id} className="text-[12px] uppercase tracking-[0.12em] text-secondary">{item.platform}</span>)}</div>}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[11px] leading-5 text-secondary md:flex-row md:items-center md:justify-between">
          <span>{footer?.copyright || '© 2026 港翼科技 GONYIK 版权所有'}</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to={footer?.privacy_policy_link || '/privacy-policy'} className="hover:text-primary">隐私政策</Link>
            {footer?.icp_number && <a href={footer.icp_link || 'https://beian.miit.gov.cn/'} target="_blank" rel="noreferrer" className="hover:text-primary">{footer.icp_number}</a>}
            {footer?.police_number && <a href={footer.police_link || 'https://beian.mps.gov.cn/'} target="_blank" rel="noreferrer" className="hover:text-primary">{footer.police_number}</a>}
          </div>
        </div>
      </div>
    </footer>
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
