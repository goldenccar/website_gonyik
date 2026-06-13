import { useState, useRef } from 'react'
import ReactCrop, { Crop, PixelCrop, convertToPixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  src: string
  aspect?: number
  onComplete: (blob: Blob, previewUrl: string) => void
  onCancel: () => void
}

function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop, mimeType: string): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, 0.95)
  })
}

export default function ImageCropper({ src, aspect, onComplete, onCancel }: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setImgSize({ width: w, height: h })

    let initialCrop: PixelCrop
    if (aspect && aspect > 0) {
      const cropHeight = Math.min(w / aspect, h)
      const cropWidth = cropHeight * aspect
      initialCrop = {
        unit: 'px',
        x: (w - cropWidth) / 2,
        y: (h - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      }
    } else {
      initialCrop = { unit: 'px', x: 0, y: 0, width: w, height: h }
    }
    setCrop(initialCrop)
  }

  async function handleConfirm() {
    if (!imgRef.current || !crop) return
    const pixelCrop = convertToPixelCrop(crop, imgRef.current.naturalWidth, imgRef.current.naturalHeight)
    if (pixelCrop.width <= 0 || pixelCrop.height <= 0) return
    const blob = await getCroppedBlob(imgRef.current, pixelCrop, 'image/jpeg')
    if (!blob) return
    const previewUrl = URL.createObjectURL(blob)
    onComplete(blob, previewUrl)
  }

  return (
    <div className="bg-dark border border-white/10 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-muted">
          原图尺寸：{imgSize.width} × {imgSize.height} px
          {aspect ? `（建议按 ${aspect}:1 比例裁切）` : '（自由裁切）'}
        </p>
        <p className="text-[12px] text-muted">拖动选区调整，点击「确认裁切」生效</p>
      </div>
      <div className="flex justify-center bg-black/40 overflow-auto max-h-[360px]">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            src={src}
            alt="待裁切"
            onLoad={onImageLoad}
            className="max-h-[320px] w-auto block"
          />
        </ReactCrop>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[13px] text-white/80 border border-white/20 hover:bg-white/5 transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2 text-[13px] bg-accentWarm text-white hover:bg-accentWarm/90 transition-colors"
        >
          确认裁切
        </button>
      </div>
    </div>
  )
}
