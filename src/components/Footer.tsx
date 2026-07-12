import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContactConfig, getFooter, getSocial } from '@/api/client'
import type { ContactConfig, FooterConfig, SocialMedia } from '@/types'

const MATERIAL_LINKS = [
  ['面料数据库', '/fabrics'],
  ['终端装备', '/equipment'],
  ['技术创新', '/pfas-free-innovation'],
]

const SUPPORT_LINKS = [
  ['洗涤与保养', '/services'],
  ['常见问题', '/services'],
  ['联系我们', '/contact'],
]

export default function Footer() {
  const [footer, setFooter] = useState<FooterConfig | null>(null)
  const [contact, setContact] = useState<ContactConfig | null>(null)
  const [socials, setSocials] = useState<SocialMedia[]>([])

  useEffect(() => {
    Promise.all([getFooter(), getContactConfig(), getSocial()]).then(([footerRes, contactRes, socialRes]) => {
      setFooter(footerRes.data.data)
      setContact(contactRes.data.data)
      setSocials(socialRes.data.data || [])
    })
  }, [])

  const visibleSocials = socials.filter((item) => item.account)

  return (
    <footer className="border-t border-border bg-white px-4 text-primary md:px-6">
      <div className="mx-auto w-full max-w-[1760px] px-7 pb-6 pt-14 md:px-12 md:pt-16 lg:px-20">
        <div className="grid gap-12 border-b border-border pb-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="text-label uppercase tracking-[0.18em] text-secondary">GONYIK</p>
            <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.02em]">港翼科技</h2>
            <p className="mt-5 max-w-[520px] text-[14px] leading-7 text-secondary">专注无氟高性能面料与专业防护材料，围绕膜技术、面料复合、功能整理与测试验证，为日常户外及特种专业场景提供材料解决方案。</p>
          </div>

          <FooterColumn title="材料与应用" links={MATERIAL_LINKS} />
          <FooterColumn title="服务与支持" links={SUPPORT_LINKS} />

          <div className="lg:col-span-3">
            <p className="border-b border-border pb-4 text-label uppercase tracking-[0.16em] text-secondary">联系</p>
            <p className="mt-5 text-[13px] text-secondary">材料与合作咨询</p>
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

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="lg:col-span-2">
      <p className="border-b border-border pb-4 text-label uppercase tracking-[0.16em] text-secondary">{title}</p>
      <nav className="mt-5 flex flex-col gap-4">{links.map(([label, href]) => <Link key={label} to={href} className="w-fit text-[14px] hover:underline hover:underline-offset-4">{label}</Link>)}</nav>
    </div>
  )
}
