import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import ImageCropper from '../ImageCropper'

export interface CroppedImageChange {
  file: File | null
  removeCurrent: boolean
}

interface CroppedImageFieldProps {
  label: string
  currentSrc?: string | null
  aspect: number
  fileBaseName: string
  onChange: (change: CroppedImageChange) => void
  outputType?: 'image/jpeg' | 'image/png' | 'image/webp'
  maxOutputWidth?: number
  fit?: 'cover' | 'contain'
  transparent?: boolean
  help?: string
  confirmRemove?: () => boolean
}

const extensionByType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

export default function CroppedImageField({
  label,
  currentSrc,
  aspect,
  fileBaseName,
  onChange,
  outputType = 'image/webp',
  maxOutputWidth = 1600,
  fit = 'cover',
  transparent = false,
  help,
  confirmRemove,
}: CroppedImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cropUrlRef = useRef<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState('')

  const revokeCropUrl = () => {
    if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
    cropUrlRef.current = null
  }

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
  }

  useEffect(() => () => {
    revokeCropUrl()
    revokePreviewUrl()
  }, [])

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('仅支持 JPEG、PNG 或 WebP 图片')
      return
    }
    setError('')
    revokeCropUrl()
    const url = URL.createObjectURL(file)
    cropUrlRef.current = url
    setCropSrc(url)
  }

  const cancelCrop = () => {
    revokeCropUrl()
    setCropSrc(null)
  }

  const applyCrop = (blob: Blob, previewUrl: string) => {
    revokeCropUrl()
    revokePreviewUrl()
    cropUrlRef.current = null
    previewUrlRef.current = previewUrl
    setCropSrc(null)
    setPreviewSrc(previewUrl)
    setRemoved(false)
    const extension = extensionByType[outputType]
    const safeBaseName = fileBaseName.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'image'
    onChange({
      file: new File([blob], `${safeBaseName}.${extension}`, { type: outputType }),
      removeCurrent: false,
    })
  }

  const removeImage = () => {
    if (confirmRemove && !confirmRemove()) return
    revokePreviewUrl()
    setPreviewSrc(null)
    setRemoved(true)
    setError('')
    onChange({ file: null, removeCurrent: true })
  }

  if (cropSrc) {
    return (
      <div>
        <p className="mb-2 text-[12px] uppercase text-secondary">{label}</p>
        <ImageCropper
          src={cropSrc}
          aspect={aspect}
          maxOutputWidth={maxOutputWidth}
          outputType={outputType}
          onComplete={applyCrop}
          onCancel={cancelCrop}
        />
      </div>
    )
  }

  const visibleSrc = previewSrc || (!removed ? currentSrc : null)
  const previewBackground = transparent
    ? { backgroundColor: '#f4f4f4', backgroundImage: 'linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%)', backgroundPosition: '0 0,0 8px,8px -8px,-8px 0', backgroundSize: '16px 16px' }
    : undefined

  return (
    <div>
      <p className="mb-2 text-[12px] uppercase text-secondary">{label}</p>
      <div className="overflow-hidden border border-white/10 bg-white/5" style={{ aspectRatio: aspect, ...previewBackground }}>
        {visibleSrc ? <img src={visibleSrc} alt={`${label}预览`} className={`h-full w-full ${fit === 'contain' ? 'object-contain p-3' : 'object-cover'}`} /> : <div className="flex h-full items-center justify-center text-[12px] text-muted">未上传图片</div>}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-3 py-2 text-[12px] text-white transition-colors hover:bg-white/5">
          {visibleSrc ? <RefreshCw size={14} /> : <ImagePlus size={14} />}
          {visibleSrc ? '替换并裁切' : '上传并裁切'}
        </button>
        {visibleSrc && <button type="button" onClick={removeImage} aria-label={`移除${label}`} className="inline-flex h-10 w-10 items-center justify-center text-error transition-colors hover:bg-white/5 hover:text-white"><Trash2 size={15} /></button>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} className="hidden" />
      </div>
      <p className="mt-2 text-[11px] leading-5 text-muted">{help || '上传后先裁切，再随表单一起保存。'}</p>
      {error && <p className="mt-2 text-[12px] text-error">{error}</p>}
    </div>
  )
}
