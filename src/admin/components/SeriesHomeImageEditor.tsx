import { useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import api, { uploadFile } from '@/api/client'
import ImageCropper from '../ImageCropper'

interface FabricSeriesImage {
  id: number
  name: string
  slug: string
  home_image?: string | null
  home_badge_image?: string | null
}

interface SeriesHomeImageEditorProps {
  series: FabricSeriesImage
  onChange: (patch: { home_image?: string | null; home_badge_image?: string | null }) => void
}

function inspectBadgeFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = image.naturalWidth / image.naturalHeight
      if (Math.abs(ratio - 2) > 0.08) {
        resolve('透明徽章长宽比需要接近 2:1')
        return
      }
      const scale = Math.min(1, 256 / image.naturalWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d')
      if (!context) {
        resolve('无法检查透明通道')
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      for (let index = 3; index < pixels.length; index += 4) {
        if (pixels[index] < 250) {
          resolve(null)
          return
        }
      }
      resolve('徽章文件必须包含透明区域')
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('无法读取徽章文件')
    }
    image.src = url
  })
}

export default function SeriesHomeImageEditor({ series, onChange }: SeriesHomeImageEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const badgeInputRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setCropSrc(URL.createObjectURL(file))
  }

  const handleCropComplete = async (blob: Blob, previewUrl: string) => {
    closeCropper()
    setBusy(true)
    setError('')
    try {
      const file = new File([blob], `${series.slug}-home.jpg`, { type: 'image/jpeg' })
      const upload = await uploadFile(file)
      const url = upload.data.url || upload.data.data?.url
      if (!url) throw new Error('Upload did not return a URL')
      await api.put(`/fabrics/admin/series/${series.id}`, { home_image: url })
      onChange({ home_image: url })
    } catch {
      setError('图片保存失败')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    if (!series.home_image || !confirm(`确定移除${series.name}的首页卡片图？`)) return
    setBusy(true)
    setError('')
    try {
      await api.delete(`/fabrics/admin/series/${series.id}/home-image`)
      onChange({ home_image: null })
    } catch {
      setError('图片移除失败')
    } finally {
      setBusy(false)
    }
  }

  const handleBadgeSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/svg+xml', 'image/png', 'image/webp'].includes(file.type)) {
      setError('透明徽章仅支持 SVG、PNG 或 WebP')
      return
    }
    setBusy(true)
    setError('')
    try {
      const validationError = await inspectBadgeFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      const upload = await uploadFile(file)
      const url = upload.data.url || upload.data.data?.url
      if (!url) throw new Error('Upload did not return a URL')
      await api.put(`/fabrics/admin/series/${series.id}`, { home_badge_image: url })
      onChange({ home_badge_image: url })
    } catch {
      setError('透明徽章保存失败')
    } finally {
      setBusy(false)
    }
  }

  const handleBadgeRemove = async () => {
    if (!series.home_badge_image || !confirm(`确定移除${series.name}的首页透明徽章？`)) return
    setBusy(true)
    setError('')
    try {
      await api.delete(`/fabrics/admin/series/${series.id}/home-badge`)
      onChange({ home_badge_image: null })
    } catch {
      setError('透明徽章移除失败')
    } finally {
      setBusy(false)
    }
  }

  if (cropSrc) {
    return <ImageCropper src={cropSrc} aspect={4 / 3} maxOutputWidth={1600} onComplete={handleCropComplete} onCancel={closeCropper} />
  }

  return (
    <div>
      <div className="aspect-[4/3] overflow-hidden border border-white/10 bg-white/5">
        {series.home_image ? (
          <img src={series.home_image} alt={`${series.name}首页卡片图`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-muted">未上传首页卡片图</div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[12px] text-white transition-colors hover:bg-white/5 disabled:opacity-50">
          {series.home_image ? <RefreshCw size={14} /> : <ImagePlus size={14} />}
          {busy ? '处理中' : series.home_image ? '替换' : '上传'}
        </button>
        {series.home_image && (
          <button type="button" disabled={busy} onClick={handleRemove} aria-label={`移除${series.name}首页卡片图`} title="移除图片" className="inline-flex h-9 w-9 items-center justify-center text-error transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50">
            <Trash2 size={15} />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleSelect} className="hidden" />
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="mb-2 text-[12px] uppercase text-secondary">左下角透明徽章</p>
        <div
          className="flex aspect-[2/1] items-center justify-center overflow-hidden border border-white/10 p-4"
          style={{ backgroundColor: '#f4f4f4', backgroundImage: 'linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%)', backgroundPosition: '0 0,0 8px,8px -8px,-8px 0', backgroundSize: '16px 16px' }}
        >
          {series.home_badge_image ? <img src={series.home_badge_image} alt={`${series.name}首页透明徽章`} className="h-full w-full object-contain" /> : <span className="text-[12px] text-secondary">未上传透明徽章</span>}
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted">仅支持带透明通道的 SVG、PNG、WebP；不会裁切或转换格式。</p>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" disabled={busy} onClick={() => badgeInputRef.current?.click()} className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[12px] text-white transition-colors hover:bg-white/5 disabled:opacity-50">
            {series.home_badge_image ? <RefreshCw size={14} /> : <ImagePlus size={14} />}
            {busy ? '处理中' : series.home_badge_image ? '替换徽章' : '上传徽章'}
          </button>
          {series.home_badge_image && (
            <button type="button" disabled={busy} onClick={handleBadgeRemove} aria-label={`移除${series.name}首页透明徽章`} title="移除徽章" className="inline-flex h-9 w-9 items-center justify-center text-error transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50">
              <Trash2 size={15} />
            </button>
          )}
          <input ref={badgeInputRef} type="file" accept="image/svg+xml,image/png,image/webp" onChange={handleBadgeSelect} className="hidden" />
        </div>
      </div>
      {error && <p className="mt-2 text-[12px] text-error">{error}</p>}
    </div>
  )
}
