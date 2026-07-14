import { useEffect, useState } from 'react'
import { getContactConfig, getInquirySubjects, getPageConfig, submitContactForm } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { ContactConfig, InquirySubject, PageConfig } from '@/types'
import { InlineMarkup } from '@/components/MarkupParser'

const EMPTY = { name: '', company: '', position: '', email: '', phone: '', subject: '', cooperation_type: '', message: '' }

export default function Contact() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [contact, setContact] = useState<ContactConfig | null>(null)
  const [subjects, setSubjects] = useState<InquirySubject[]>([])
  const [form, setForm] = useState(EMPTY)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getPageConfig('contact'), getContactConfig(), getInquirySubjects()]).then(([config, details, options]) => {
      setPage(config.data.data)
      setContact(details.data.data)
      setSubjects(options.data.data || [])
    })
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.company.trim() || !form.email.trim() || !form.subject || form.message.trim().length < 10) {
      setMessage('请完整填写姓名、公司、邮箱、联系目的和至少 10 个字的需求说明。')
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
      <PageHero variant="detail" tag={page?.page_tag || 'CONTACT US'} title={page?.page_title || '联系我们'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="港翼科技材料合作" />
      <PageSection className="!py-8 lg:!py-10">
        <div className="grid overflow-hidden lg:grid-cols-12">
          <aside className="bg-darker p-6 text-white lg:col-span-4 lg:p-8">
            <p className="label-en text-white/75">CONTACT</p><h2 className="type-module-title mt-3">材料与合作咨询</h2>
            <dl className="mt-8 space-y-5 text-[14px]"><div><dt className="text-white/75">邮箱</dt><dd className="mt-1"><a href={contact?.email ? `mailto:${contact.email}` : undefined}>{contact?.email || '请在后台配置'}</a></dd></div>{contact?.phone && <div><dt className="text-white/75">电话</dt><dd className="mt-1"><InlineMarkup text={contact.phone} /></dd></div>}{contact?.address && <div><dt className="text-white/75">地址</dt><dd className="mt-1"><InlineMarkup text={contact.address} /></dd></div>}</dl>
          </aside>
          <form onSubmit={submit} className="grid gap-3 bg-white p-6 sm:grid-cols-2 lg:col-span-8 lg:p-8">
            <input className={fieldClass} placeholder="姓名 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={fieldClass} placeholder="公司 / 机构 *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className={fieldClass} type="email" placeholder="邮箱 *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={fieldClass} placeholder="电话（选填）" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select className={`${fieldClass} sm:col-span-2`} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, cooperation_type: e.target.value })}><option value="">联系目的 *</option>{subjects.map((item) => <option key={item.id} value={item.label}>{item.label}</option>)}</select>
            <textarea className={`${fieldClass} resize-none sm:col-span-2`} rows={3} maxLength={500} placeholder="需求说明（至少 10 个字）*" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2"><button disabled={submitting} className="bg-dark px-6 py-3 text-[14px] font-medium text-white disabled:opacity-50">{submitting ? '提交中…' : '提交咨询'}</button><p className="text-[12px] text-secondary"><InlineMarkup text={message || contact?.response_text} /></p></div>
          </form>
        </div>
      </PageSection>
    </PageShell>
  )
}
