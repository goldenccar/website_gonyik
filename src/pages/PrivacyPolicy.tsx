import { useState, useEffect } from 'react'
import { getFooter } from '@/api/client'
import type { FooterConfig } from '@/types'

export default function PrivacyPolicy() {
  const [footer, setFooter] = useState<FooterConfig | null>(null)

  useEffect(() => {
    getFooter().then((res) => setFooter(res.data.data))
  }, [])

  const content = footer?.privacy_policy_content || '<p>隐私政策内容尚未配置。</p>'

  return (
    <div className="bg-darker flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 md:py-20">
          <p className="text-[11px] text-muted tracking-[0.2em] uppercase mb-4">Privacy Policy</p>
          <h1 className="text-[28px] md:text-[36px] font-bold text-white leading-tight">隐私政策</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-12 md:py-16 w-full">
        <div
          className="prose prose-invert prose-p:text-light/80 prose-headings:text-white prose-headings:font-medium prose-h2:text-[18px] prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-[15px] prose-h3:mt-6 prose-h3:mb-2 prose-p:text-[14px] prose-p:leading-relaxed prose-p:mb-3 max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}
