import { useEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'

interface AdminPagePreviewProps {
  publicPath: string
  title: string
  version?: number
  helpText?: string
  draftMessage?: { type: string; payload: unknown } | null
}

export default function AdminPagePreview({ publicPath, title, version = 0, helpText, draftMessage }: AdminPagePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previewUrl = `${publicPath}${publicPath.includes('?') ? '&' : '?'}cms-preview=${version}`
  const sendDraft = () => {
    if (!draftMessage) return
    iframeRef.current?.contentWindow?.postMessage(draftMessage, window.location.origin)
  }

  useEffect(() => { sendDraft() }, [draftMessage])
  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === 'gonyik:technology-preview:ready') sendDraft()
    }
    window.addEventListener('message', handleReady)
    return () => window.removeEventListener('message', handleReady)
  }, [draftMessage])

  return (
    <>
      <div className="mb-8 hidden md:block">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] uppercase text-secondary">真实前台预览</p>
          <a href={publicPath} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[12px] text-accent hover:text-white">新窗口打开 <ExternalLink size={14} /></a>
        </div>
        <div className="h-[585px] overflow-hidden border border-white/10 bg-white">
          <iframe ref={iframeRef} key={`${publicPath}-${version}`} src={previewUrl} title={`${title}真实前台预览`} onLoad={sendDraft} style={{ width: 1440, height: 900, transform: 'scale(.65)', transformOrigin: 'top left' }} />
        </div>
        <p className="mt-2 text-[12px] text-muted">{helpText || '预览按 1440px 桌面宽度等比缩放，并与正式页面使用同一组件。'}</p>
      </div>
      <a href={publicPath} target="_blank" rel="noreferrer" className="mb-6 flex min-h-11 items-center justify-center gap-2 border border-white/15 bg-white/5 text-[13px] text-white md:hidden">打开前台预览 <ExternalLink size={14} /></a>
    </>
  )
}
