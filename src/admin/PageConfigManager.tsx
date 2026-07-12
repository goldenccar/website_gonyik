import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getPageConfig, updatePageConfig, uploadFile } from '@/api/client'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'
import ImageCropper from './ImageCropper'

interface PageConfigItem {
  page_key: string
  page_tag: string
  page_title: string
  page_subtitle: string
  hero_background: string | null
}

const PAGE_KEY_MAP: Record<string, { label: string; backPath: string; publicPath: string }> = {
  fabrics: { label: '面料数据库', backPath: '/admin/fabrics', publicPath: '/fabrics' },
  equipment: { label: '终端装备', backPath: '/admin/equipment', publicPath: '/equipment' },
  'pfas-free-innovation': { label: '技术创新', backPath: '/admin/fluorine', publicPath: '/pfas-free-innovation' },
  services: { label: '服务与支持', backPath: '/admin/services', publicPath: '/services' },
  contact: { label: '联系我们', backPath: '/admin/contact-config', publicPath: '/contact' },
}

interface PageConfigManagerProps {
  pageKey?: string
}

export default function PageConfigManager({ pageKey }: PageConfigManagerProps = {}) {
  const navigate = useNavigate()
  const [config, setConfig] = useState<PageConfigItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [previewVersion, setPreviewVersion] = useState(0)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const targetKey = pageKey || 'fabrics'
  const meta = PAGE_KEY_MAP[targetKey] || { label: '页面配置', backPath: '/admin/dashboard' }

  useEffect(() => {
    getPageConfig(targetKey).then((res) => {
      setConfig(res.data.data)
      setLoading(false)
    })
  }, [targetKey])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      await updatePageConfig(targetKey, {
        page_tag: config.page_tag,
        page_title: config.page_title,
        page_subtitle: config.page_subtitle,
        hero_background: config.hero_background,
      })
      setPreviewVersion((value) => value + 1)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setMessage('保存失败')
      setTimeout(() => setMessage(''), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </Dashboard>
    )
  }

  if (!config) return null

  const applyCrop = async (blob: Blob) => {
    setUploading(true)
    try {
      const res = await uploadFile(new File([blob], `${targetKey}-hero.jpg`, { type: 'image/jpeg' }))
      setConfig({ ...config, hero_background: res.data.url || res.data.data?.url })
    } finally {
      if (cropSrc) URL.revokeObjectURL(cropSrc)
      setCropSrc(null)
      setUploading(false)
    }
  }

  return (
    <Dashboard>
      <div className="max-w-[1100px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(meta.backPath)} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">{meta.label} — 页面配置</h1>
          </div>
          <SaveButton onClick={handleSave} loading={saving} size="sm">
            保存
          </SaveButton>
        </div>

        {message && <p className="text-success text-[13px] mb-6">{message}</p>}

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between"><p className="text-[12px] uppercase text-secondary">真实前台预览</p><a href={meta.publicPath} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[12px] text-accent hover:text-white">新窗口打开 <ExternalLink size={14} /></a></div>
          <div className="h-[585px] overflow-hidden border border-white/10 bg-white"><iframe key={previewVersion} src={`${meta.publicPath}?cms-preview=${previewVersion}`} title={`${meta.label}真实前台预览`} style={{ width: 1440, height: 900, transform: 'scale(.65)', transformOrigin: 'top left' }} /></div>
          <p className="mt-2 text-[12px] text-muted">预览按 1440px 桌面宽度等比缩放，并与正式页面使用同一组件；移动端效果请在新窗口检查。</p>
        </div>

        <div className="bg-dark p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-1.5">英文标签</label>
              <input
                value={config.page_tag}
                onChange={(e) => setConfig({ ...config, page_tag: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] text-secondary uppercase mb-1.5">页面标题</label>
              <input
                value={config.page_title}
                onChange={(e) => setConfig({ ...config, page_title: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] text-secondary uppercase mb-1.5">副标题</label>
              <input
                value={config.page_subtitle}
                onChange={(e) => setConfig({ ...config, page_subtitle: e.target.value })}
                className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] text-secondary uppercase mb-1.5">Hero 图片</label>
              {config.hero_background && <img src={config.hero_background} alt="当前 Hero" className="mb-3 aspect-[3/1] w-full object-cover" />}
              {cropSrc ? <ImageCropper src={cropSrc} onComplete={(blob) => applyCrop(blob)} onCancel={() => { URL.revokeObjectURL(cropSrc); setCropSrc(null) }} /> : <input type="file" accept="image/*" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) setCropSrc(URL.createObjectURL(file)); event.currentTarget.value = '' }} className="text-[13px] text-white" />}
              <p className="mt-2 text-[12px] text-muted">{uploading ? '上传中…' : '上传后可裁剪；保存页面配置后同步到前台。'}</p>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
}
