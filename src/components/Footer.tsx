import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { getFooter, getSocial } from '@/api/client'
import type { FooterConfig, SocialMedia } from '@/types'

function WechatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .177-.554C23.126 18.199 24 16.58 24 14.786c0-3.26-3.064-5.891-7.062-5.928zm-2.54 2.867c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
    </svg>
  )
}

function XiaohongshuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14h-9a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5z" />
      <path d="M8 9.5h8v1H8zm0 2h8v1H8zm0 2h5v1H8z" />
    </svg>
  )
}

function DouyinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

export default function Footer() {
  const [footer, setFooter] = useState<FooterConfig | null>(null)
  const [socials, setSocials] = useState<SocialMedia[]>([])
  const [activeSocial, setActiveSocial] = useState<string | null>(null)

  useEffect(() => {
    getFooter().then((res) => setFooter(res.data.data))
    getSocial().then((res) => setSocials(res.data.data || []))
  }, [])

  const wechat = socials.find((s) => s.platform === 'wechat')
  const xiaohongshu = socials.find((s) => s.platform === 'xiaohongshu')
  const douyin = socials.find((s) => s.platform === 'douyin')

  return (
    <>
      <footer className="relative bg-darker border-t border-white/[0.08] px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left */}
          <div className="text-center md:text-left">
            <p className="text-[12px] text-muted">
              {footer?.copyright || '© 2026 港翼科技 GONYIK 版权所有'}
            </p>
            <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
              <a href={footer?.privacy_policy_link || '#'} className="text-[12px] text-muted hover:text-accent transition-colors">
                隐私政策
              </a>
              <span className="text-muted">·</span>
              <span className="text-[12px] text-muted">{footer?.icp_number || 'ICP备案号（占位）'}</span>
            </div>
          </div>

          {/* Right: Social icons */}
          <div className="flex items-center gap-5">
            {/* WeChat */}
            <div className="relative">
              <button
                className="text-muted hover:text-white transition-colors duration-200"
                onClick={() => setActiveSocial(activeSocial === 'wechat' ? null : 'wechat')}
                onMouseEnter={() => setActiveSocial('wechat')}
                onMouseLeave={() => setActiveSocial(null)}
              >
                <WechatIcon className="w-[22px] h-[22px]" />
              </button>
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-200 ${activeSocial === 'wechat' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="bg-white rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-3 w-[200px]">
                  {wechat?.qrcode_url ? (
                    <img src={wechat.qrcode_url} alt="WeChat QR" className="w-full h-auto" />
                  ) : (
                    <p className="text-[12px] text-primary text-center py-4">请关注港翼科技公众号</p>
                  )}
                </div>
                <div className="w-2 h-2 bg-white rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
              </div>
            </div>

            {/* Xiaohongshu */}
            <div className="relative">
              <button
                className="text-muted hover:text-white transition-colors duration-200"
                onClick={() => setActiveSocial(activeSocial === 'xiaohongshu' ? null : 'xiaohongshu')}
                onMouseEnter={() => setActiveSocial('xiaohongshu')}
                onMouseLeave={() => setActiveSocial(null)}
              >
                <XiaohongshuIcon className="w-[22px] h-[22px]" />
              </button>
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-200 ${activeSocial === 'xiaohongshu' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="bg-dark rounded-lg px-4 py-3 whitespace-nowrap">
                  <p className="text-[13px] text-white">{xiaohongshu?.account || '@港翼科技GONYIK'}</p>
                </div>
                <div className="w-2 h-2 bg-dark rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
              </div>
            </div>

            {/* Douyin */}
            <div className="relative">
              <button
                className="text-muted hover:text-white transition-colors duration-200"
                onClick={() => setActiveSocial(activeSocial === 'douyin' ? null : 'douyin')}
                onMouseEnter={() => setActiveSocial('douyin')}
                onMouseLeave={() => setActiveSocial(null)}
              >
                <DouyinIcon className="w-[22px] h-[22px]" />
              </button>
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-200 ${activeSocial === 'douyin' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="bg-dark rounded-lg px-4 py-3 whitespace-nowrap">
                  <p className="text-[13px] text-white">{douyin?.account || '@港翼科技GONYIK'}</p>
                </div>
                <div className="w-2 h-2 bg-dark rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin gear — absolute bottom-right */}
        <Link
          to="/admin"
          className="absolute bottom-3 right-6 lg:right-12 text-[#333333] hover:text-[#666666] transition-colors duration-200"
          title="Admin"
        >
          <Settings size={14} />
        </Link>
      </footer>
    </>
  )
}
