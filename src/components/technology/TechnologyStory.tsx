import type { CSSProperties, ReactNode } from 'react'
import type { CertificationLogo, FluorineSection, TechnologyContentBlock } from '@/types'
import MarkupParser, { InlineMarkup } from '@/components/MarkupParser'
import { LaminationDiagram, SupplyChainDiagram } from '@/components/HomeTechnicalVisuals'

export type TechnologyStoryKind = 'fiber' | 'lamination' | 'supply' | 'testing'

const DEFAULT_CERTIFICATION_LOGOS: CertificationLogo[] = [
  { name: 'bluesign', image_url: '/brandmarks/bluesign.svg' },
  { name: 'Global Recycled Standard', image_url: '/brandmarks/grs.svg' },
  { name: 'OEKO-TEX', image_url: '/brandmarks/oeko-tex.svg' },
]

const FALLBACK_STORIES: Record<TechnologyStoryKind, TechnologyContentBlock[]> = {
  fiber: [
    {
      key: 'fiber-formula',
      title: '高性能，来自于正确的纤维配方',
      content: '一块面料的强度、重量、触感与耐用性，在织造成形之前就已经从纤维开始。港翼根据使用环境，将 RPO 高性能纤维与其他高品质纤维组合，并进一步匹配纱线规格与织物组织，让不同材料各自承担增强、耐磨、弹性或舒适的作用。/h这套配方由拥有二十余年织造与染整经验的核心纺织合作伙伴共同转化为稳定的织物结构。',
      highlights: ['RPO 高性能纤维', '其他高品质纤维', '纱线与织物组织'],
    },
    {
      key: 'fiber-specific-strength',
      title: '更轻的结构，仍然保留防护余量',
      content: 'RPO 高性能纤维具有突出的比强度、耐磨性与耐候基础，可在较低材料重量下提供有效增强。面向轻量防护、高磨损区域或需要长期使用的产品，港翼通过纤维比例与组织密度的调整，把材料能力放在真正需要的位置。',
      items: [
        { title: '高比强度', content: '以更少的材料重量，为织物提供有效的承载与增强基础。' },
        { title: '耐磨增强', content: '针对高接触、高摩擦区域，提高织物抵抗持续磨耗的能力。' },
        { title: '耐候基础', content: '为户外暴露、反复使用和复杂环境中的性能保持提供材料基础。' },
      ],
    },
  ],
  lamination: [
    {
      key: 'lamination-interface',
      title: '三层材料，最终成为一块面料',
      content: '面层决定外观、触感与表面防护，RPO-SOTEX 功能膜承担防水透湿，内层则影响贴肤体验与结构保护。真正的复合不是简单地把三层粘在一起，而是让它们在弯折、拉伸、湿热与持续穿着中保持协同。',
      highlights: ['面层', 'RPO-SOTEX 功能膜', '内层'],
    },
    {
      key: 'lamination-window',
      title: '为 RPO-SOTEX 建立专属复合工艺',
      content: 'RPO-SOTEX 的材料特性使传统复合参数难以直接套用。港翼围绕胶黏剂体系、施胶结构、温度与压力、速度与张力持续建立专属工艺窗口，使层间结合达到可靠水平，同时保留膜层的透湿能力、面料手感与耐久表现。',
      items: [
        { title: '可靠结合', content: '使面层、功能层与内层在反复使用中维持完整结构。' },
        { title: '保留透湿', content: '控制施胶形态与覆盖关系，避免功能通道被不必要地占用。' },
        { title: '兼顾手感', content: '让复合后的面料仍具有适合具体产品的柔软度与活动自由度。' },
        { title: '面向耐久', content: '围绕湿热、弯折与洗护条件，持续优化层间稳定性。' },
      ],
    },
  ],
  supply: [
    {
      key: 'supply-chain',
      title: '让材料能力沿着产业链完整传递',
      content: '一块高性能面料，来自纤维、织造、染整、功能膜与复合工艺的连续协同。港翼把底层材料开发与成熟纺织制造能力连接起来，让每一个生产环节都围绕最终应用共同工作。',
    },
    {
      key: 'supply-foundation',
      title: '二十余年的纺织经验，进入新的材料体系',
      content: '核心纺织合作伙伴长期积累的织造与染整能力，为纤维选择、织物开发、颜色与手感控制提供成熟基础。港翼在此基础上引入 RPO-SOTEX 功能膜与无氟技术路径，把新的材料能力转化为可制造的面料产品。',
      highlights: ['纤维与纱线', '织造与染整', '功能膜', '复合与成品'],
    },
    {
      key: 'supply-assurance',
      title: '材料信息与品质依据，同步进入开发过程',
      content: '港翼优选具备 bluesign®、GRS、OEKO-TEX® 认证基础的面料与供应链合作伙伴。具体适用范围以对应产品资料为准。',
    },
  ],
  testing: [
    {
      key: 'testing-chain',
      title: '验证，从单项材料开始',
      content: '纤维、织物、RPO-SOTEX 功能膜与胶黏剂先分别进行基础检查，再进入复合结构。只有每一种材料都与目标产品相匹配，后续测试得到的结果才真正对应这块面料。',
    },
    {
      key: 'testing-lab',
      title: '从内部实验，到独立第三方验证',
      content: '港翼围绕材料筛选、结构开发、样品对比与耐久表现开展内部测试，并根据具体产品与项目要求，由 SGS、中纺标 CTTC 等专业机构进行独立检测。',
      highlights: ['内部研发测试', '生产过程验证', '独立第三方检测'],
    },
    {
      key: 'testing-result',
      title: '从性能数据，到产品选择',
      content: '防水、透湿、耐磨、强度与耐久等关键表现，最终都要服务于真实产品。港翼为品牌提供面料型号、性能信息与技术支持，帮助开发团队更快比较方案、确认选材并推进打样。',
    },
  ],
}

