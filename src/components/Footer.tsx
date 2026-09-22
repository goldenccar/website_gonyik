import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Settings, Shield, X } from 'lucide-react'
import { useSiteLocale } from '@/i18n/SiteLocale'
import type { SocialMedia } from '@/types'
import { InlineMarkup } from './MarkupParser'
import '@/styles/footer.css'

const SOCIAL_LABELS: Record<string, string> = { wechat: '微信', xiaohongshu: '小红书', douyin: '抖音' }

export default function Footer() {
  const { path: localePath, bootstrap, t } = useSiteLocale()
  const { footer_config: footer, contact_config: contact, site_config: brand } = bootstrap
  // Reuse the menu's CMS label and visibility for the database entry.
  const links = (bootstrap.navigation || []).flatMap(item => [item, ...(item.mega_menu || [])
    .flatMap(group => group.items || []).filter(link => link.link === '/fabrics/catalog')])
    .filter((item, index, items) => items.findIndex(other => other.link === item.link) === index)
  const socials = (bootstrap.socials || []).filter(item => item.account || item.qrcode_url)

  return <footer className="site-footer">
    <div className="site-footer-frame">
      <div className="site-footer-main">
        <div className="site-footer-identity">
          <Link className="site-footer-brand" to={localePath('/')} aria-label={t('港翼科技首页')}>
            {brand.logo_url && <img src={brand.logo_url} alt="" width={32} height={32} loading="lazy" decoding="async" />}
            {brand.logo_text && <span><InlineMarkup text={brand.logo_text} /></span>}
          </Link>
          <div className="site-footer-contact">
            {contact?.email && <a className="site-footer-email" href={`mailto:${contact.email}`}>{contact.email}<ArrowUpRight size={19} aria-hidden="true" /></a>}
            {socials.length > 0 && <div className="site-footer-socials">{socials.map(item => <SocialLink key={item.id} item={item} />)}</div>}
          </div>
        </div>
        <nav className="site-footer-links">
          {links.map(item => <Link key={item.link} to={localePath(item.link)}><span><InlineMarkup text={item.label} /></span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}
        </nav>
      </div>
      <div className="site-footer-legal">
        <span><InlineMarkup text={footer?.copyright} /></span>
        <div className="site-footer-legal-links">
          <Link to={localePath(footer?.privacy_policy_link || '/privacy-policy')}><InlineMarkup text="隐私政策" /></Link>
          {footer?.icp_number && <a href={footer.icp_link || 'https://beian.miit.gov.cn/'} lang="zh-CN" translate="no" target="_blank" rel="noreferrer">{footer.icp_number}</a>}
          {footer?.police_number && <a href={footer.police_link || 'https://beian.mps.gov.cn/'} lang="zh-CN" translate="no" target="_blank" rel="noreferrer" className="site-footer-police">
            {footer.police_badge_url ? <img src={footer.police_badge_url} alt="" width={15} height={15} loading="lazy" decoding="async" /> : <Shield size={14} aria-hidden="true" />}
            <span>{footer.police_number}</span>
          </a>}
        </div>
        <Link className="site-footer-admin" to="/admin" aria-label={t('进入 CMS')} title={t('进入 CMS')}><Settings size={16} aria-hidden="true" /></Link>
      </div>
    </div>
  </footer>
}

function SocialLink({ item }: { item: SocialMedia }) {
  const { t } = useSiteLocale()
  const dialog = useRef<HTMLDialogElement>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const label = t(SOCIAL_LABELS[item.platform] || item.platform)
  useEffect(() => {
    if (!previewOpen) return
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setPreviewOpen(false) }
    window.addEventListener('keydown', dismiss)
    return () => window.removeEventListener('keydown', dismiss)
  }, [previewOpen])
  return <div className="footer-social" onPointerEnter={event => { if (event.pointerType === 'mouse') setPreviewOpen(true) }} onPointerLeave={() => setPreviewOpen(false)}>
    <button type="button" aria-haspopup="dialog" aria-label={`${label} ${t('账号')}`} onClick={() => { setPreviewOpen(false); dialog.current?.showModal() }}>{label}</button>
    {previewOpen && <div className="footer-social-preview" aria-hidden="true">
      {item.qrcode_url && <img src={item.qrcode_url} alt="" decoding="async" />}
      {item.account && <p>{item.account}</p>}
    </div>}
    <dialog ref={dialog} className="footer-social-dialog" aria-label={`${label} ${t('账号')}`} onClick={event => {
      if (event.target !== event.currentTarget) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close()
    }}>
      <div className="footer-social-heading"><h2>{label}</h2><button type="button" aria-label={`${t('收起')} ${label}`} onClick={() => dialog.current?.close()}><X size={22} aria-hidden="true" /></button></div>
      {item.qrcode_url && <img src={item.qrcode_url} alt={`${label} ${t('二维码')}`} loading="lazy" decoding="async" />}
      {item.account && <p>{item.account}</p>}
    </dialog>
  </div>
}
