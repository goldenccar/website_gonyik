import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, MapPin, Phone, CheckCircle } from 'lucide-react'
import { getPageConfig, getContactConfig, getInquirySubjects, submitContactForm } from '@/api/client'
import type { PageConfig, ContactConfig, InquirySubject } from '@/types'

export default function Contact() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [contactConfig, setContactConfig] = useState<ContactConfig | null>(null)
  const [inquirySubjects, setInquirySubjects] = useState<InquirySubject[]>([])
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    getPageConfig('contact').then((res) => setPageConfig(res.data.data))
    getContactConfig().then((res) => setContactConfig(res.data.data))
    getInquirySubjects().then((res) => setInquirySubjects(res.data.data || []))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = '请输入姓名'
    if (!form.email.trim()) e.email = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '邮箱格式不正确'
    if (!form.subject.trim()) e.subject = '请输入主题'
    if (!form.message.trim()) e.message = '请输入留言内容'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitContactForm(form)
      setSubmitted(true)
    } catch {
      setErrors({ submit: '提交失败，请稍后重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-darker px-6 lg:px-12 pt-[60px]">
        <div className="max-w-[1440px] mx-auto w-full py-8">
          <p className="text-label text-accent uppercase mb-4">{pageConfig?.page_tag || 'CONTACT US'}</p>
          <h1 className="text-h1 text-white mb-4">{pageConfig?.page_title || '联系我们'}</h1>
          <p className="text-body text-accent max-w-[600px]">
            {pageConfig?.page_subtitle || '有任何面料需求或合作意向，欢迎与我们取得联系'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-bg px-6 lg:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          {/* Contact Info Bar */}
          <div className="bg-white p-6 sm:p-8 mb-6 flex flex-wrap items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-secondary shrink-0" />
              <div>
                <p className="text-[12px] text-muted mb-0.5">邮箱</p>
                <a href={`mailto:${contactConfig?.email || 'contact@gangyi.tech'}`} className="text-[14px] text-primary hover:underline">{contactConfig?.email || 'contact@gangyi.tech'}</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-secondary shrink-0" />
              <div>
                <p className="text-[12px] text-muted mb-0.5">电话</p>
                <p className="text-[14px] text-primary">{contactConfig?.phone || '400-XXX-XXXX'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-secondary shrink-0" />
              <div>
                <p className="text-[12px] text-muted mb-0.5">地址</p>
                <p className="text-[14px] text-primary">{contactConfig?.address || '上海市'}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 text-center"
            >
              <CheckCircle size={48} className="mx-auto text-primary mb-4" />
              <h3 className="text-h4 text-primary mb-2">提交成功</h3>
              <p className="text-body text-muted mb-6">感谢您的留言，我们会尽快回复您。</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', company: '', email: '', phone: '', subject: '', message: '' }) }}
                className="px-6 py-3 bg-primary text-white text-[14px] font-medium hover:bg-darker transition-colors"
              >
                继续留言
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] text-secondary mb-2">姓名 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="您的姓名"
                  />
                  {errors.name && <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[13px] text-secondary mb-2">公司名称</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="您的公司（选填）"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-secondary mb-2">邮箱 *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="example@company.com"
                  />
                  {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-[13px] text-secondary mb-2">电话</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="您的联系电话（选填）"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-[13px] text-secondary mb-2">咨询主题 *</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="">请选择咨询主题</option>
                  {inquirySubjects.map((s) => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                </select>
                {errors.subject && <p className="text-[12px] text-red-500 mt-1">{errors.subject}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-[13px] text-secondary mb-2">留言内容 *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="请详细描述您的需求..."
                />
                {errors.message && <p className="text-[12px] text-red-500 mt-1">{errors.message}</p>}
              </div>
              <div className="flex items-center gap-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-[14px] font-medium hover:bg-darker transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  {submitting ? '提交中...' : '提交留言'}
                </button>
                <p className="text-[13px] text-muted">
                  {contactConfig?.response_text || '提交表单后，我们的面料顾问将在 3 个工作日内与您取得联系'}
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
