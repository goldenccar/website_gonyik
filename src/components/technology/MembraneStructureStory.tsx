import type { CSSProperties } from 'react'
import MarkupParser, { InlineMarkup } from '@/components/MarkupParser'
import MotionInView from '@/components/MotionInView'
import MembraneWaterproofVisual from '@/components/technology/MembraneWaterproofVisual'
import { useSiteLocale } from '@/i18n/SiteLocale'
import type { FluorineSection, TechnologyContentBlock } from '@/types'

const FALLBACK_BLOCK: TechnologyContentBlock = {
  key: 'transport-mechanism',
  title: '水汽如何穿过一层防水膜',
  content: '防水透湿膜需要完成两件看似相反的事：阻挡外部液态水，同时让人体产生的水汽持续向外释放。不同膜结构实现透湿的路径并不相同。/h传统无孔膜依靠材料对水分子的吸附、扩散与解吸完成传递；RPO-SOTEX 则在连续膜体内部形成细小、不规则且相互连通的超微孔，让水汽经孔道向外扩散。',
}

const FALLBACK_PERFORMANCE_BLOCK: TechnologyContentBlock = {
  key: 'performance-foundation',
  title: '一张膜，需要同时成立的性能',
  content: 'RPO-SOTEX 基于增韧聚烯烃材料体系与微孔结构调控，将聚烯烃材料、连通超微孔和高强韧膜体结合在同一结构中。/h它追求的不是某一个孤立指标的峰值，而是在复合加工与长期使用中，持续维持防水、透湿、强韧和耐候之间的平衡。',
  items: [
    { title: '减少含氟依赖', content: 'RPO-SOTEX 采用聚烯烃材料体系，从核心膜层减少对含氟材料的依赖。经 SGS 对数百种目标 PFAS 进行检测，结果均未检出。' },
    { title: '超微孔直接传递', content: '膜体内部形成细小、连续的微孔结构，为水汽提供直接的传递通道，减少对材料吸湿扩散过程的依赖。' },
    { title: '强韧与耐候基础', content: '高强韧膜体为后续复合加工、反复弯折、磨损和环境变化中的稳定表现提供材料基础。' },
  ],
}

const FALLBACK_WATERPROOF_BLOCK: TechnologyContentBlock = {
  key: 'waterproof-mechanism',
  title: '透气膜怎么防水',
  content: '水汽可以沿连通微孔向外扩散，液态水面对的却是另一套界面条件。RPO-SOTEX 的疏水微孔远小于液滴，水在孔口形成弯月面；只有当外部水压超过孔隙对应的进入压力，液态水才可能进入膜层。/h因此，防水能力并不是把孔完全封死，而是通过材料表面性质、孔径分布与膜层均匀性共同建立稳定的液态水屏障。',
}

function MaterialPathPanel({ kind, image, title, mechanism, featured = false }: {
  kind: 'dense' | 'porous'
  image: string
  title: string
  mechanism: string
  featured?: boolean
}) {
  const { t } = useSiteLocale()

  return (
    <div className={`pfas-path-panel pfas-path-panel-${kind} ${featured ? 'is-featured' : ''}`}>
      <div className="pfas-path-media">
        <img src={image} alt="" loading="lazy" decoding="async" />
        <div className="pfas-vapor-field" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {kind === 'porous' && (
          <div className="membrane-thickness-marker" aria-label={t('膜层厚度小于 5 微米')}>
            <span className="membrane-thickness-bracket" aria-hidden="true" />
            <span className="membrane-thickness-copy"><small>{t('膜层厚度')}</small>&lt; 5 μm</span>
          </div>
        )}
      </div>
      <div className="pfas-path-caption">
        <h3>{t(title)}</h3>
        <p>{t(mechanism)}</p>
      </div>
    </div>
  )
}

