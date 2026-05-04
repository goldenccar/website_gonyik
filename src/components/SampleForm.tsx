import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

const SERIES_OPTIONS = [
  { value: 'ottex', label: 'Ottex — 全流程无氟防水透气' },
  { value: 'kais-edge', label: 'Kais-Edge — 防切割抗穿刺' },
  { value: 'kais-ignis', label: 'Kais-Ignis — 阻燃隔热' },
  { value: 'rayo', label: 'Rayo — 原生防晒导湿' },
  { value: 'tread', label: 'Tread — 鞋材耐磨' },
  { value: 'unsure', label: '不确定，需要技术推荐' },
]

const FIELD_OPTIONS = [
  '户外服装',
  '专业工装',
  '战术/防护装备',
  '运动鞋材',
  '运动休闲服装',
  '其他',
]

export default function SampleForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    field: '',
    series: [] as string[],
    volume: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const toggleSeries = (value: string) => {
    setForm((prev) => ({
      ...prev,
      series: prev.series.includes(value)
        ? prev.series.filter((s) => s !== value)
        : [...prev.series, value],
    }))
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <CheckCircle size={48} className="text-primary mx-auto mb-6" />
        <h3 className="text-h4 text-primary mb-4">申请已提交</h3>
        <p className="text-body text-muted mb-8">
          我们会在 1-2 个工作日内联系您，确认样品需求后寄出。
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ company: '', name: '', phone: '', email: '', field: '', series: [], volume: '', description: '' }) }}
          className="inline-block px-6 py-3 bg-primary text-white text-[14px] font-medium hover:bg-darker transition-colors"
        >
          继续申请
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[13px] text-secondary mb-2">公司名称 *</label>
          <input
            required
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[13px] text-secondary mb-2">联系人姓名 *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[13px] text-secondary mb-2">联系电话 *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[13px] text-secondary mb-2">邮箱 *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] text-secondary mb-2">应用领域</label>
        <div className="flex flex-wrap gap-2">
          {FIELD_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setForm({ ...form, field: opt })}
              className={`px-4 py-2 text-[13px] border transition-colors ${
                form.field === opt
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-primary border-border hover:border-primary'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] text-secondary mb-2">感兴趣的系列（可多选）</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SERIES_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleSeries(opt.value)}
              className={`text-left px-4 py-3 text-[13px] border transition-colors ${
                form.series.includes(opt.value)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-primary border-border hover:border-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] text-secondary mb-2">预计用量（选填）</label>
        <input
          type="text"
          value={form.volume}
          onChange={(e) => setForm({ ...form, volume: e.target.value })}
          placeholder="例如：每月 5000 米"
          className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted"
        />
      </div>

      <div>
        <label className="block text-[13px] text-secondary mb-2">项目描述（选填）</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          placeholder="简要描述您的产品需求和预期性能..."
          className="w-full px-4 py-3 text-[14px] bg-bg border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-[14px] font-medium hover:bg-darker transition-colors"
        >
          <Send size={16} />
          提交申请
        </button>
        <p className="text-[12px] text-muted mt-3">提交后我们会在 1-2 个工作日内联系您</p>
      </div>
    </form>
  )
}
