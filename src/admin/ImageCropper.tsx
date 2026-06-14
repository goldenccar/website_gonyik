import { useState, useRef, useCallback } from 'react'
import ReactCrop, {
  type Crop,
  type PixelCrop,
  type PercentCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import PrimaryButton from './components/PrimaryButton'

interface ImageCropperProps {
  src: string
  aspect?: number
  previewMode?: 'hero' | 'section'
  previewTitle?: string
  previewSubtitle?: string
  previewIndex?: number
  imageFit?: 'cover' | 'contain' | 'original' | string
  onComplete: (blob: Blob, previewUrl: string) => void
  onCancel: () => void
}

function getCroppedBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  mimeType: string
): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
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
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.95))
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
  previewMode = 'hero',
  previewTitle,
  previewSubtitle,
  previewIndex = 0,
  imageFit = 'cover',
  onComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const previewRef = useRef<HTMLCanvasElement | null>(null)

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height, naturalWidth, naturalHeight } = e.currentTarget
      imgRef.current = e.currentTarget
      setImgSize({ width: naturalWidth, height: naturalHeight })
      setCrop(getInitialCrop(width, height, aspect))
    },
    [aspect]
  )

  const drawPreview = useCallback((pixelCrop: PixelCrop) => {
    if (!imgRef.current || !previewRef.current) return
    const canvas = previewRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
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

  const handleCropChange = useCallback(
    (_pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      setCrop(percentCrop)
    },
    []
  )

  const handleCropComplete = useCallback(
    (pixelCrop: PixelCrop, _percentCrop: PercentCrop) => {
      setCompletedCrop(pixelCrop)
      drawPreview(pixelCrop)
    },
    [drawPreview]
  )

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return
    const blob = await getCroppedBlob(imgRef.current, completedCrop, 'image/jpeg')
    if (!blob) return
    const previewUrl = URL.createObjectURL(blob)
    onComplete(blob, previewUrl)
  }

  return (
    <div className="bg-dark border border-white/10 p-4 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="relative bg-black/50 flex items-center justify-center min-h-[280px]">
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
          <div
            className={`relative overflow-hidden rounded border border-white/10 bg-darker ${
              previewMode === 'section' ? 'min-h-[280px]' : 'aspect-video'
            }`}
          >
            {previewMode === 'section' ? (
              <div className="relative h-full flex flex-col lg:flex-row gap-5 p-5">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-accent uppercase tracking-wider mb-1">
                    {String(previewIndex + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-[18px] font-bold text-white leading-tight mb-2 line-clamp-2">
                    {previewTitle || '标题'}
                  </h3>
                  <p className="text-[12px] text-accent line-clamp-3">
                    {previewSubtitle || '摘要'}
                  </p>
                </div>
                <div
                  className={`lg:w-[42%] shrink-0 ${
                    imageFit === 'original' ? '' : 'aspect-[4/5]'
                  } bg-darker overflow-hidden`}
                >
                  <canvas
                    ref={previewRef}
                    className={`w-full transition-opacity duration-500 ${
                      imageFit === 'original'
                        ? 'h-auto max-h-[280px] object-contain mx-auto'
                        : imageFit === 'contain'
                        ? 'h-full object-contain'
                        : 'h-full object-cover'
                    }`}
                  />
                </div>
              </div>
            ) : (
              <>
                <canvas
                  ref={previewRef}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 via-[40%] to-transparent to-[100%]" />
                <div className="relative z-10 h-full flex flex-col justify-center px-5">
                  <p className="text-[10px] text-accentWarm uppercase tracking-wider mb-1">
                    TAG
                  </p>
                  <h3 className="text-[22px] font-bold text-white leading-tight">
                    主标题
                  </h3>
                </div>
              </>
            )}
          </div>
          <p className="text-[12px] text-muted mt-2">
            提示：右侧会实时显示裁切后的效果。
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
        <PrimaryButton type="button" onClick={handleConfirm}>
          确认裁切
        </PrimaryButton>
      </div>
    </div>
  )
}
