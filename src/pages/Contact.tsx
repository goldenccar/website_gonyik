import { useEffect, useState } from 'react'
import { getInquirySubjects, getPageConfig, submitContactForm } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { InquirySubject, PageConfig } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'
import { useSiteLocale } from '@/i18n/SiteLocale'
import PublicContentLoader from '@/components/PublicContentLoader'
import { useSearchParams } from 'react-router-dom'

const EMPTY = { name: '', company: '', position: '', email: '', phone: '', subject: '', cooperation_type: '', message: '', source_page: '', product_model: '' }

export default function Contact() {
  const { t, bootstrap } = useSiteLocale()
  const [page, setPage] = useState<PageConfig | null>(null)
  const [subjects, setSubjects] = useState<InquirySubject[]>([])
  const [form, setForm] = useState(EMPTY)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const inquirySku = String(searchParams.get('sku') || '').trim().slice(0, 80)
  const inquirySeries = String(searchParams.get('series') || '').trim().slice(0, 80)
  const inquirySource = String(searchParams.get('source') || '').trim().slice(0, 160)

  useEffect(() => {
    Promise.all([getPageConfig('contact'), getInquirySubjects()]).then(([config, options]) => {
      setPage(config.data.data)
      const nextSubjects = options.data.data || []
      setSubjects(nextSubjects)
      if (inquirySku) {
        const preferred = nextSubjects.find((item: InquirySubject) => /样品|资料|tds|材料/i.test(item.label))
        setForm((current) => ({
          ...current,
          subject: current.subject || preferred?.label || '',
          cooperation_type: current.cooperation_type || preferred?.label || '',
          source_page: inquirySource || '/fabrics',
          product_model: `${inquirySeries ? `${inquirySeries} / ` : ''}${inquirySku}`,
        }))
      }
    }).finally(() => setLoading(false))
  }, [inquirySeries, inquirySku, inquirySource])

  if (loading) return <PublicContentLoader label="正在加载联系信息" />

  const contact = bootstrap.contact_config

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.company.trim() || !form.email.trim() || !form.subject || form.message.trim().length < 10) {
      setMessage('请完整填写姓名、公司、邮箱、咨询方向和至少 10 个字的留言。')
      return
    }
    setSubmitting(true)
    try {
      await submitContactForm(form)
      setForm(EMPTY)
      setMessage('提交成功，我们会按页面公布的联系方式回复。')
    } catch {
      setMessage('提交失败，请稍后重试或直接通过邮箱联系。')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = 'w-full border border-border bg-bg px-3 py-2.5 text-[16px] font-medium text-primary outline-none focus:border-primary sm:text-[14px]'
  return (
    <PageShell>
      <PageHero title={page?.page_title || '合作咨询'} subtitle={page?.page_subtitle || '告诉我们你正在寻找的材料或应用方向，我们会尽快与你联系。'} image={page?.hero_background} imageAlt="港翼科技材料合作" />
      <PageSection className="!py-8 lg:!py-10">
        <div className="grid overflow-hidden lg:grid-cols-12">
          <aside className="bg-darker p-6 text-white lg:col-span-4 lg:p-8">
            <p className="label-en text-white/75">CONTACT</p><h2 className="type-module-title mt-3">{t('材料与合作咨询')}</h2>
            <dl className="mt-8 space-y-5 text-[14px]">{contact?.email && <div><dt className="text-white/75">{t('邮箱')}</dt><dd className="mt-1"><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>}{contact?.phone && <div><dt className="text-white/75">{t('电话')}</dt><dd className="mt-1"><InlineMarkup text={contact.phone} /></dd></div>}{contact?.address && <div><dt className="text-white/75">{t('地址')}</dt><dd className="mt-1"><InlineMarkup text={contact.address} /></dd></div>}</dl>
          </aside>
          <form onSubmit={submit} className="grid gap-3 bg-white p-6 sm:grid-cols-2 lg:col-span-8 lg:p-8">
            {inquirySku && (
              <p className="border-l-2 border-accent bg-bg px-4 py-3 text-[13px] font-medium text-primary sm:col-span-2">
                {t('当前咨询')}：{inquirySeries ? `${inquirySeries} / ` : ''}{inquirySku}
              </p>
            )}
            <label className="grid gap-2 text-[13px] font-medium text-primary">{t('姓名 *')}<input className={fieldClass} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="grid gap-2 text-[13px] font-medium text-primary">{t('公司 *')}<input className={fieldClass} autoComplete="organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
            <label className="grid gap-2 text-[13px] font-medium text-primary">{t('邮箱 *')}<input className={fieldClass} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="grid gap-2 text-[13px] font-medium text-primary">{t('电话或微信')}<input className={fieldClass} autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="grid gap-2 text-[13px] font-medium text-primary sm:col-span-2">{t('咨询方向 *')}<select className={fieldClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, cooperation_type: e.target.value })}><option value="">{t('请选择咨询方向')}</option>{subjects.map((item) => <option key={item.id} value={item.label}>{t(item.label)}</option>)}</select></label>
            <label className="grid gap-2 text-[13px] font-medium text-primary sm:col-span-2">{t('留言 *')}<textarea className={`${fieldClass} resize-none`} rows={4} maxLength={500} placeholder={t('可以简单说明用途、关注的面料系列或产品型号。')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2"><button disabled={submitting} className="bg-dark px-6 py-3 text-[14px] font-medium text-white disabled:opacity-50">{t(submitting ? '提交中…' : '提交咨询')}</button><p className="text-[12px] text-secondary"><InlineMarkup text={message || contact?.response_text} /></p></div>
          </form>
        </div>
      </PageSection>
    </PageShell>
  )
}
