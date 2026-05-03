import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'

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

export default function SampleRequest() {
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
      <div className="bg-darker flex-1 flex flex-col">
        <div className="max-w-[600px] mx-auto px-6 lg:px-12 py-20 text-center">
          <CheckCircle size={48} className="text-accentWarm mx-auto mb-6" />
          <h1 className="text-h3 text-white mb-4">申请已提交</h1>
          <p className="text-body text-accent mb-8">
            我们会在 1-2 个工作日内联系您，确认样品需求后寄出。
          </p>
          <Link to="/fabrics" className="inline-block px-6 py-3 bg-white text-primary text-[13px] font-medium hover:bg-bg transition-colors">
            返回面料数据库
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-darker flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8">
          <Link to="/fabrics" className="flex items-center gap-2 text-accent hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} />
            <span className="text-[13px]">返回面料数据库</span>
          </Link>
          <h1 className="text-[28px] md:text-[36px] font-bold text-white leading-tight">申请面料样品</h1>
          <p className="text-[14px] text-accent mt-2">填写以下信息，我们会尽快与您联系</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-12 w-full">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Row 1: Company + Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-2">公司名称 *</label>
              <input
                required
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-2">联系人姓名 *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Phone + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-2">联系电话 *</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-2">邮箱 *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Field */}
          <div>
            <label className="block text-[12px] text-secondary uppercase mb-2">应用领域</label>
            <div className="flex flex-wrap gap-2">
              {FIELD_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, field: opt })}
                  className={`px-4 py-2 text-[13px] border transition-colors ${
                    form.field === opt
                      ? 'bg-white text-primary border-white'
                      : 'bg-white/5 text-accent border-borderDark hover:border-white/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Series */}
          <div>
            <label className="block text-[12px] text-secondary uppercase mb-2">感兴趣的系列（可多选）</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERIES_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleSeries(opt.value)}
                  className={`text-left px-4 py-3 text-[13px] border transition-colors ${
                    form.series.includes(opt.value)
                      ? 'bg-white text-primary border-white'
                      : 'bg-white/5 text-accent border-borderDark hover:border-white/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Volume */}
          <div>
            <label className="block text-[12px] text-secondary uppercase mb-2">预计用量（选填）</label>
            <input
              type="text"
              value={form.volume}
              onChange={(e) => setForm({ ...form, volume: e.target.value })}
              placeholder="例如：每月 5000 米"
              className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none placeholder:text-muted"
            />
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-[12px] text-secondary uppercase mb-2">项目描述（选填）</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="简要描述您的产品需求和预期性能..."
              className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none placeholder:text-muted"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-white text-primary px-6 py-3 text-[14px] font-medium hover:bg-bg transition-colors"
            >
              <Send size={16} />
              提交申请
            </button>
            <p className="text-[12px] text-muted mt-3">提交后我们会在 1-2 个工作日内联系您</p>
          </div>
        </form>
      </div>
    </div>
  )
}