export default function MembraneStructureStory({ section }: { section: FluorineSection }) {
  const block = section.content_blocks?.find((item) => item.key === 'transport-mechanism') || FALLBACK_BLOCK
  const waterproofBlock = section.content_blocks?.find((item) => item.key === 'waterproof-mechanism') || FALLBACK_WATERPROOF_BLOCK
  const performanceBlock = section.content_blocks?.find((item) => item.key === 'performance-foundation') || FALLBACK_PERFORMANCE_BLOCK

  return (
    <>
      <section className="bg-bg px-4 pb-4 md:px-6 md:pb-6">
        <MotionInView className="mx-auto w-full max-w-[1600px] bg-white px-7 py-14 md:px-12 md:py-16 lg:px-20">
          <div data-motion-item className="max-w-[880px]">
            <MarkupParser text={section.content} className="technical-copy text-secondary" />
            <p className="mt-5 text-[12px] leading-6 text-secondary">“未检出”指报告所列目标物低于相应方法检出限，具体检测范围以技术资料为准。</p>
          </div>
        </MotionInView>
      </section>

      <section className="bg-bg px-4 pb-4 md:px-6 md:pb-6">
        <MotionInView className="membrane-structure-story mx-auto w-full max-w-[1600px] bg-white px-7 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
          <div className="membrane-chapter-intro membrane-chapter-intro--lead grid gap-7 lg:grid-cols-[minmax(300px,0.9fr)_minmax(420px,1.1fr)] lg:items-start lg:gap-20">
            <div data-motion-item>
              <h2 className="type-section-title max-w-[720px] text-balance text-primary">
                <InlineMarkup text={block.title} />
              </h2>
            </div>
            <div data-motion-item className="membrane-chapter-copy" style={{ '--motion-delay': '90ms' } as CSSProperties}>
              <MarkupParser text={block.content} className="technical-copy max-w-[680px] text-secondary" />
            </div>
          </div>

          <div data-motion-item style={{ '--motion-delay': '140ms' } as CSSProperties} className="pfas-path-comparison mt-14">
            <MaterialPathPanel
              kind="dense"
              image="/visuals/pfas-microstructure-dense-v3.webp"
              title="传统无孔结构"
              mechanism="吸湿—扩散—解吸"
            />
            <MaterialPathPanel
              kind="porous"
              image="/visuals/pfas-microstructure-porous-v4.webp"
              title="RPO-SOTEX 超微孔结构"
              mechanism="连通微孔—直接传递"
              featured
            />
          </div>
        </MotionInView>
      </section>

      <section className="bg-bg px-4 pb-4 md:px-6 md:pb-6">
        <MotionInView className="membrane-waterproof-story mx-auto w-full max-w-[1600px] bg-white px-7 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
          <div className="membrane-chapter-intro membrane-chapter-intro--offset">
            <div data-motion-item>
              <h2 className="type-section-title max-w-[720px] text-balance text-primary">
                <InlineMarkup text={waterproofBlock.title} />
              </h2>
            </div>
            <div data-motion-item className="membrane-chapter-copy lg:ml-[18%]" style={{ '--motion-delay': '90ms' } as CSSProperties}>
              <MarkupParser text={waterproofBlock.content} className="technical-copy max-w-[680px] text-secondary" />
            </div>
          </div>
          <div data-motion-item style={{ '--motion-delay': '140ms' } as CSSProperties} className="mt-14">
            <MembraneWaterproofVisual />
          </div>
        </MotionInView>
      </section>

      <section className="bg-bg px-4 pb-4 md:px-6 md:pb-6">
        <MotionInView className="membrane-performance-story mx-auto w-full max-w-[1600px] bg-white px-7 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
          <div className="membrane-chapter-intro membrane-chapter-intro--finish grid gap-7 lg:grid-cols-[minmax(320px,1.04fr)_minmax(420px,0.96fr)] lg:items-start lg:gap-24">
            <div data-motion-item>
              <h2 className="type-section-title max-w-[720px] text-balance text-primary">
                <InlineMarkup text={performanceBlock.title} />
              </h2>
            </div>
            <div data-motion-item className="membrane-chapter-copy" style={{ '--motion-delay': '90ms' } as CSSProperties}>
              <MarkupParser text={performanceBlock.content} className="technical-copy max-w-[680px] text-secondary" />
            </div>
          </div>

          <div className="membrane-performance-layout mt-14">
            <div data-motion-item style={{ '--motion-delay': '130ms' } as CSSProperties} className="membrane-performance-media">
              <img src="/visuals/membrane-waterdrops-v3.webp" alt="RPO-SOTEX 超微孔功能膜" loading="lazy" decoding="async" />
            </div>
            <div className="membrane-performance-points">
              {(performanceBlock.items || []).slice(0, 3).map((item, index) => (
                <article key={item.title} data-motion-item style={{ '--motion-delay': `${170 + index * 70}ms` } as CSSProperties} className="membrane-performance-point">
                  <h3><InlineMarkup text={item.title} /></h3>
                  <p><InlineMarkup text={item.content} /></p>
                </article>
              ))}
            </div>
          </div>
        </MotionInView>
      </section>
    </>
  )
}
