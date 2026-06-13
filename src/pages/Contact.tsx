import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, MapPin, Phone, CheckCircle, ArrowRight, Factory, Shirt, Store, FlaskConical } from 'lucide-react'
import { getPageConfig, getContactConfig, getInquirySubjects, submitContactForm } from '@/api/client'
import PageHero from '@/components/PageHero'
import type { PageConfig, ContactConfig, InquirySubject } from '@/types'

const ECOSYSTEM_TYPES = [
  {
    key: 'supplier',
    icon: Factory,
    title: '上游材料供应商',
    desc: '提供环保表面处理技术与特种纱线',
  },
  {
    key: 'brand',
    icon: Shirt,
    title: '终端成衣品牌',
    desc: '获取 GONYIK 成分品牌授权',
  },
  {
    key: 'distributor',
    icon: Store,
    title: '经销与渠道伙伴',
    desc: '面料产品代理与分销合作',
  },
  {
    key: 'research',
    icon: FlaskConical,
    title: '研发合作机构',
    desc: '联合技术研发与认证体系搭建',
  },
]

export default function Contact() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [contactConfig, setContactConfig] = useState<ContactConfig | null>(null)
  const [inquirySubjects, setInquirySubjects] = useState<InquirySubject[]>([])
  const [form, setForm] = useState({ name: '', company: '', position: '', email: '', phone: '', subject: '', cooperation_type: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPageConfig('contact').then((res) => setPageConfig(res.data.data))
    getContactConfig().then((res) => setContactConfig(res.data.data))
    getInquirySubjects().then((res) => setInquirySubjects(res.data.data || []))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = '请输入姓名'
    if (!form.company.trim()) e.company = '请输入公司/机构名称'
    if (!form.email.trim()) e.email = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '邮箱格式不正确'
    if (!form.subject.trim()) e.subject = '请选择联系目的'

    if (!form.message.trim()) e.message = '请输入留言内容'
    else if (form.message.trim().length < 10) e.message = '留言内容至少需要 10 个字'
    else if (form.message.trim().length > 500) e.message = '留言内容不能超过 500 字'
    setErrors(e)
    return Object.keys(e).length === 0
  }

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

  const handleCardClick = (title: string) => {
    setForm((prev) => ({ ...prev, subject: title, cooperation_type: title }))
    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubjectChange = (value: string) => {
    const isEcosystem = ECOSYSTEM_TYPES.some((t) => t.title === value)
    setForm((prev) => ({
      ...prev,
      subject: value,
      cooperation_type: isEcosystem ? value : '',
    }))
  }

  return (
    <div>
      <PageHero
        tag={pageConfig?.page_tag || 'CONTACT US'}
        title={pageConfig?.page_title || '联系我们'}
        subtitle={pageConfig?.page_subtitle || '有任何面料需求或合作意向，欢迎与我们取得联系'}
      />

      {/* Ecosystem Program + Form */}
      <section className="bg-bg px-6 lg:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Left: Ecosystem Program (2 cols) */}
            <div className="lg:col-span-2 bg-darker p-8 sm:p-10">
              <p className="text-label text-accent uppercase mb-4 tracking-widest text-[11px]">ECOSYSTEM PROGRAM</p>
              <h2 className="text-h3 text-white mb-8">生态合作计划</h2>
              <div className="space-y-3">
                {ECOSYSTEM_TYPES.map((type) => {
                  const Icon = type.icon
                  const isActive = form.subject === type.title
                  return (
                    <button
                      key={type.key}
                      onClick={() => handleCardClick(type.title)}
                      className={`w-full text-left p-4 border transition-all group ${
                        isActive
                          ? 'border-white/25 bg-white/10'
                          : 'border-white/[0.08] hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon size={20} className="text-accent shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] text-white font-medium mb-1">{type.title}</h4>
                          <p className="text-[13px] text-accent">{type.desc}</p>
                        </div>
                        <ArrowRight size={14} className={`text-accent shrink-0 mt-1 transition-all ${
                          isActive ? 'translate-x-1 text-white' : 'group-hover:translate-x-0.5'
                        }`} />
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-[12px] text-accent mt-6 leading-relaxed">
                点击上方合作类型，表单将自动选择对应选项。您也可以在右侧表单中直接填写并提交。
              </p>
            </div>

            {/* Right: Form (3 cols) */}
            <div ref={formRef} className="lg:col-span-3 bg-white p-8 sm:p-10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <CheckCircle size={48} className="mx-auto text-primary mb-4" />
                  <h3 className="text-h4 text-primary mb-2">提交成功</h3>
                  <p className="text-body text-muted mb-6">感谢您的留言，我们会尽快回复您。</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', company: '', position: '', email: '', phone: '', subject: '', cooperation_type: '', message: '' }) }}
                    className="px-6 py-3 bg-primary text-white text-[14px] font-medium hover:bg-darker transition-colors"
                  >
                    继续留言
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-[16px] font-bold text-primary mb-6">合作咨询表单</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[13px] text-secondary mb-1.5">姓名 *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 text-[14px] bg-bg border border-border text-primary focus:border-primary focus:outline-none transition-colors placeholder:text-muted"
                        placeholder="您的姓名"
                      />
                      {errors.name && <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] text-secondary mb-1.5">公司 / 机构名称 *</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-4 py-3 text-[14px] bg-bg border border-border text-primary focus:border-primary focus:outline-none transition-colors placeholder:text-muted"
                        placeholder="请填写公司全称"
                      />
                      {errors.company && <p className="text-[12px] text-red-500 mt-1">{errors.company}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] text-secondary mb-1.5">邮箱 *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 text-[14px] bg-bg border border-border text-primary focus:border-primary focus:outline-none transition-colors placeholder:text-muted"
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] text-secondary mb-1.5">职位</label>
                      <input
                        type="text"
                        value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                        className="w-full px-4 py-3 text-[14px] bg-bg border border-border text-primary focus:border-primary focus:outline-none transition-colors placeholder:text-muted"
                        placeholder="您的职位（选填）"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] text-secondary mb-1.5">电话</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 text-[14px] bg-bg border border-border text-primary focus:border-primary focus:outline-none transition-colors placeholder:text-muted"
                        placeholder="您的联系电话（选填）"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] text-secondary mb-1.5">联系目的 *</label>
                      <select
                        value={form.subject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        className="w-full px-4 py-3 text-[14px] bg-bg border border-border text-primary focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-white text-primary">请选择联系目的</option>
                        {inquirySubjects.map((s) => (
                          <option key={s.id} value={s.label} className="bg-white text-primary">{s.label}</option>
                        ))}
                      </select>
                      {errors.subject && <p className="text-[12px] text-red-500 mt-1">{errors.subject}</p>}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[13px] text-secondary mb-1.5">留言 / 补充说明 *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      maxLength={500}
                      className="w-full px-4 py-3 text-[14px] bg-bg border border-border text-primary focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-muted"
                      placeholder="请描述您的合作背景与期望..."
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.message && <p className="text-[12px] text-red-500">{errors.message}</p>}
                      <p className="text-[12px] text-muted ml-auto">{form.message.length} / 500</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-[14px] font-medium hover:bg-darker transition-colors disabled:opacity-50"
                    >
                      <Send size={16} />
                      {submitting ? '提交中...' : '提交申请'}
                    </button>
                    <p className="text-[13px] text-muted">
                      {contactConfig?.response_text || '提交表单后，我们的面料顾问将在 3 个工作日内与您取得联系'}
                    </p>
                  </div>
                  {errors.submit && <p className="text-[12px] text-red-500 mt-3">{errors.submit}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Bar */}
      <section className="bg-darker px-6 lg:px-12 pb-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="bg-dark p-6 sm:p-8 flex flex-wrap items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-accent shrink-0" />
              <div>
                <p className="text-[12px] text-accent mb-0.5">邮箱</p>
                <a href={`mailto:${contactConfig?.email || 'contact@gangyi.tech'}`} className="text-[14px] text-white hover:text-accent transition-colors">{contactConfig?.email || 'contact@gangyi.tech'}</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-accent shrink-0" />
              <div>
                <p className="text-[12px] text-accent mb-0.5">电话</p>
                <p className="text-[14px] text-white">{contactConfig?.phone || '400-XXX-XXXX'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-accent shrink-0" />
              <div>
                <p className="text-[12px] text-accent mb-0.5">地址</p>
                <p className="text-[14px] text-white">{contactConfig?.address || '上海市'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