function getBlocks(kind: TechnologyStoryKind, section: FluorineSection) {
  const fallback = FALLBACK_STORIES[kind]
  const source = section.content_blocks || []
  return fallback.map((block) => {
    const saved = source.find((item) => item.key === block.key)
    return saved ? { ...block, ...saved } : block
  })
}

function StoryIntro({ block, align = 'split' }: { block: TechnologyContentBlock; align?: 'split' | 'offset' }) {
  return (
    <div className={`technology-narrative-intro is-${align}`}>
      <h2><InlineMarkup text={block.title} /></h2>
      <div>
        <MarkupParser text={block.content} className="technical-copy text-secondary" />
        {block.highlights?.length ? (
          <div className="technology-narrative-tags">
            {block.highlights.map((item) => <span key={item}>{item}</span>)}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FiberFormulaVisual() {
  return (
    <div className="fiber-material-stage" role="img" aria-label="RPO 高性能纤维与其他高品质纤维协同进入纱线和织物结构">
      <div className="fiber-material-copy">
        <span>材料组合</span>
        <strong>不是单一纤维的堆叠，<br />而是针对应用的协同。</strong>
      </div>
      <div className="fiber-material-visual" aria-hidden="true">
        <div className="fiber-material-bundle is-rpo">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
        <div className="fiber-material-bundle is-support">{Array.from({ length: 11 }, (_, index) => <i key={index} />)}</div>
        <div className="fiber-material-weave" />
      </div>
      <div className="fiber-material-legend">
        <span><i />RPO 高性能纤维<small>增强 · 轻量 · 耐磨</small></span>
        <span><i />其他高品质纤维<small>触感 · 弹性 · 结构</small></span>
        <span><i />面向应用的织物结构<small>纱线规格与组织共同设计</small></span>
      </div>
    </div>
  )
}

function FiberCapabilityEditorial({ items }: { items: NonNullable<TechnologyContentBlock['items']> }) {
  return (
    <div className="fiber-capability-editorial">
      {items.map((item, index) => (
        <article key={item.title}>
          <div className={`fiber-capability-symbol is-${index + 1}`} aria-hidden="true"><i /><i /><i /><i /></div>
          <h3><InlineMarkup text={item.title} /></h3>
          <p><InlineMarkup text={item.content} /></p>
        </article>
      ))}
    </div>
  )
}

function LaminationLayersVisual() {
  return (
    <div className="lamination-layer-stage">
      <div className="lamination-layer-roles">
        <article><span>面层</span><p>外观、触感与表面防护</p></article>
        <article><span>功能膜</span><p>防水、透湿与结构界面</p></article>
        <article><span>内层</span><p>贴肤体验与膜层保护</p></article>
      </div>
      <div className="lamination-layer-motion">
        <LaminationDiagram />
        <p>三层材料在复合后形成一套协同工作的面料结构</p>
      </div>
    </div>
  )
}

function LaminationWindowVisual() {
  return (
    <div className="lamination-window-visual" role="img" aria-label="复合工艺条件共同形成可靠结合、透湿、手感与耐久表现">
      <div className="lamination-window-inputs">
        {['胶黏剂体系', '施胶结构', '温度与压力', '速度与张力'].map((item) => <span key={item}>{item}</span>)}
      </div>
      <div className="lamination-window-core"><i aria-hidden="true" /><strong>RPO-SOTEX<br />专属工艺窗口</strong></div>
      <div className="lamination-window-output"><span>可靠结合</span><span>透湿表现</span><span>面料手感</span><span>耐久稳定</span></div>
    </div>
  )
}

function SupplyFlowVisual() {
  return (
    <div className="supply-story-visual">
      <SupplyChainDiagram />
      <div className="supply-story-track" aria-hidden="true">
        {['材料', '织造', '染整', '复合', '应用'].map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  )
}

function SupplyFoundationVisual() {
  return (
    <div className="supply-foundation-visual">
      <div className="supply-foundation-years"><strong>20<sup>+</sup></strong><span>年织造与染整经验</span></div>
      <div className="supply-foundation-weave" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="supply-foundation-capabilities">
        {['纤维选择', '织物开发', '染整控制', '功能复合'].map((item) => (
          <span key={item}><i aria-hidden="true" />{item}</span>
        ))}
      </div>
    </div>
  )
}

function TestingFlowVisual() {
  return (
    <div className="testing-flow-visual" role="img" aria-label="纤维、织物、功能膜和胶黏剂经过复合样品、内部实验与第三方检测">
      <div className="testing-material-inputs">{['纤维', '织物', '功能膜', '胶黏剂'].map((item) => <span key={item}>{item}</span>)}</div>
      <div className="testing-flow-arrow" aria-hidden="true" />
      <div className="testing-flow-stage"><strong>复合样品</strong><small>结构与工艺匹配</small></div>
      <div className="testing-flow-arrow" aria-hidden="true" />
      <div className="testing-flow-stage is-lab"><strong>内部实验</strong><small>性能与耐久对比</small></div>
      <div className="testing-flow-arrow" aria-hidden="true" />
      <div className="testing-flow-stage is-third"><strong>第三方检测</strong><small>SGS · CTTC</small></div>
    </div>
  )
}

function SectionShell({ children, tone = 'white' }: { children: ReactNode; tone?: 'white' | 'mist' | 'navy' }) {
  return <section className={`technology-narrative-section is-${tone}`}><div className="technology-narrative-inner">{children}</div></section>
}

function FiberStory({ blocks }: { blocks: TechnologyContentBlock[] }) {
  return <>
    <SectionShell><StoryIntro block={blocks[0]} /><FiberFormulaVisual /></SectionShell>
    <SectionShell tone="mist"><StoryIntro block={blocks[1]} align="offset" />{blocks[1].items && <FiberCapabilityEditorial items={blocks[1].items} />}</SectionShell>
  </>
}

function LaminationStory({ blocks }: { blocks: TechnologyContentBlock[] }) {
  return <>
    <SectionShell><StoryIntro block={blocks[0]} /><LaminationLayersVisual /></SectionShell>
    <SectionShell tone="mist"><StoryIntro block={blocks[1]} align="offset" /><LaminationWindowVisual /></SectionShell>
  </>
}

function SupplyStory({ blocks, certificationLogos }: { blocks: TechnologyContentBlock[]; certificationLogos?: CertificationLogo[] }) {
  const logos = (certificationLogos || DEFAULT_CERTIFICATION_LOGOS).filter((item) => item.name && item.image_url).slice(0, 8)
  return <>
    <SectionShell><StoryIntro block={blocks[0]} /><SupplyFlowVisual /></SectionShell>
    <SectionShell tone="navy"><StoryIntro block={blocks[1]} /><SupplyFoundationVisual /></SectionShell>
    <SectionShell><div className="supply-assurance-layout"><StoryIntro block={blocks[2]} align="offset" />{logos.length > 0 && <div className="supply-certification-marks" aria-label="供应链相关认证" style={{ '--certification-logo-count': logos.length } as CSSProperties}>{logos.map((logo) => <span key={`${logo.name}-${logo.image_url}`}><img src={logo.image_url} alt={logo.name} loading="lazy" decoding="async" /></span>)}</div>}</div></SectionShell>
  </>
}

function TestingStory({ blocks }: { blocks: TechnologyContentBlock[] }) {
  return <>
    <SectionShell><StoryIntro block={blocks[0]} /><TestingFlowVisual /></SectionShell>
    <SectionShell tone="mist"><StoryIntro block={blocks[1]} align="offset" /><div className="testing-capability-strip">{['防水与透湿', '耐磨与强度', '弯折与耐久', '结构与工艺'].map((item) => <span key={item}>{item}</span>)}</div></SectionShell>
    <SectionShell><div className="testing-result-layout"><StoryIntro block={blocks[2]} /><div className="testing-result-proof"><i aria-hidden="true" /><strong>明确型号<br />核心性能<br />应用建议</strong><span>支持选材、打样与产品开发</span></div></div></SectionShell>
  </>
}

export default function TechnologyStory({ kind, section }: { kind: TechnologyStoryKind; section: FluorineSection }) {
  const blocks = getBlocks(kind, section)
  if (kind === 'fiber') return <FiberStory blocks={blocks} />
  if (kind === 'lamination') return <LaminationStory blocks={blocks} />
  if (kind === 'supply') return <SupplyStory blocks={blocks} certificationLogos={section.certification_logos} />
  return <TestingStory blocks={blocks} />
}
