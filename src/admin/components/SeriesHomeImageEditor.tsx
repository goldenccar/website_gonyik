import { useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import api, { uploadFile } from '@/api/client'
import ImageCropper from '../ImageCropper'

interface FabricSeriesImage {
  id: number
  name: string
  slug: string
  home_image?: string | null
}

interface SeriesHomeImageEditorProps {
  series: FabricSeriesImage
  onChange: (url: string | null) => void
}

export default function SeriesHomeImageEditor({ series, onChange }: SeriesHomeImageEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
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
      onChange(url)
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
      onChange(null)
    } catch {
      setError('图片移除失败')
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
      {error && <p className="mt-2 text-[12px] text-error">{error}</p>}
    </div>
  )
}
