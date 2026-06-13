import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Home, Layers, Shirt, MapPin, Award } from 'lucide-react'
import api, { getHomeConfig, getFabricSeries, uploadFile } from '@/api/client'
import Dashboard from './Dashboard'

const TABS = [
  { key: 'hero', label: 'Hero', icon: Home },
  { key: 'platform', label: '技术平台', icon: Layers },
  { key: 'series', label: '核心面料', icon: Shirt },
  { key: 'scenarios', label: '应用场景', icon: MapPin },
  { key: 'verification', label: '验证标准', icon: Award },
]

const ICON_OPTIONS = [
  'ShieldCheck',
  'Droplets',
  'Layers',
  'Leaf',
  'Building2',
  'Atom',
  'Hexagon',
  'Shirt',
  'Award',
  'Sun',
  'Backpack',
  'Shield',
  'ArrowRight',
  'Beaker',
  'Microscope',
  'CheckCircle',
  'Circle',
  'Wind',
  'Ban',
  'FlaskConical',
  'Code2',
]

function ensureArray(value: any): any[] {
  return Array.isArray(value) ? value : []
}

export default function AdminHomeEditor() {
  const navigate = useNavigate()
  const [form, setForm] = useState<any>({})
  const [series, setSeries] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('hero')
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  useEffect(() => {
    getHomeConfig().then((res) => setForm(res.data.data || {}))
    getFabricSeries().then((res) => setSeries(res.data.data || []))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/home', form)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleHeroBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.put('/admin/home/background', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setForm({ ...form, hero_background: res.data.url })
  }

  const uploadImageFor = async (path: string, file: File, updater: (url: string) => void) => {
    setUploadingField(path)
    try {
      const res = await uploadFile(file)
      updater(res.data.url)
    } finally {
      setUploadingField(null)
    }
  }

  const updateArrayItem = (key: string, idx: number, patch: any) => {
    const arr = ensureArray(form[key]).map((item: any) => ({ ...item }))
    arr[idx] = { ...arr[idx], ...patch }
    setForm({ ...form, [key]: arr })
  }

  const addArrayItem = (key: string, template: any) => {
    setForm({ ...form, [key]: [...ensureArray(form[key]), template] })
  }

  const removeArrayItem = (key: string, idx: number) => {
    const arr = ensureArray(form[key]).filter((_: any, i: number) => i !== idx)
    setForm({ ...form, [key]: arr })
  }

  const textField = (label: string, key: string, placeholder?: string) => (
    <div className="mb-4">
      <label className="block text-[12px] text-secondary uppercase mb-2">{label}</label>
      <input
        type="text"
        value={form[key] || ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
      />
    </div>
  )

  const textareaField = (label: string, key: string, rows = 3, placeholder?: string) => (
    <div className="mb-4">
      <label className="block text-[12px] text-secondary uppercase mb-2">{label}</label>
      <textarea
        value={form[key] || ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
      />
    </div>
  )

  const iconSelect = (value: string, onChange: (v: string) => void) => (
    <select
      value={value || 'Circle'}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
    >
      {ICON_OPTIONS.map((icon) => (
        <option key={icon} value={icon} className="bg-dark">
          {icon}
        </option>
      ))}
    </select>
  )

  const renderHeroTab = () => (
    <div className="space-y-6">
      {textField('标签', 'hero_tag')}
      {textareaField('主标题', 'hero_title', 3, '使用换行符分隔多行，RPO 会自动高亮')}
      {textareaField('副标题 / Slogan', 'hero_slogan', 3)}

      <div className="mb-6">
        <label className="block text-[12px] text-secondary uppercase mb-2">背景媒体</label>
        {form.hero_background && /\.(mp4|webm|mov)(\?.*)?$/i.test(form.hero_background) ? (
          <video src={form.hero_background} className="w-full max-h-[200px] object-cover mb-3" autoPlay muted loop playsInline />
        ) : form.hero_background ? (
          <img src={form.hero_background} alt="Hero" className="w-full max-h-[200px] object-cover mb-3" />
        ) : null}
        <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleHeroBackgroundUpload} className="text-white text-[13px]" />
        <p className="text-[12px] text-muted mt-2">支持 JPG、PNG、GIF、WebP、MP4、WebM、MOV</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {textField('主按钮文案', 'primary_btn_text')}
        {textField('主按钮链接', 'primary_btn_link')}
        {textField('次按钮文案', 'secondary_btn_text')}
        {textField('次按钮链接', 'secondary_btn_link')}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-[12px] text-secondary uppercase">底部图标特性</label>
          <button
            onClick={() => addArrayItem('hero_features', { icon: 'Circle', title: '', subtitle: '' })}
            className="text-[12px] text-accentWarm hover:text-white"
          >
            + 新增
          </button>
        </div>
        <div className="space-y-3">
          {ensureArray(form.hero_features).map((item: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-start bg-dark p-3 border border-white/5">
              <div className="col-span-3">
                <label className="block text-[11px] text-muted mb-1">图标</label>
                {iconSelect(item.icon, (v) => updateArrayItem('hero_features', idx, { icon: v }))}
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] text-muted mb-1">标题</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateArrayItem('hero_features', idx, { title: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] text-muted mb-1">副标题</label>
                <input
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => updateArrayItem('hero_features', idx, { subtitle: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div className="col-span-1 pt-6">
                <button onClick={() => removeArrayItem('hero_features', idx)} className="text-error hover:text-white">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPlatformTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {textField('区块标题', 'platform_section_title')}
        {textField('链接文案', 'platform_section_link_text')}
        {textField('链接地址', 'platform_section_link')}
      </div>
      {textareaField('区块副标题', 'platform_section_subtitle')}

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-[12px] text-secondary uppercase">平台卡片</label>
          <button
            onClick={() =>
              addArrayItem('platform_cards', {
                icon: 'Circle',
                title: '',
                subtitle: '',
                description: '',
                footer: '',
              })
            }
            className="text-[12px] text-accentWarm hover:text-white"
          >
            + 新增卡片
          </button>
        </div>
        <div className="space-y-4">
          {ensureArray(form.platform_cards).map((item: any, idx: number) => (
            <div key={idx} className="bg-dark p-4 border border-white/5">
              <div className="grid grid-cols-12 gap-3 items-start mb-3">
                <div className="col-span-2">
                  <label className="block text-[11px] text-muted mb-1">图标</label>
                  {iconSelect(item.icon, (v) => updateArrayItem('platform_cards', idx, { icon: v }))}
                </div>
                <div className="col-span-5">
                  <label className="block text-[11px] text-muted mb-1">标题</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateArrayItem('platform_cards', idx, { title: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-[11px] text-muted mb-1">底部标签</label>
                  <input
                    type="text"
                    value={item.footer || ''}
                    onChange={(e) => updateArrayItem('platform_cards', idx, { footer: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div className="col-span-1 pt-6 text-right">
                  <button onClick={() => removeArrayItem('platform_cards', idx)} className="text-error hover:text-white">
                    ×
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-[11px] text-muted mb-1">副标题</label>
                <input
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => updateArrayItem('platform_cards', idx, { subtitle: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted mb-1">描述（换行分隔）</label>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateArrayItem('platform_cards', idx, { description: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSeriesTab = () => {
    const displaySeries = [...series].sort((a, b) => a.order_index - b.order_index).slice(0, 3)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {textField('区块标题', 'series_section_title')}
          {textField('链接文案', 'series_section_link_text')}
          {textField('链接地址', 'series_section_link')}
        </div>
        {textareaField('区块副标题', 'series_section_subtitle')}

        <div className="bg-dark border border-white/5 p-4">
          <p className="text-[13px] text-white mb-2">当前首页展示前 3 个系列（按排序）</p>
          <p className="text-[12px] text-muted mb-4">请在“面料系列管理”上传每个系列的“首页卡片背景图”。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displaySeries.map((s) => (
              <div key={s.id} className="bg-white/5 p-3 border border-white/5">
                <p className="text-[14px] text-white font-medium mb-1">{s.name}</p>
                {s.home_image ? (
                  <img src={s.home_image} alt={s.name} className="w-full h-24 object-cover mb-2" />
                ) : (
                  <div className="w-full h-24 bg-white/5 flex items-center justify-center text-[12px] text-muted mb-2">未上传首页背景图</div>
                )}
                <p className="text-[11px] text-muted truncate">{s.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderScenariosTab = () => (
    <div className="space-y-6">
      {textField('区块标题', 'scenarios_section_title')}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-[12px] text-secondary uppercase">应用场景标签</label>
          <button
            onClick={() => addArrayItem('scenarios', { icon: 'Circle', label: '', link: '' })}
            className="text-[12px] text-accentWarm hover:text-white"
          >
            + 新增
          </button>
        </div>
        <div className="space-y-3">
          {ensureArray(form.scenarios).map((item: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-start bg-dark p-3 border border-white/5">
              <div className="col-span-3">
                <label className="block text-[11px] text-muted mb-1">图标</label>
                {iconSelect(item.icon, (v) => updateArrayItem('scenarios', idx, { icon: v }))}
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] text-muted mb-1">标签</label>
                <input
                  type="text"
                  value={item.label || ''}
                  onChange={(e) => updateArrayItem('scenarios', idx, { label: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] text-muted mb-1">链接</label>
                <input
                  type="text"
                  value={item.link || ''}
                  onChange={(e) => updateArrayItem('scenarios', idx, { link: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div className="col-span-1 pt-6">
                <button onClick={() => removeArrayItem('scenarios', idx)} className="text-error hover:text-white">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderVerificationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {textField('区块标题', 'verification_section_title')}
        {textField('链接文案', 'verification_section_link_text')}
        {textField('链接地址', 'verification_section_link')}
      </div>
      {textareaField('区块副标题', 'verification_section_subtitle')}

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-[12px] text-secondary uppercase">验证条目</label>
          <button
            onClick={() => addArrayItem('verifications', { icon: 'Circle', title: '', subtitle: '' })}
            className="text-[12px] text-accentWarm hover:text-white"
          >
            + 新增
          </button>
        </div>
        <div className="space-y-3">
          {ensureArray(form.verifications).map((item: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-start bg-dark p-3 border border-white/5">
              <div className="col-span-3">
                <label className="block text-[11px] text-muted mb-1">图标</label>
                {iconSelect(item.icon, (v) => updateArrayItem('verifications', idx, { icon: v }))}
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] text-muted mb-1">标题</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateArrayItem('verifications', idx, { title: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] text-muted mb-1">副标题</label>
                <input
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => updateArrayItem('verifications', idx, { subtitle: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div className="col-span-1 pt-6">
                <button onClick={() => removeArrayItem('verifications', idx)} className="text-error hover:text-white">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const tabContent: Record<string, React.ReactNode> = {
    hero: renderHeroTab(),
    platform: renderPlatformTab(),
    series: renderSeriesTab(),
    scenarios: renderScenariosTab(),
    verification: renderVerificationTab(),
  }

  return (
    <Dashboard>
      <div className="max-w-[900px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">首页管理</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 text-[13px] font-medium hover:bg-bg transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存更改'}
          </button>
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-[13px] whitespace-nowrap transition-colors ${
                  activeTab === tab.key ? 'text-white bg-white/10' : 'text-accent hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="text-white">{tabContent[activeTab]}</div>
      </div>
    </Dashboard>
  )
}
