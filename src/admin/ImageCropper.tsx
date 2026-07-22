import { useState, useRef, useCallback } from 'react'
import ReactCrop, {
  type Crop,
  type PixelCrop,
  type PercentCrop,
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import PrimaryButton from './components/PrimaryButton'

interface ImageCropperProps {
  src: string
  aspect?: number
  maxOutputWidth?: number
  outputType?: 'image/jpeg' | 'image/png' | 'image/webp'
  outputQuality?: number
  onComplete: (blob: Blob, previewUrl: string) => void
  onCancel: () => void
}

function getCroppedBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  mimeType: string,
  maxOutputWidth: number,
  quality: number,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, maxOutputWidth / pixelCrop.width)
  canvas.width = Math.round(pixelCrop.width * scale)
  canvas.height = Math.round(pixelCrop.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  )
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality))
}

function getInitialCrop(
  width: number,
  height: number,
  aspect?: number
): PercentCrop {
  if (aspect) {
    return centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
      width,
      height
    )
  }
  return centerCrop(
    { unit: '%', x: 5, y: 5, width: 90, height: 90 },
    width,
    height
  )
}

export default function ImageCropper({
  src,
  aspect,
  maxOutputWidth = 2560,
  outputType = 'image/jpeg',
  outputQuality = 0.88,
  onComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const previewRef = useRef<HTMLCanvasElement | null>(null)

  const drawPreview = useCallback((pixelCrop: PixelCrop) => {
    if (!imgRef.current || !previewRef.current) return
    const canvas = previewRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const previewScale = Math.min(1, 960 / pixelCrop.width)
    canvas.width = Math.round(pixelCrop.width * previewScale)
    canvas.height = Math.round(pixelCrop.height * previewScale)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      imgRef.current,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvas.width,
      canvas.height
    )
  }, [])

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height, naturalWidth, naturalHeight } = e.currentTarget
      imgRef.current = e.currentTarget
      setImgSize({ width: naturalWidth, height: naturalHeight })
      const initialCrop = getInitialCrop(width, height, aspect)
      const naturalCrop = convertToPixelCrop(initialCrop, naturalWidth, naturalHeight)
      setCrop(initialCrop)
      setCompletedCrop(naturalCrop)
      window.requestAnimationFrame(() => drawPreview(naturalCrop))
    },
    [aspect, drawPreview]
  )

  const handleCropChange = useCallback(
    (_pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      setCrop(percentCrop)
    },
    []
  )

  const handleCropComplete = useCallback(
    (_pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      if (!imgRef.current) return
      const naturalCrop = convertToPixelCrop(
        percentCrop,
        imgRef.current.naturalWidth,
        imgRef.current.naturalHeight
      )
      setCompletedCrop(naturalCrop)
      drawPreview(naturalCrop)
    },
    [drawPreview]
  )

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return
    const blob = await getCroppedBlob(imgRef.current, completedCrop, outputType, maxOutputWidth, outputQuality)
    if (!blob) return
    const previewUrl = URL.createObjectURL(blob)
    onComplete(blob, previewUrl)
  }

  return (
    <div className="mb-4 border border-white/10 bg-dark p-3 sm:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="relative flex min-h-[220px] items-center justify-center bg-black/50 sm:min-h-[280px]">
            <ReactCrop
              crop={crop}
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              aspect={aspect}
              keepSelection
              ruleOfThirds
            >
              <img
                ref={imgRef}
                src={src}
                alt="裁剪"
                onLoad={onImageLoad}
                className="max-w-full max-h-[400px] block"
              />
            </ReactCrop>
          </div>
          <p className="text-[12px] text-muted mt-2">
            提示：拖动选区调整位置，拖动选区边缘或角落调整大小。
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] text-muted">实时预览（裁切框内的效果）</p>
            <p className="text-[12px] text-muted">
              原图 {imgSize.width} × {imgSize.height}px
            </p>
          </div>
          <div className="relative min-h-[220px] overflow-hidden border border-white/10 bg-darker sm:min-h-[280px]">
            <canvas ref={previewRef} className="absolute inset-0 h-full w-full object-contain" />
          </div>
          <p className="text-[12px] text-muted mt-2">
            提示：右侧会实时显示裁切后的效果。
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-3 sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 flex-1 border border-white/20 px-4 py-2 text-[13px] text-white/80 transition-colors hover:bg-white/5 sm:flex-none"
        >
          取消
        </button>
        <PrimaryButton type="button" onClick={handleConfirm} className="flex-1 sm:flex-none">
          确认裁切
        </PrimaryButton>
      </div>
    </div>
  )
}
