import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCareGuides, getFaqs, getPageConfig } from '@/api/client'
import ContentTabs from '@/components/ContentTabs'
import HorizontalRail from '@/components/HorizontalRail'
import PageHero from '@/components/PageHero'
import { PageSection, PageShell } from '@/components/PageLayout'
import type { CareGuide, FAQ, PageConfig } from '@/types'

const TABS = [{ id: 'care', label: '洗涤保养' }, { id: 'faq', label: '常见问题' }, { id: 'contact', label: '联系我们' }]

export default function ServicesSupport() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [care, setCare] = useState<CareGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [active, setActive] = useState('care')
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getPageConfig('services'), getCareGuides(), getFaqs()]).then(([config, guides, questions]) => {
      setPage(config.data.data)
      setCare(guides.data.data || [])
      setFaqs(questions.data.data || [])
    })
  }, [])

  return (
    <PageShell>
      <PageHero tag={page?.page_tag || 'CARE & SUPPORT'} title={page?.page_title || '服务与支持'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="功能面料洗涤与保养" />
      <PageSection className="!py-9 lg:!py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-14">
          <div className="lg:col-span-3"><ContentTabs label="服务目录" items={TABS} active={active} onChange={setActive} /></div>
          <div className="lg:col-span-9" aria-live="polite">
            {active === 'care' && <section><p className="text-label text-secondary">CARE</p><h2 className="mt-3 text-[34px] font-bold text-primary">洗涤与保养</h2><p className="mt-3 text-body text-secondary">正确清洗与保养，有助于维持材料的防护和舒适表现。</p><div className="mt-8"><HorizontalRail label="洗涤保养步骤">{care.map((item, index) => <article key={item.id} className="snap-start border-t border-primary pt-5"><p className="text-label text-secondary">{String(index + 1).padStart(2, '0')}</p><h3 className="mt-4 text-h5 text-primary">{item.title}</h3><p className="mt-3 text-[14px] leading-7 text-secondary">{item.content}</p></article>)}</HorizontalRail></div></section>}
            {active === 'faq' && <section><p className="text-label text-secondary">Q&A</p><h2 className="mt-3 text-[34px] font-bold text-primary">常见问题</h2><div className="mt-7 border-t border-border">{faqs.map((item) => <article key={item.id} className="border-b border-border"><button onClick={() => setOpen(open === item.id ? null : item.id)} className="flex w-full items-center justify-between py-5 text-left text-[16px] font-medium text-primary"><span>{item.question}</span><span>{open === item.id ? '−' : '+'}</span></button>{open === item.id && <p className="max-w-[720px] pb-5 text-body text-secondary">{item.answer}</p>}</article>)}</div></section>}
            {active === 'contact' && <section><p className="text-label text-secondary">CONTACT</p><h2 className="mt-3 text-[34px] font-bold text-primary">材料建议、样品与合作咨询</h2><p className="mt-4 max-w-[680px] text-body text-secondary">告诉我们使用环境、目标性能和项目阶段，我们会根据已有材料或开发需求提供对应支持。</p><Link to="/contact" className="mt-8 inline-block bg-dark px-6 py-3 text-[14px] font-medium text-white">进入联系页面</Link></section>}
          </div>
        </div>
      </PageSection>
    </PageShell>
  )
}
