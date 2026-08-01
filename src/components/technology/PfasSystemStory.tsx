import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import type { FluorineSection, TechnologyContentBlock } from '@/types'
import { SupplyChainDiagram, useSupplyChainReady } from '@/components/HomeTechnicalVisuals'
import MarkupParser, { InlineMarkup } from '@/components/MarkupParser'
import MotionInView from '@/components/MotionInView'
import { getTechnologyPagePath } from '@/config/technologyPages'
import { useSiteLocale } from '@/i18n/SiteLocale'

const FALLBACK_BLOCKS: TechnologyContentBlock[] = [
  {
    key: 'why-change',
    title: '高性能材料，需要一条新的路径',
    content: '过去数十年，许多高性能防水透湿产品依赖含氟膜材料与含氟拒水整理，以获得稳定的防水、透湿和表面防护表现。/h随着部分 PFAS 的环境持久性、潜在健康影响及相关风险得到进一步确认，全球监管正在持续收紧。行业需要解决的，已经不只是去掉某一种化学品，而是在减少含氟依赖的同时，保留真正有价值的性能与穿着体验。',
    highlights: ['环境危害', '健康风险', '监管收紧', '性能要求'],
  },
  {
    key: 'system-rebuild',
    title: '从单点替代，转向系统协同',
    content: '无氟不是简单替换一张膜或一种整理剂。化学体系的变化，会同时影响防水、透湿、粘合、手感、耐久与制造稳定性。/h港翼把材料、结构、工艺和验证放在同一条开发路径中，让各环节围绕最终使用体验共同校准，而不是把性能压力留给某一个孤立部件。',
    items: [
      { title: '材料基础', content: '围绕无氟膜、高性能纤维与胶黏体系建立底层能力。' },
      { title: '结构与工艺', content: '协同织物结构、复合方式与无氟功能整理。' },
      { title: '制造适配', content: '把实验室方案转化为可重复、可追溯的生产条件。' },
      { title: '验证闭环', content: '从材料、面料到成品逐级确认性能与耐久表现。' },
    ],
  },
  {
    key: 'from-material-to-product',
    title: '从一片功能膜，走向完整的产品体系',
    content: '港翼以 RPO-SOTEX 超微孔功能膜等核心材料为基础，将织物结构、复合工艺、无氟整理与供应链协同纳入同一开发体系。/h这套体系最终形成可制造、可验证的功能面料，并进一步服务于成衣、鞋履材料和专业装备等终端应用。',
  },
]

const WHY_SIGNAL_COPY = [
  { title: '环境危害', content: '持久存在并可能长期累积', kind: 'environment' },
  { title: '健康风险', content: '部分 PFAS 存在潜在健康威胁', kind: 'health' },
  { title: '监管收紧', content: '主要市场限制持续强化', kind: 'regulation' },
  { title: '性能要求', content: '关键防护体验不能退让', kind: 'performance' },
] as const

function StoryHeading({ title }: { title: string }) {
  return (
    <div data-motion-item className="pfas-story-heading">
      <h2 className="type-section-title max-w-[720px] text-balance text-primary"><InlineMarkup text={title} /></h2>
    </div>
  )
}

