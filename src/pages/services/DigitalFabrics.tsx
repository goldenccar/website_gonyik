import { useEffect, useState } from 'react'
import { Navigate, useOutletContext, Link } from 'react-router-dom'
import { ArrowUpRight, Box, ScanLine, SlidersHorizontal } from 'lucide-react'
import { getDigitalFabricFormats } from '@/api/client'
import { PageSection } from '@/components/PageLayout'
import ServiceSectionHeader from '@/components/service/ServiceSectionHeader'
import { InlineMarkup } from '@/components/MarkupParser'
import type { DigitalFabricFormat } from '@/types'
import type { ServicesOutletContext } from './ServicesLayout'

const assetLayers = [
  { icon: ScanLine, title: '视觉数据', text: '颜色、纹理、法线与表面表现，支持虚拟样衣的材料呈现。' },
  { icon: SlidersHorizontal, title: '物理属性', text: '基于具体面料测试与软件参数体系，记录弯曲、拉伸、剪切等属性。' },
  { icon: Box, title: '版本交付', text: '文件与面料型号、批次及软件版本对应，避免数字材料与实物信息脱节。' },
]

export default function DigitalFabrics() {
  const { sections } = useOutletContext<ServicesOutletContext>()
  const section = sections.find((item) => item.module_type === 'digital-fabrics')
  const [formats, setFormats] = useState<DigitalFabricFormat[]>([])

  useEffect(() => {
    getDigitalFabricFormats().then((response) => setFormats(response.data.data || []))
  }, [])

  if (!section) return <Navigate to="/services" replace />

  return (
    <PageSection tone="white" className="space-y-16 md:space-y-20">
      <ServiceSectionHeader section={section} />
      <section>
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="label-en text-secondary">SUPPORTED FORMATS</p>
            <h2 className="mt-3 text-[24px] font-medium text-primary md:text-[30px]">面向两套主流工作流</h2>
          </div>
          <span className="border border-border px-3 py-1.5 text-[11px] tracking-[0.12em] text-secondary">建立中</span>
        </div>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {formats.map((item) => (
            <article key={item.id} className="bg-white px-6 py-7 md:px-8 md:py-9">
              <p className="label-en text-secondary"><InlineMarkup text={item.platform} /></p>
              <p className="mt-5 text-[34px] font-medium tracking-[-0.03em] text-primary"><InlineMarkup text={item.format} /></p>
              <p className="mt-4 text-[13px] leading-6 text-secondary"><InlineMarkup text={item.description} /></p>
            </article>
          ))}
        </div>
      </section>
      <section className="grid gap-px border border-border bg-border md:grid-cols-3">
        {assetLayers.map(({ icon: Icon, title, text }) => (
          <article key={title} className="bg-bg px-6 py-8 md:px-8 md:py-10">
            <Icon size={20} className="text-[#4e9bab]" />
            <h2 className="mt-6 text-[18px] font-medium text-primary">{title}</h2>
            <p className="mt-3 text-[14px] leading-7 text-secondary">{text}</p>
          </article>
        ))}
      </section>
      <section className="flex flex-col gap-6 border-t border-border pt-9 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-en text-secondary">PROJECT ACCESS</p>
          <h2 className="mt-3 text-[24px] font-medium text-primary">需要指定面料的数字模型？</h2>
          <p className="mt-3 max-w-[680px] text-[14px] leading-7 text-secondary">请提供目标面料型号、使用软件及项目阶段，我们将确认现有资产或数字化排期。</p>
        </div>
        <Link to="/contact" className="inline-flex shrink-0 items-center gap-3 border border-primary px-5 py-3 text-[14px] font-medium text-primary transition-colors hover:bg-primary hover:text-white">提交需求 <ArrowUpRight size={16} /></Link>
      </section>
    </PageSection>
  )
}
