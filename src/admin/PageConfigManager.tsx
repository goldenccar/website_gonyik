import { useState, useEffect } from 'react'
import { getPageConfig, updatePageConfig, uploadFile } from '@/api/client'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'
import ImageCropper from './ImageCropper'
import AdminHeader from './components/AdminHeader'
import FormField from './components/FormField'
import AdminPagePreview from './components/AdminPagePreview'

interface PageConfigItem {
  page_key: string
  page_tag: string
  page_title: string
  page_subtitle: string
  hero_background: string | null
  core_performance_title?: string
}

const PAGE_KEY_MAP: Record<string, { label: string; publicPath: string }> = {
  fabrics: { label: '面料数据库', publicPath: '/fabrics' },
  equipment: { label: '终端装备', publicPath: '/equipment' },
  'pfas-free-innovation': { label: '技术创新', publicPath: '/pfas-free-innovation' },
  services: { label: '服务与支持', publicPath: '/services' },
  contact: { label: '联系我们', publicPath: '/contact' },
}

interface PageConfigManagerProps {
  pageKey?: string
}

export default function PageConfigManager({ pageKey }: PageConfigManagerProps = {}) {
  const [config, setConfig] = useState<PageConfigItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [previewVersion, setPreviewVersion] = useState(0)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const targetKey = pageKey || 'fabrics'
  const meta = PAGE_KEY_MAP[targetKey] || { label: '页面配置', publicPath: '/' }

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
        ...(targetKey === 'fabrics' ? { core_performance_title: config.core_performance_title || '核心性能' } : {}),
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
        <AdminHeader title={`${meta.label} — 页面配置`} action={<SaveButton onClick={handleSave} loading={saving} size="sm">保存</SaveButton>} />

        {message && <p className="text-success text-[13px] mb-6">{message}</p>}

        <AdminPagePreview publicPath={meta.publicPath} title={meta.label} version={previewVersion} />

        <div className="bg-dark p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="英文标签" name="page_tag" markup="inline" value={config.page_tag} onChange={(event) => setConfig({ ...config, page_tag: event.target.value })} />
            <FormField label="页面标题" name="page_title" markup="inline" value={config.page_title} onChange={(event) => setConfig({ ...config, page_title: event.target.value })} />
            <FormField className="md:col-span-2" label="副标题" name="page_subtitle" markup="inline" value={config.page_subtitle} onChange={(event) => setConfig({ ...config, page_subtitle: event.target.value })} />
            {targetKey === 'fabrics' && <FormField className="md:col-span-2" label="SKU 性能区标题" name="core_performance_title" markup="inline" value={config.core_performance_title || '核心性能'} onChange={(event) => setConfig({ ...config, core_performance_title: event.target.value })} />}
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
