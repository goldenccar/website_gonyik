import { useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { MaterialTechnologyVisual, SupplyChainVisual } from '../HomeTechnicalVisuals'
import MarkupParser, { InlineMarkup } from '../MarkupParser'
import MotionInView from '../MotionInView'
import { useSiteLocale } from '@/i18n/SiteLocale'
import type { FluorineSection, TechnologyContentBlock, TechnologyMedia } from '@/types'

function ContentLink({ label, href }: { label: string; href: string }) {
  const { path } = useSiteLocale()
  return <Link className="rpo-text-link" to={path(href)}><InlineMarkup text={label} /><ArrowUpRight size={17} aria-hidden="true" /></Link>
}
function Actions({ block }: { block: TechnologyContentBlock }) {
  return block.links?.length ? <div className="rpo-actions">{block.links.map((link, index) => <ContentLink key={index} {...link} />)}</div> : null
}
function Intro({ block, compact = false }: { block: TechnologyContentBlock; compact?: boolean }) {
  return <div className={`rpo-intro ${compact ? 'rpo-intro--compact' : ''}`}>
    {block.title && <h2 className="type-section-title"><InlineMarkup text={block.title} /></h2>}
    {block.content && <MarkupParser text={block.content} className="rpo-copy" />}
  </div>
}
function Rows({ block }: { block: TechnologyContentBlock }) {
  return <div className="rpo-detail-rows">{block.items?.map((item, index) => <div key={index}>
    <span className="rpo-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3><InlineMarkup text={item.title} /></h3><MarkupParser text={item.content} className="rpo-row-copy" />
    {item.link_url && <ContentLink href={item.link_url} label={item.link_label || item.title} />}
  </div>)}</div>
}
function ContentMedia({ media }: { media: TechnologyMedia & { highlights?: string[] } }) {
  const { bootstrap } = useSiteLocale()
  const shared = bootstrap.home_config.technical_visuals
  const layerImages: Record<string, string | undefined> = { top: shared?.lamination_top_image, membrane: shared?.lamination_membrane_image, backing: shared?.lamination_backing_image, felt: shared?.lamination_backing_image }
  const visual = media.visual || 'image'
  const labels = visual.startsWith('layers-') ? media.highlights : undefined
  const layers = visual === 'layers-light' ? ['top', 'backing'] : visual === 'layers-protection' ? ['top', 'felt', 'backing'] : ['top', 'membrane', 'backing']
  return <figure className={`rpo-content-media rpo-content-media--${visual}`}>
    {visual === 'membrane' || visual === 'lamination' ? <MaterialTechnologyVisual kind={visual} /> : visual === 'supply' ? <SupplyChainVisual /> : visual.startsWith('layers-') ? <div className="rpo-layer-images" aria-hidden="true">{layers.map((layer,index) => layerImages[layer] ? <img key={layer} className={layer==='felt'?'rpo-felt-layer':undefined} src={layerImages[layer]} style={{top:`${index*25}%`}} alt="" loading="lazy" /> : null)}</div> : media.image_url ? <img src={media.image_url} alt="" loading="lazy" decoding="async" /> : null}
    {(media.caption || labels?.length) && <figcaption><InlineMarkup text={media.caption || ''} />{labels?.length ? <div className="rpo-media-labels">{labels.map((text,index)=><span key={index}><InlineMarkup text={text} /></span>)}</div> : null}</figcaption>}
  </figure>
}
function ConstructionTabs({ block }: { block: TechnologyContentBlock }) {
  const [active, setActive] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const items = block.items || []
  const selected = Math.min(active, Math.max(0, items.length - 1))
  const change = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowRight'?1:-1)+items.length)%items.length
    setActive(next); buttons.current[next]?.focus()
  }
  return <div className="rpo-constructions"><div className="rpo-tabs" role="tablist" aria-label={block.title}>{items.map((item,index)=><button key={index} id={`${block.key}-tab-${index}`} ref={el=>{buttons.current[index]=el}} type="button" role="tab" aria-selected={selected===index} aria-controls={`${block.key}-panel-${index}`} tabIndex={selected===index?0:-1} onClick={()=>setActive(index)} onKeyDown={event=>change(event,index)}><InlineMarkup text={item.title} /></button>)}</div>
    {items.map((item,index)=><div key={index} id={`${block.key}-panel-${index}`} role="tabpanel" aria-labelledby={`${block.key}-tab-${index}`} tabIndex={0} hidden={selected!==index} className="rpo-construction-panel"><ContentMedia media={item} /><div><h3><InlineMarkup text={item.title} /></h3><MarkupParser text={item.content} className="rpo-copy" />{item.link_url && <ContentLink href={item.link_url} label={item.link_label || item.title} />}</div></div>)}
  </div>
}
function Cards({ block }: { block: TechnologyContentBlock }) {
  const { path }=useSiteLocale()
  return <div className={`rpo-${block.layout==='series'?'series-links':'material-grid'}`}>{block.items?.map((item,index)=>{
    const content=<><ContentMedia media={item} /><div className="rpo-card-copy"><span className="rpo-index" aria-hidden="true">0{index+1}</span><h3><InlineMarkup text={item.title} /></h3>{item.link_url && <ArrowUpRight size={21} aria-hidden="true" />}<MarkupParser text={item.content} className="rpo-card-description" /></div></>
    return item.link_url ? <Link className={block.layout==='series'?'rpo-series-card':'rpo-material-card'} to={path(item.link_url)} key={index}>{content}</Link> : <article className="rpo-material-card" key={index}>{content}</article>
  })}</div>
}
function Chapter({ block }: { block: TechnologyContentBlock }) {
  const layout=block.layout || 'checklist'
  if(layout==='cards'||layout==='series') return <><Intro block={block} /><Cards block={block} /><Actions block={block} /></>
  if(layout==='delivery') return <><Intro block={block} /><div className="rpo-delivery-grid">{block.items?.map((item,index)=><article key={index}><div className="rpo-delivery-visual"><ContentMedia media={item} /></div><div className="rpo-delivery-copy"><h3><InlineMarkup text={item.title} /></h3><MarkupParser text={item.content} className="rpo-copy" />{item.link_url&&<ContentLink label={item.link_label||item.title} href={item.link_url} />}</div></article>)}</div></>
  if(layout==='split') return <div className="rpo-feature-grid rpo-handfeel"><div><Intro compact block={block} />{block.highlights?.length ? <div className="rpo-highlights">{block.highlights.map((text,index)=><span key={index}><InlineMarkup text={text} /></span>)}</div>:null}<Actions block={block} /></div><ContentMedia media={block} /></div>
  if(layout==='comparison') return <><Intro block={block}/><MotionInView className="pfas-path-comparison">{block.items?.map((item,index)=><div key={index} className={`pfas-path-panel pfas-path-panel-${index?'porous':'dense'} ${index?'is-featured':''}`}><div className="pfas-path-media"><img src={item.image_url} alt="" loading="lazy"/><div className="pfas-vapor-field" aria-hidden="true"><span/><span/><span/></div>{item.caption&&<div className="rpo-comparison-caption"><InlineMarkup text={item.caption}/></div>}</div><div className="pfas-path-caption"><h3><InlineMarkup text={item.title}/></h3><p><InlineMarkup text={item.content}/></p></div></div>)}</MotionInView></>
  if(layout==='feature') return <><Intro block={block}/><div className="rpo-feature-grid"><ContentMedia media={block}/><Rows block={block}/></div><Actions block={block}/></>
  if(layout==='tabs') return <><Intro block={block}/><ConstructionTabs block={block}/><Actions block={block}/></>
  if(layout==='steps') return <><Intro block={block}/><ol className="rpo-workflow">{block.items?.map((item,index)=><li key={index}><span className="rpo-index" aria-hidden="true">0{index+1}</span><h3><InlineMarkup text={item.title}/></h3><MarkupParser text={item.content} className="rpo-copy"/></li>)}</ol></>
  if(layout==='columns') return <><Intro block={block}/><Rows block={block}/><Actions block={block}/></>
  if(layout==='matrix') return <><Intro block={block}/><div className="rpo-editorial-grid">{block.items?.map((item,index)=><article key={index}><h3><InlineMarkup text={item.title}/></h3><MarkupParser text={item.content} className="rpo-copy"/>{item.link_url&&<ContentLink label={item.link_label||item.title} href={item.link_url}/>}</article>)}</div><Actions block={block}/></>
  if(layout==='logos') return <><Intro block={block}/><div className="rpo-credentials">{block.items?.map((item,index)=><article key={index}>{item.image_url&&<img src={item.image_url} alt={item.title} loading="lazy"/>}<h3><InlineMarkup text={item.title}/></h3><MarkupParser text={item.content} className="rpo-copy"/>{item.link_url&&<ContentLink label={item.link_label||item.title} href={item.link_url}/>}</article>)}</div><Actions block={block}/></>
  if(layout==='exit') return <div><Intro compact block={block}/><Actions block={block}/></div>
  if(layout==='intro'||layout==='note') return <><Intro compact={layout==='intro'} block={block}/><Actions block={block}/></>
  return <div className="rpo-reading-grid"><div><Intro compact block={block}/>{(block.image_url || block.visual) && <ContentMedia media={block}/>}<Actions block={block}/></div><Rows block={block}/></div>
}
export default function RpoPlatformStory({ section }: { section: FluorineSection }) {
  return <>{(section.content_blocks || []).filter(block=>!block.hidden).map(block=><section key={block.key} id={block.key} className={`rpo-section rpo-layout-${block.layout || 'checklist'} ${block.tone?`rpo-section--${block.tone}`:''} ${block.layout==='exit'?'rpo-exit':''}`}><div className="rpo-container"><Chapter block={block}/>{['delivery','comparison','steps'].includes(block.layout || '') && <Actions block={block}/>} {block.note&&<MarkupParser className="rpo-content-note" text={block.note}/>}</div></section>)}</>
}
