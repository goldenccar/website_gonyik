import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface FileViewerProps {
  url: string
  fileType: string
  title: string
  onClose: () => void
}

export default function FileViewer({ url, fileType, title, onClose }: FileViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)

  const isPdf = fileType === 'pdf'
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileType)
  const isSvg = fileType === 'svg'

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (isPdf) {
        if (e.key === 'ArrowLeft') setPageNumber((p) => Math.max(1, p - 1))
        if (e.key === 'ArrowRight') setPageNumber((p) => Math.min(numPages, p + 1))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, isPdf, numPages])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[70] bg-darker/95 flex flex-col">
      {/* Toolbar */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <span className="text-white text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {isPdf && (
            <>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  {pageNumber} / {numPages}
                </span>
                <button
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                  disabled={pageNumber >= numPages}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded">
                  <ZoomOut size={16} />
                </button>
                <span className="text-white/60 text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded">
                  <ZoomIn size={16} />
                </button>
              </div>
            </>
          )}
          <a
            href={url}
            download
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm px-3 py-1.5 border border-white/20 hover:border-white/40 rounded transition-colors"
          >
            <Download size={14} />
            下载
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
        {isPdf && (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-white/40 text-sm">加载 PDF 中...</div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
              className="shadow-2xl"
            />
          </Document>
        )}
        {isImage && (
          <img
            src={url}
            alt={title}
            className="max-w-full max-h-full object-contain shadow-2xl"
            onLoad={() => setLoading(false)}
          />
        )}
        {isSvg && (
          <object data={url} type="image/svg+xml" className="max-w-full max-h-full">
            <img src={url} alt={title} />
          </object>
        )}
        {loading && !isPdf && (
          <div className="text-white/40 text-sm">加载中...</div>
        )}
      </div>
    </div>
  )
}
