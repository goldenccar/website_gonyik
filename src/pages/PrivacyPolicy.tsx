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
    <div className="bg-darker min-h-full">
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-20">
        <div
          className="prose prose-invert prose-p:text-light prose-headings:text-white prose-headings:font-medium prose-h2:text-[22px] prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-[16px] prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[14px] prose-p:leading-relaxed prose-p:mb-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}
