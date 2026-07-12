import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Layers, Shirt, Award, Plus, Upload, ExternalLink } from 'lucide-react'
import api, { getHomeConfig, getFabricSeries } from '@/api/client'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'
import PrimaryButton from './components/PrimaryButton'
import ImageCropper from './ImageCropper'

const TABS = [
  { key: 'hero', label: 'Hero', icon: Home },
  { key: 'platform', label: '技术体系', icon: Layers },
  { key: 'series', label: '三大面料平台', icon: Shirt },
  { key: 'verification', label: '验证体系', icon: Award },
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
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropBlob, setCropBlob] = useState<Blob | null>(null)
  const [cropPreview, setCropPreview] = useState<string | null>(null)
  const [previewVersion, setPreviewVersion] = useState(0)

  useEffect(() => {
    getHomeConfig().then((res) => {
      const { hero_features: _heroFeatures, scenarios: _scenarios, scenarios_section_title: _scenariosTitle, ...data } = res.data.data || {}
      setForm({ ...data, platform_cards: ensureArray(data.platform_cards).slice(0, 3), verifications: ensureArray(data.verifications).slice(0, 2) })
    })
    getFabricSeries().then((res) => setSeries(res.data.data || []))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/home', form)
      setPreviewVersion((value) => value + 1)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const uploadHeroBackground = async (file: File | Blob, filename?: string) => {
    const fd = new FormData()
    fd.append('file', file, filename || 'hero-bg.jpg')
    const res = await api.put('/admin/home/background', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data.url as string
  }

  const handleHeroBackgroundSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (/\.(mp4|webm|mov)$/i.test(file.name)) {
      const url = await uploadHeroBackground(file, file.name)
      setForm({ ...form, hero_background: url })
      setCropBlob(null)
      setCropPreview(null)
    } else {
      if (cropSrc) URL.revokeObjectURL(cropSrc)
      setCropSrc(URL.createObjectURL(file))
      setCropBlob(null)
      setCropPreview(null)
    }
    e.target.value = ''
  }

  const handleCropComplete = (blob: Blob, previewUrl: string) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropBlob(blob)
    setCropPreview(previewUrl)
    setCropSrc(null)
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const handleCropUpload = async () => {
    if (!cropBlob) return
    const url = await uploadHeroBackground(cropBlob, 'hero-bg.jpg')
    setForm({ ...form, hero_background: url })
    setCropBlob(null)
    setCropPreview(null)
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

  const renderHeroTab = () => (
    <div className="space-y-6">
      {textField('标签', 'hero_tag')}
      {textareaField('主标题', 'hero_title', 3, '使用换行符分隔多行，RPO 会自动高亮')}
      {textareaField('副标题 / Slogan', 'hero_slogan', 3)}

      <div className="mb-6">
        <label className="block text-[12px] text-secondary uppercase mb-2">背景媒体</label>

        {cropSrc && (
          <ImageCropper
            src={cropSrc}
            aspect={12 / 5}
            onComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}

        {!cropSrc && (
          <>
            {cropPreview && <img src={cropPreview} alt="裁切后的 Hero 图片预览" className="mb-3 aspect-[12/5] w-full object-cover" />}
            <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleHeroBackgroundSelect} className="text-white text-[13px]" />
            <p className="text-[12px] text-muted mt-2">
              支持 JPG、PNG、GIF、WebP、MP4、WebM、MOV。图片建议宽度 ≥1920px。拖动选区四边或角落可自由调整裁剪框大小，前台会以 object-cover 方式铺满 Hero 区域，核心内容请放在中间偏左。
            </p>
            {cropBlob && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[13px] text-accentWarm">已生成裁切预览</span>
                <PrimaryButton type="button" onClick={handleCropUpload} icon={<Upload size={16} />}>上传并应用</PrimaryButton>
                <button
                  type="button"
                  onClick={() => { setCropBlob(null); setCropPreview(null) }}
                  className="text-[13px] text-white/60 hover:text-white"
                >
                  清除
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {textField('主按钮文案', 'primary_btn_text')}
        {textField('主按钮链接', 'primary_btn_link')}
        {textField('次按钮文案', 'secondary_btn_text')}
        {textField('次按钮链接', 'secondary_btn_link')}
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
          <label className="text-[12px] text-secondary uppercase">技术入口（前台最多显示 3 项）</label>
          {ensureArray(form.platform_cards).length < 3 && <PrimaryButton onClick={() => addArrayItem('platform_cards', { title: '', subtitle: '' })} size="sm" icon={<Plus size={14} />}>新增入口</PrimaryButton>}
        </div>
        <div className="space-y-4">
          {ensureArray(form.platform_cards).map((item: any, idx: number) => (
            <div key={idx} className="bg-dark p-4 border border-white/5">
              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-5">
                  <label className="block text-[11px] text-muted mb-1">标题</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateArrayItem('platform_cards', idx, { title: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-[11px] text-muted mb-1">说明</label>
                  <input
                    type="text"
                    value={item.subtitle || ''}
                    onChange={(e) => updateArrayItem('platform_cards', idx, { subtitle: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div className="col-span-1 pt-6 text-right">
                  <button onClick={() => removeArrayItem('platform_cards', idx)} className="text-error hover:text-white">
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSeriesTab = () => {
    const displaySeries = ['otter', 'rayo', 'kais'].map((slug) => series.find((item) => item.slug === slug)).filter(Boolean)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {textField('区块标题', 'series_section_title')}
          {textField('链接文案', 'series_section_link_text')}
          {textField('链接地址', 'series_section_link')}
        </div>
        {textareaField('区块副标题', 'series_section_subtitle')}

        <div className="bg-dark border border-white/5 p-4">
          <div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-[13px] text-white mb-2">前台固定顺序：蓝标 OTTER、银标 RAYO、红标 KAIS</p><p className="text-[12px] text-muted">图片和系列定位在“面料系列管理”维护。</p></div><button onClick={() => navigate('/admin/fabrics')} className="flex items-center gap-2 text-[12px] text-accent hover:text-white">管理图片与文案 <ExternalLink size={14} /></button></div>
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
          <label className="text-[12px] text-secondary uppercase">验证路径（前台最多显示 2 项）</label>
          {ensureArray(form.verifications).length < 2 && <PrimaryButton onClick={() => addArrayItem('verifications', { title: '', subtitle: '' })} size="sm" icon={<Plus size={14} />}>新增</PrimaryButton>}
        </div>
        <div className="space-y-3">
          {ensureArray(form.verifications).map((item: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-start bg-dark p-3 border border-white/5">
              <div className="col-span-5">
                <label className="block text-[11px] text-muted mb-1">标题</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateArrayItem('verifications', idx, { title: e.target.value })}
                  className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                />
              </div>
              <div className="col-span-6">
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
    verification: renderVerificationTab(),
  }

  return (
    <Dashboard>
      <div className="max-w-[1100px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">首页管理</h1>
          </div>
          <SaveButton onClick={handleSave} loading={saving} />
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between"><p className="text-[12px] uppercase text-secondary">真实前台预览</p><a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[12px] text-accent hover:text-white">新窗口打开 <ExternalLink size={14} /></a></div>
          <div className="h-[585px] overflow-hidden border border-white/10 bg-white"><iframe key={previewVersion} src={`/?cms-preview=${previewVersion}`} title="首页真实前台预览" style={{ width: 1440, height: 900, transform: 'scale(.65)', transformOrigin: 'top left' }} /></div>
          <p className="mt-2 text-[12px] text-muted">预览按 1440px 桌面宽度等比缩放；修改内容后点击保存，预览自动刷新。移动端效果请在新窗口检查。</p>
        </div>

        <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-[13px] whitespace-nowrap transition-colors ${
                  activeTab === tab.key ? 'text-white bg-accentWarm' : 'text-accent hover:text-white hover:bg-white/5'
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
