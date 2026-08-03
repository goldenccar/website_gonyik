import { useState, useEffect } from 'react'
import { Home, Layers, Shirt, Award, ArrowDown, ArrowUp, Plus, Trash2, Upload } from 'lucide-react'
import api, { getHomeConfig, getFabricSeries, uploadFile } from '@/api/client'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'
import PrimaryButton from './components/PrimaryButton'
import ImageCropper from './ImageCropper'
import AdminHeader from './components/AdminHeader'
import SeriesHomeImageEditor from './components/SeriesHomeImageEditor'
import AdminPagePreview from './components/AdminPagePreview'

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
  const [form, setForm] = useState<any>({})
  const [series, setSeries] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('hero')
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropBlob, setCropBlob] = useState<Blob | null>(null)
  const [cropPreview, setCropPreview] = useState<string | null>(null)
  const [validationCropSource, setValidationCropSource] = useState<string | null>(null)
  const [validationUploading, setValidationUploading] = useState(false)
  const [validationEditingIndex, setValidationEditingIndex] = useState<number | null>(null)
  const [previewVersion, setPreviewVersion] = useState(0)

  useEffect(() => {
    getHomeConfig().then((res) => {
      const data = res.data.data || {}
      const verificationDefaults = [
        { title: '内部实验室', subtitle: '依托香港科技大学（广州）多功能高聚物薄膜中央实验室，开展材料筛选、结构开发、样品对比与耐久验证。' },
        { title: '第三方测试认证', subtitle: '根据具体产品与项目要求，委托 SGS、中纺标 CTTC 等专业机构检测，结果以正式报告为准。' },
      ]
      const verifications = verificationDefaults.map((fallback, index) => ({ ...fallback, ...(ensureArray(data.verifications)[index] || {}) }))
      const verificationImages = ensureArray(data.verification_images)
        .filter((item) => item?.url)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .slice(0, 5)
      if (!verificationImages.length && data.verification_image) {
        verificationImages.push({ id: 'legacy-verification-image', url: data.verification_image, order_index: 0 })
      }
      setForm({
        ...data,
        platform_cards: ensureArray(data.platform_cards).slice(0, 3),
        verifications,
        verification_images: verificationImages,
      })
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
    const preserveOriginal = file.type === 'image/gif'
      || file.type.startsWith('video/')
      || /\.(gif|mp4|webm|mov)$/i.test(file.name)

    if (preserveOriginal) {
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

  const handleMobileHeroSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file, file.name)
    const res = await api.put('/admin/home/mobile-background', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setForm({ ...form, hero_mobile_background: res.data.url })
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

  const startValidationCrop = (file: File) => {
    if (validationCropSource) URL.revokeObjectURL(validationCropSource)
    setValidationCropSource(URL.createObjectURL(file))
  }

  const cancelValidationCrop = () => {
    if (validationCropSource) URL.revokeObjectURL(validationCropSource)
    setValidationCropSource(null)
    setValidationEditingIndex(null)
  }

  const applyValidationCrop = async (blob: Blob) => {
    setValidationUploading(true)
    const editingIndex = validationEditingIndex
    try {
      const file = new File([blob], `home-lab-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const response = await uploadFile(file)
      const url = response.data.url || response.data.data?.url
      if (!url) throw new Error('图片上传失败')
      setForm((current: any) => {
        const images = ensureArray(current.verification_images)
          .filter((item) => item?.url)
          .slice(0, 5)
          .map((item) => ({ ...item }))
        if (editingIndex !== null && images[editingIndex]) {
          images[editingIndex] = { ...images[editingIndex], url }
        } else if (images.length < 5) {
          images.push({ id: crypto.randomUUID(), url, order_index: images.length })
        }
        const normalized = images.map((item, index) => ({ ...item, order_index: index }))
        return {
          ...current,
          verification_images: normalized,
          verification_image: normalized[0]?.url || null,
        }
      })
    } finally {
      setValidationUploading(false)
      cancelValidationCrop()
    }
  }

  const setVerificationImages = (update: (images: any[]) => any[]) => {
    setForm((current: any) => {
      const images = update(ensureArray(current.verification_images).map((item) => ({ ...item })))
        .filter((item) => item?.url)
        .slice(0, 5)
        .map((item, index) => ({ ...item, order_index: index }))
      return {
        ...current,
        verification_images: images,
        verification_image: images[0]?.url || null,
      }
    })
  }

  const moveVerificationImage = (index: number, direction: -1 | 1) => {
    setVerificationImages((images) => {
      const target = index + direction
      if (target < 0 || target >= images.length) return images
      const next = [...images]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
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
        <label className="block text-[12px] text-secondary uppercase mb-2">桌面端背景媒体</label>

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
              支持 JPG、PNG、GIF、WebP、MP4、WebM、MOV。GIF 与视频保留原文件直接上传，其他图片可裁剪。图片建议宽度 ≥1920px，前台会以 object-cover 方式铺满 Hero 区域，核心内容请放在中间偏左。
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

      <div className="mb-6 border-t border-white/10 pt-6">
        <label className="mb-2 block text-[12px] uppercase text-secondary">移动端背景图片</label>
        {form.hero_mobile_background && <img src={form.hero_mobile_background} alt="当前移动端 Hero" className="mb-3 aspect-[4/5] w-full max-w-[240px] object-cover" />}
        <input type="file" accept="image/*" onChange={handleMobileHeroSelect} className="text-[13px] text-white" />
        <p className="mt-2 text-[12px] text-muted">建议 1200 × 1500px（4:5）。主体放在右侧，左上区域保留给标题；未上传时自动使用桌面媒体。</p>
        {form.hero_mobile_background && <button type="button" onClick={() => setForm({ ...form, hero_mobile_background: null })} className="mt-3 block text-[13px] text-white/60 hover:text-white">移除移动端图片</button>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {textField('主按钮文案', 'primary_btn_text')}
        {textField('主按钮链接', 'primary_btn_link')}
        {textField('次按钮文案', 'secondary_btn_text')}
        {textField('次按钮链接', 'secondary_btn_link')}
      </div>

    </div>
  )

  const renderPlatformTab = () => (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
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
              <div className="grid gap-3 sm:grid-cols-12 sm:items-start">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] text-muted mb-1">标题</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateArrayItem('platform_cards', idx, { title: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-[11px] text-muted mb-1">说明</label>
                  <input
                    type="text"
                    value={item.subtitle || ''}
                    onChange={(e) => updateArrayItem('platform_cards', idx, { subtitle: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-11">
                  <label className="block text-[11px] text-muted mb-1">证据短句（可选）</label>
                  <input
                    type="text"
                    value={item.evidence || ''}
                    onChange={(e) => updateArrayItem('platform_cards', idx, { evidence: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div className="text-right sm:col-span-1 sm:pt-6">
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
        <div className="grid gap-6 sm:grid-cols-2">
          {textField('区块标题', 'series_section_title')}
          {textField('链接文案', 'series_section_link_text')}
          {textField('链接地址', 'series_section_link')}
        </div>
        {textareaField('区块副标题', 'series_section_subtitle')}

        <div className="bg-dark border border-white/5 p-4">
          <div className="mb-4"><p className="text-[13px] text-white mb-2">首页三大面料卡片</p><p className="text-[12px] text-muted">前台固定顺序：蓝标 OTTER、银标 RAYO、黑标 KAIS。图片在此处直接上传、替换或移除。</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displaySeries.map((s) => (
              <div key={s.id} className="bg-white/5 p-3 border border-white/5">
                <p className="mb-1 text-[14px] font-medium text-white">{s.name}</p>
                <p className="mb-3 truncate text-[11px] text-muted">{s.tagline}</p>
                <SeriesHomeImageEditor series={s} onChange={(patch) => setSeries((items) => items.map((item) => item.id === s.id ? { ...item, ...patch } : item))} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderVerificationTab = () => (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {textField('区块标题', 'verification_section_title')}
      </div>
      {textareaField('区块副标题', 'verification_section_subtitle')}

      <div className="border border-white/5 bg-dark p-4">
        <label className="mb-3 block text-[12px] uppercase text-secondary">内部实验室图片（最多 5 张）</label>
        {validationCropSource ? (
          <ImageCropper src={validationCropSource} aspect={16 / 6} onComplete={(blob) => applyValidationCrop(blob)} onCancel={cancelValidationCrop} />
        ) : ensureArray(form.verification_images).length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {ensureArray(form.verification_images).map((item: any, index: number) => (
              <div key={item.id || `${item.url}-${index}`} className="border border-white/10 bg-white/[0.03] p-2">
                <div className="aspect-[16/6] overflow-hidden bg-white/5">
                  <img src={item.url} alt={`内部实验室图片 ${index + 1}`} className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted">{String(index + 1).padStart(2, '0')} / {String(ensureArray(form.verification_images).length).padStart(2, '0')}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" title="向前移动" disabled={index === 0} onClick={() => moveVerificationImage(index, -1)} className="p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"><ArrowUp size={14} /></button>
                    <button type="button" title="向后移动" disabled={index === ensureArray(form.verification_images).length - 1} onClick={() => moveVerificationImage(index, 1)} className="p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"><ArrowDown size={14} /></button>
                    <button type="button" onClick={() => { setValidationEditingIndex(index); document.getElementById('home-validation-image')?.click() }} className="px-2 py-1.5 text-[11px] text-white/70 transition-colors hover:bg-white/5 hover:text-white">替换</button>
                    <button type="button" title="移除图片" onClick={() => setVerificationImages((images) => images.filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-error transition-colors hover:bg-white/5 hover:text-white"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="flex aspect-[16/6] max-w-[720px] items-end border border-dashed border-borderDark bg-white/[0.03] p-4 text-[12px] text-muted">内部实验室图片占位</div>}
        {!validationCropSource && <div className="mt-3 flex flex-wrap items-center gap-3">
          {ensureArray(form.verification_images).length < 5 && <PrimaryButton type="button" onClick={() => { setValidationEditingIndex(null); document.getElementById('home-validation-image')?.click() }} size="sm" loading={validationUploading} icon={<Upload size={14} />}>{ensureArray(form.verification_images).length ? '添加图片' : '上传图片'}</PrimaryButton>}
          <input id="home-validation-image" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) startValidationCrop(file); event.currentTarget.value = '' }} />
          <span className="text-[11px] text-muted">建议宽度不低于 1280px，上传后按当前前台 16:6 比例裁切；前台按此处顺序轮播。</span>
        </div>}
      </div>

      <div className="space-y-4">
        {ensureArray(form.verifications).slice(0, 2).map((item: any, idx: number) => (
          <div key={idx} className="border border-white/5 bg-dark p-4">
            <p className="mb-3 text-[12px] uppercase text-secondary">{idx === 0 ? '内部实验室' : '第三方测试认证'}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-[11px] text-muted">标题</label><input type="text" value={item.title || ''} onChange={(e) => updateArrayItem('verifications', idx, { title: e.target.value })} className="w-full border border-borderDark bg-white/5 px-3 py-2 text-[13px] text-white focus:border-white focus:outline-none" /></div>
              <div><label className="mb-1 block text-[11px] text-muted">说明</label><textarea rows={3} value={item.subtitle || ''} onChange={(e) => updateArrayItem('verifications', idx, { subtitle: e.target.value })} className="w-full border border-borderDark bg-white/5 px-3 py-2 text-[13px] text-white focus:border-white focus:outline-none" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {textField('第三方测试认证链接文案', 'verification_section_link_text')}
        {textField('跳转地址', 'verification_section_link', '/pfas-free-innovation#technology-testing-certification')}
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
        <AdminHeader title="首页管理" action={<SaveButton onClick={handleSave} loading={saving} />} />

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <AdminPagePreview publicPath="/" title="首页" version={previewVersion} helpText="修改内容并保存后预览自动刷新；移动端效果请在新窗口检查。" />

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
