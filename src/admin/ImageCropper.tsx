import { useState, useRef, useEffect, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import PrimaryButton from './components/PrimaryButton'

interface ImageCropperProps {
  src: string
  aspect?: number
  onComplete: (blob: Blob, previewUrl: string) => void
  onCancel: () => void
}

function getCroppedBlob(image: HTMLImageElement, area: Area, mimeType: string): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height)
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.95))
}

export default function ImageCropper({ src, aspect = 16 / 9, onComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const previewRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => {
      imgRef.current = img
      setImgSize({ width: img.naturalWidth, height: img.naturalHeight })
    }
  }, [src])

  const drawPreview = useCallback((a: Area) => {
    if (!imgRef.current || !previewRef.current) return
    const canvas = previewRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (canvas.width !== a.width || canvas.height !== a.height) {
      canvas.width = a.width
      canvas.height = a.height
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imgRef.current, a.x, a.y, a.width, a.height, 0, 0, canvas.width, canvas.height)
  }, [])

  const handleCropAreaChange = useCallback(
    (_: Area, pixels: Area) => {
      setArea(pixels)
      drawPreview(pixels)
    },
    [drawPreview]
  )

  const handleConfirm = async () => {
    if (!imgRef.current || !area) return
    const blob = await getCroppedBlob(imgRef.current, area, 'image/jpeg')
    if (!blob) return
    const previewUrl = URL.createObjectURL(blob)
    onComplete(blob, previewUrl)
  }

  return (
    <div className="bg-dark border border-white/10 p-4 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="relative h-[280px] bg-black/50">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropAreaChange={handleCropAreaChange}
              cropShape="rect"
              showGrid
              zoomWithScroll
              objectFit="contain"
            />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[12px] text-muted">缩放</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-accentWarm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] text-muted">实时预览（裁切框内的效果）</p>
            <p className="text-[12px] text-muted">
              原图 {imgSize.width} × {imgSize.height}px
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded border border-white/10 bg-darker">
            <canvas ref={previewRef} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 via-[40%] to-transparent to-[100%]" />
            <div className="relative z-10 h-full flex flex-col justify-center px-5">
              <p className="text-[10px] text-accentWarm uppercase tracking-wider mb-1">TAG</p>
              <h3 className="text-[22px] font-bold text-white leading-tight">主标题</h3>
            </div>
          </div>
          <p className="text-[12px] text-muted mt-2">
            提示：拖动图片调整位置，滚动或拖动选区边缘调整大小，右侧会实时显示裁切后的效果。
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[13px] text-white/80 border border-white/20 hover:bg-white/5 transition-colors"
        >
          取消
        </button>
        <PrimaryButton type="button" onClick={handleConfirm}>确认裁切</PrimaryButton>
      </div>
    </div>
  )
}
