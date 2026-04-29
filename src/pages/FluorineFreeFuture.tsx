import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPageConfig } from '@/api/client'
import type { PageConfig } from '@/types'

export default function FluorineFreeFuture() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)

  useEffect(() => {
    getPageConfig('fluorine-free').then((res) => setPageConfig(res.data.data))
  }, [])

  return (
    <div className="flex-1 bg-darker flex flex-col items-center justify-center text-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-label text-accent uppercase mb-4">
          {pageConfig?.page_tag || 'FLUORINE FREE FUTURE'}
        </p>
        <h1 className="text-h1 text-white mb-6">
          {pageConfig?.page_title || '探索无氟未来'}
        </h1>
        <p className="text-body text-accent max-w-[500px] mx-auto mb-10">
          {pageConfig?.page_subtitle || '页面建设中，敬请期待'}
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-white text-primary text-[14px] font-medium hover:bg-bg transition-colors"
        >
          返回首页
        </Link>
      </motion.div>
    </div>
  )
}