function SignalGlyph({ kind }: { kind: string }) {
  if (kind === 'environment') {
    return (
      <svg viewBox="0 0 72 48" aria-hidden="true">
        <circle className="pfas-glyph-core" cx="22" cy="24" r="3" />
        <circle className="pfas-glyph-ring pfas-glyph-ring-a" cx="22" cy="24" r="9" />
        <circle className="pfas-glyph-ring pfas-glyph-ring-b" cx="22" cy="24" r="16" />
        <path className="pfas-glyph-line" d="M43 15c8 3 12 8 15 17" />
        <circle className="pfas-glyph-dot" cx="57" cy="35" r="2" />
      </svg>
    )
  }
  if (kind === 'health') {
    return (
      <svg viewBox="0 0 72 48" aria-hidden="true">
        <path className="pfas-glyph-line" d="M36 7c9 5 15 6 21 7v10c0 10-8 16-21 19-13-3-21-9-21-19V14c6-1 12-2 21-7Z" />
        <circle className="pfas-glyph-dot pfas-glyph-dot-a" cx="27" cy="23" r="2" />
        <circle className="pfas-glyph-dot pfas-glyph-dot-b" cx="36" cy="29" r="2.5" />
        <circle className="pfas-glyph-dot pfas-glyph-dot-c" cx="45" cy="21" r="1.7" />
      </svg>
    )
  }
  if (kind === 'regulation') {
    return (
      <svg viewBox="0 0 72 48" aria-hidden="true">
        <path className="pfas-glyph-line" d="M9 11h54M15 24h42M22 37h28" />
        <path className="pfas-glyph-accent" d="m59 8 4 3-4 3M53 21l4 3-4 3M46 34l4 3-4 3" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 72 48" aria-hidden="true">
      <path className="pfas-glyph-line" d="M8 34c10 0 11-19 21-19s11 19 21 19 10-11 14-11" />
      <path className="pfas-glyph-accent" d="M8 39h56" />
      <circle className="pfas-glyph-core" cx="29" cy="15" r="3" />
      <circle className="pfas-glyph-core" cx="50" cy="34" r="3" />
    </svg>
  )
}

function WhySignal({ title, content, kind }: { title: string; content: string; kind: string }) {
  return (
    <div className="pfas-signal" data-motion-item>
      <div className="pfas-signal-visual"><SignalGlyph kind={kind} /></div>
      <div>
        <h3><InlineMarkup text={title} /></h3>
        <p><InlineMarkup text={content} /></p>
      </div>
    </div>
  )
}

function SystemWorkbench({
  title,
  content,
  items,
}: {
  title: string
  content: string
  items: TechnologyContentBlock['items']
}) {
  return (
    <figure className="pfas-system-workbench text-white">
      <div className="pfas-system-workbench-media">
        <img
          src="/visuals/pfas-system-workbench-v1.webp"
          alt="从核心材料、织物结构、复合加工到验证工具的无氟材料研发工作台"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="pfas-system-workbench-shade" />
      <div className="pfas-system-workbench-content">
        <div className="pfas-system-workbench-intro">
          <div data-motion-item>
            <h2 className="type-section-title max-w-[600px] text-balance text-white"><InlineMarkup text={title} /></h2>
          </div>
          <div data-motion-item style={{ '--motion-delay': '90ms' } as CSSProperties}>
            <MarkupParser text={content} className="technical-copy max-w-[650px] text-white/78" />
          </div>
        </div>
        <figcaption className="pfas-system-caption-grid">
          {(items || []).slice(0, 4).map((item, index) => (
            <div key={item.title} className="pfas-system-caption" data-motion-item style={{ '--motion-delay': `${150 + index * 70}ms` } as CSSProperties}>
              <h3><InlineMarkup text={item.title} /></h3>
              <p><InlineMarkup text={item.content} /></p>
            </div>
          ))}
        </figcaption>
      </div>
    </figure>
  )
}

export default function PfasSystemStory({ section }: { section: FluorineSection }) {
  const { path: localePath } = useSiteLocale()
  const blocks = section.content_blocks?.length ? section.content_blocks : FALLBACK_BLOCKS
  const whyBlock = blocks.find((block) => block.key === 'why-change') || blocks[0] || FALLBACK_BLOCKS[0]
  const systemBlock = blocks.find((block) => block.key === 'system-rebuild')
    || blocks.find((block) => block.key === 'new-structure')
    || blocks[1]
    || FALLBACK_BLOCKS[1]
  const productBlock = blocks.find((block) => block.key === 'from-material-to-product') || blocks[2] || FALLBACK_BLOCKS[2]
  const supplyReady = useSupplyChainReady()

  return (
    <>
      <div className="pfas-narrative-flow bg-bg px-4 pb-4 md:px-6 md:pb-6">
        <section id="pfas-story" className="scroll-mt-28">
          <MotionInView className="pfas-story-intro mx-auto grid min-h-[680px] w-full max-w-[1600px] items-center gap-x-16 gap-y-12 bg-white px-7 py-16 md:px-12 md:py-20 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] lg:px-20">
            <div>
              <StoryHeading title={whyBlock.title} />
              <div data-motion-item style={{ '--motion-delay': '90ms' } as CSSProperties}>
                <MarkupParser text={whyBlock.content} className="technical-copy mt-7 max-w-[620px] text-secondary" />
              </div>
            </div>
            <div data-motion-item style={{ '--motion-delay': '100ms' } as CSSProperties} className="pfas-story-environment relative min-h-[360px] overflow-hidden bg-darker lg:min-h-[500px]">
              <img src="/visuals/pfas-environment-v1.webp" alt="冷色水体与冰面环境" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03182b]/22 to-transparent" />
            </div>
            <div className="pfas-signal-grid lg:col-span-2">
              {WHY_SIGNAL_COPY.map((item, index) => (
                <div key={item.title} style={{ '--motion-delay': `${160 + index * 70}ms` } as CSSProperties}>
                  <WhySignal {...item} title={(whyBlock.highlights || [])[index] || item.title} />
                </div>
              ))}
            </div>
          </MotionInView>
        </section>

        <section className="pfas-narrative-section">
          <MotionInView className="pfas-system-story mx-auto w-full max-w-[1600px] bg-white px-7 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
            <div data-motion-item>
              <SystemWorkbench title={systemBlock.title} content={systemBlock.content} items={systemBlock.items} />
            </div>
          </MotionInView>
        </section>

        <section className="pfas-narrative-section">
          <MotionInView className={`pfas-supply-story supply-chain-motion ${supplyReady ? 'media-ready' : ''} mx-auto grid min-h-[680px] w-full max-w-[1600px] items-center gap-10 overflow-hidden bg-white px-7 py-16 md:px-12 md:py-20 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] lg:gap-16 lg:px-20`}>
            <div className="relative z-10">
              <StoryHeading title={productBlock.title} />
              <div data-motion-item style={{ '--motion-delay': '90ms' } as CSSProperties}>
                <MarkupParser text={productBlock.content} className="technical-copy mt-7 max-w-[600px] text-secondary" />
              </div>
              <div data-motion-item style={{ '--motion-delay': '200ms' } as CSSProperties} className="mt-9 flex flex-col items-start gap-3 text-[14px] font-medium text-primary">
                <Link to={localePath(getTechnologyPagePath('rpo-material-platform'))} className="underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"><InlineMarkup text="了解 RPO 材料平台 →" /></Link>
                <Link to={localePath(getTechnologyPagePath('rpo-sotex-membrane'))} className="underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"><InlineMarkup text="探索核心材料 →" /></Link>
                <Link to={localePath('/fabrics')} className="underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"><InlineMarkup text="查看面料系列 →" /></Link>
              </div>
            </div>
            <div data-motion-item style={{ '--motion-delay': '120ms' } as CSSProperties} className="pfas-supply-visual relative z-0 h-[360px] min-w-0 md:h-[500px] lg:h-[560px]">
              <SupplyChainDiagram />
            </div>
          </MotionInView>
        </section>
      </div>
    </>
  )
}
