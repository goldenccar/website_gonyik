import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Edit2, Plus, Trash2 } from 'lucide-react'
import api, { uploadFile } from '@/api/client'
import type { FluorineSection, TechnologyContentBlock, TechnologyContentItem, TechnologyMedia } from '@/types'
import { findTechnologyPage, getTechnologyGroupLabel, getTechnologyPagePath } from '@/config/technologyPages'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import AdminPagePreview from './components/AdminPagePreview'
import FormField from './components/FormField'
import Modal from './components/Modal'
import SaveCancelButtons from './components/SaveCancelButtons'
import ResponsiveAdminList from './components/ResponsiveAdminList'

const layouts=[['matrix','分组要点'],['logos','机构与资质展示'],['intro','正文说明'],['cards','材料入口卡片'],['delivery','开发与验证入口'],['series','面料系列入口'],['note','补充说明'],['split','文字与配图'],['comparison','结构对比'],['feature','配图与性能要点'],['tabs','结构切换'],['steps','流程步骤'],['columns','并列要点'],['checklist','说明与检查项目'],['exit','底部咨询入口']].map(([value,label])=>({value,label}))
const visuals=[['image','静态配图'],['membrane','首页膜技术动画'],['lamination','首页复合动画'],['supply','首页供应链动画'],['layers-waterproof','防水透湿分层'],['layers-light','轻户外分层'],['layers-protection','防护分层']].map(([value,label])=>({value,label}))
function MediaFields({value,onChange,name,imageOnly=false}:{value:TechnologyMedia;onChange:(next:TechnologyMedia)=>void;name:string;imageOnly?:boolean}) {
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  return <div className="space-y-3 border-l border-white/15 pl-4">
    {!imageOnly&&<FormField label="配图或动画" name={`${name}-visual`} select options={visuals} value={value.visual||'image'} onChange={e=>onChange({...value,visual:e.target.value})}/>}
    {(!value.visual||value.visual==='image')&&<>
      <FormField label="配图地址（可清空）" name={`${name}-image`} value={value.image_url||''} onChange={e=>onChange({...value,image_url:e.target.value})}/>
      {value.image_url&&<img src={value.image_url} alt="当前配图" className="h-24 max-w-full object-contain bg-white/5"/>}
      <label className="inline-block cursor-pointer border border-white/20 px-3 py-2 text-sm">{busy?'上传中…':'上传或替换配图'}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);setError('');try{const res=await uploadFile(file);const url=res.data.url||res.data.data?.url;if(!url)throw Error('上传未返回地址');onChange({...value,image_url:url})}catch{setError('上传失败，请重试')}finally{setBusy(false)}}}/></label>
    </>}
    {!imageOnly&&<FormField label="图注" name={`${name}-caption`} value={value.caption||''} onChange={e=>onChange({...value,caption:e.target.value})}/>}
    {error&&<p role="alert" className="text-error">{error}</p>}
  </div>
}
function Reorder({index,count,move,remove}:{index:number;count:number;move:(direction:-1|1)=>void;remove:()=>void}) {
  return <div className="flex gap-2"><button type="button" aria-label="上移" disabled={!index} onClick={()=>move(-1)}><ArrowUp size={16}/></button><button type="button" aria-label="下移" disabled={index===count-1} onClick={()=>move(1)}><ArrowDown size={16}/></button><button type="button" aria-label="删除" onClick={remove}><Trash2 size={16}/></button></div>
}
function moved<T>(items:T[],index:number,direction:number){const next=[...items];[next[index],next[index+direction]]=[next[index+direction],next[index]];return next}
export default function AdminFluorineManager(){
  const [sections,setSections]=useState<FluorineSection[]>([])
  const [draft,setDraft]=useState<FluorineSection|null>(null)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [previewKey,setPreviewKey]=useState('rpo-material-platform')
  const [version,setVersion]=useState(0)
  const load=async()=>{setLoading(true);try{const res=await api.get('/admin/content-sections/pfas-free-innovation');setSections((res.data.data||[]).filter((s:FluorineSection)=>findTechnologyPage(s)))}catch{setError('页面加载失败，请刷新重试')}finally{setLoading(false)}}
  useEffect(()=>{void load()},[])
  const updateBlock=(index:number,block:TechnologyContentBlock)=>{if(draft)setDraft({...draft,content_blocks:draft.content_blocks?.map((b,i)=>i===index?block:b)})}
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!draft)return;setSaving(true);setError('');try{await api.put(`/admin/content-sections/pfas-free-innovation/${draft.id}`,draft);setDraft(null);setMessage('技术页面已保存');await load();setVersion(v=>v+1)}catch(e:any){setError(e?.response?.data?.error||'保存失败，请重试')}finally{setSaving(false)}}
  const selected=sections.find(s=>s.section_key===previewKey)
  return <Dashboard><div className="max-w-[1200px]"><AdminHeader title="RPO-Tech 页面管理"/>
    <p className="mb-5 text-sm leading-6 text-muted">六个页面与前台一一对应。可维护文字、配图、动画类型、按钮、模块顺序和显示状态。Header 菜单在「Header 管理」维护；多语言内容在「翻译管理」维护。</p>
    {message&&<p className="mb-4 text-success">{message}</p>}{error&&<p role="alert" className="mb-4 text-error">{error}</p>}
    {selected&&<AdminPagePreview publicPath={getTechnologyPagePath(previewKey)} title={selected.title} version={version}/>}
    {loading?<p>加载中…</p>:<ResponsiveAdminList items={sections} getKey={s=>s.id} renderTitle={s=><span>{s.title} · {s.status==='draft'?'草稿':'已发布'}</span>} renderSubtitle={s=>`${getTechnologyGroupLabel(s)} · ${(s.content_blocks||[]).length} 个模块`} renderActions={s=><><button type="button" className="px-3 py-3 text-accent" onClick={()=>setPreviewKey(s.section_key||'')}>预览</button><button type="button" aria-label={`编辑${s.title}`} onClick={()=>{setDraft(structuredClone(s));setPreviewKey(s.section_key||'');setError('')}} className="p-3 text-accent"><Edit2 size={16}/></button></>}/>}
  </div>
  {draft&&<Modal title={`编辑技术页面 · ${draft.title}`} onClose={()=>setDraft(null)} maxWidth="max-w-[1240px]"><form onSubmit={submit} className="space-y-6">
    <AdminPagePreview publicPath={getTechnologyPagePath(draft.section_key||'')} title={draft.title} draftMessage={{type:'gonyik:technology-preview',payload:draft}} helpText="修改后实时预览；点击保存才更新页面内容。"/>
    <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-4 font-semibold">页面首屏与导航</legend>
      <FormField label="导航名称（最多 32 字符）" name="nav_label" maxLength={32} required value={draft.nav_label||''} onChange={e=>setDraft({...draft,nav_label:e.target.value})}/>
      <FormField label="页面标题" name="title" required markup="inline" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/>
      <FormField label="顶部小标题" name="eyebrow" value={draft.eyebrow||''} onChange={e=>setDraft({...draft,eyebrow:e.target.value})}/>
      <FormField label="副标题" name="subtitle" markup="inline" value={draft.subtitle} onChange={e=>setDraft({...draft,subtitle:e.target.value})}/>
      <FormField label="发布状态" name="status" select options={[{value:'published',label:'已发布'},{value:'draft',label:'草稿（前台隐藏）'}]} value={draft.status||'published'} onChange={e=>setDraft({...draft,status:e.target.value as 'draft'|'published'})}/>
      <FormField label="首屏呈现" name="hero_visual" select options={[{value:'image',label:'背景图片'},{value:'supply',label:'供应链动画'}]} value={draft.hero_visual||'image'} onChange={e=>setDraft({...draft,hero_visual:e.target.value})}/>
      <FormField label="首屏按钮文字（留空隐藏）" name="hero_scroll_label" value={draft.hero_scroll_label||''} onChange={e=>setDraft({...draft,hero_scroll_label:e.target.value})}/>
      <FormField label="首屏按钮链接" name="hero_link" value={draft.hero_link||''} onChange={e=>setDraft({...draft,hero_link:e.target.value})}/>
    </fieldset>
    {draft.hero_visual!=='supply'&&<><MediaFields imageOnly name="hero" value={{image_url:draft.image_url||'',visual:'image'}} onChange={m=>setDraft({...draft,image_url:m.image_url||null})}/><FormField label="头图裁切" name="image_fit" select options={[{value:'cover',label:'填满裁切'},{value:'contain',label:'完整显示'}]} value={draft.image_fit} onChange={e=>setDraft({...draft,image_fit:e.target.value as 'cover'|'contain'})}/></>}
    {(draft.content_blocks||[]).map((block,bi)=><fieldset key={block.key} className="space-y-4 border border-white/15 p-5"><legend className="px-2">{bi+1}. {block.title||'正文说明'}</legend>
      <div className="flex justify-between gap-3"><label className="text-sm"><input type="checkbox" checked={!block.hidden} onChange={e=>updateBlock(bi,{...block,hidden:!e.target.checked})}/> 显示此模块</label><Reorder index={bi} count={draft.content_blocks!.length} move={d=>setDraft({...draft,content_blocks:moved(draft.content_blocks!,bi,d)})} remove={()=>setDraft({...draft,content_blocks:draft.content_blocks?.filter((_,i)=>i!==bi)})}/></div>
      <div className="grid gap-4 sm:grid-cols-2"><FormField label="模块版式" name={`b${bi}-layout`} select options={layouts} value={block.layout||'checklist'} onChange={e=>updateBlock(bi,{...block,layout:e.target.value})}/><FormField label="背景" name={`b${bi}-tone`} select options={[{value:'',label:'白色'},{value:'mist',label:'浅灰'},{value:'navy',label:'深蓝'}]} value={block.tone||''} onChange={e=>updateBlock(bi,{...block,tone:e.target.value})}/></div>
      <FormField label="模块标题" name={`b${bi}-title`} markup="inline" value={block.title} onChange={e=>updateBlock(bi,{...block,title:e.target.value})}/>
      <FormField label="模块正文" name={`b${bi}-content`} textarea rows={5} markup="block" value={block.content} onChange={e=>updateBlock(bi,{...block,content:e.target.value})}/>
      <FormField label="补充说明（可留空）" name={`b${bi}-note`} textarea rows={2} markup="block" value={block.note||''} onChange={e=>updateBlock(bi,{...block,note:e.target.value})}/>
      {['split','feature','checklist'].includes(block.layout||'')&&<MediaFields name={`b${bi}`} value={block} onChange={m=>updateBlock(bi,{...block,...m})}/>}
      {block.layout==='split'&&<FormField label="关键词（中文逗号分隔）" name={`b${bi}-highlights`} value={(block.highlights||[]).join('，')} onChange={e=>updateBlock(bi,{...block,highlights:e.target.value.split(/[，,]/).filter(Boolean)})}/>}
      {block.layout==='series' && <p className="text-sm text-muted">自动读取「面料系列管理」中的系列名称、定位、介绍、配图和顺序。请到面料系列管理维护，首页与此处同步生效。</p>}
      {(block.layout==='series'?[]:block.items||[]).map((item,ii)=>{const update=(next:TechnologyContentItem)=>updateBlock(bi,{...block,items:block.items?.map((it,i)=>i===ii?next:it)});return <div key={ii} className="space-y-3 border border-white/10 bg-white/[0.025] p-4"><div className="flex justify-between"><span className="text-xs text-muted">条目 {ii+1}</span><Reorder index={ii} count={block.items!.length} move={d=>updateBlock(bi,{...block,items:moved(block.items!,ii,d)})} remove={()=>updateBlock(bi,{...block,items:block.items?.filter((_,i)=>i!==ii)})}/></div>
        <FormField label="条目标题" name={`b${bi}-i${ii}-title`} value={item.title} onChange={e=>update({...item,title:e.target.value})}/><FormField label="条目正文" name={`b${bi}-i${ii}-content`} textarea rows={3} markup="block" value={item.content} onChange={e=>update({...item,content:e.target.value})}/>
        {['cards','delivery','series','comparison','tabs','logos'].includes(block.layout||'')&&<MediaFields imageOnly={['comparison','logos'].includes(block.layout||'')} name={`b${bi}-i${ii}`} value={item} onChange={m=>update({...item,...m})}/>}
        {block.layout==='comparison'&&<FormField label="图注" name={`b${bi}-i${ii}-caption`} value={item.caption||''} onChange={e=>update({...item,caption:e.target.value})}/>}
        {['cards','series'].includes(block.layout||'')&&<FormField label="卡片链接" name={`b${bi}-i${ii}-url`} value={item.link_url||''} onChange={e=>update({...item,link_url:e.target.value})}/>}
        {block.layout==='tabs'&&<FormField label="层次标签（中文逗号分隔）" name={`b${bi}-i${ii}-labels`} value={(item.highlights||[]).join('，')} onChange={e=>update({...item,highlights:e.target.value.split(/[，,]/).filter(Boolean)})}/>}
        {!['comparison','steps','cards','series'].includes(block.layout||'')&&<div className="grid gap-3 sm:grid-cols-2"><FormField label="链接文字" name={`b${bi}-i${ii}-label`} value={item.link_label||''} onChange={e=>update({...item,link_label:e.target.value})}/><FormField label="链接地址（留空隐藏）" name={`b${bi}-i${ii}-url`} value={item.link_url||''} onChange={e=>update({...item,link_url:e.target.value})}/></div>}
      </div>})}
      {!['intro','note','split','exit','series'].includes(block.layout||'')&&(block.items||[]).length<8&&<button type="button" className="flex items-center gap-2 text-accent" onClick={()=>updateBlock(bi,{...block,items:[...(block.items||[]),{title:'新条目',content:''}]})}><Plus size={15}/>添加条目</button>}
      {(block.links||[]).map((link,li)=><div key={li} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"><FormField label="按钮文字" name={`b${bi}-l${li}-label`} value={link.label} onChange={e=>updateBlock(bi,{...block,links:block.links?.map((l,i)=>i===li?{...l,label:e.target.value}:l)})}/><FormField label="按钮链接" name={`b${bi}-l${li}-href`} value={link.href} onChange={e=>updateBlock(bi,{...block,links:block.links?.map((l,i)=>i===li?{...l,href:e.target.value}:l)})}/><button type="button" aria-label="删除按钮" className="p-3" onClick={()=>updateBlock(bi,{...block,links:block.links?.filter((_,i)=>i!==li)})}><Trash2 size={16}/></button></div>)}
      {(block.links||[]).length<4&&<button type="button" className="text-accent" onClick={()=>updateBlock(bi,{...block,links:[...(block.links||[]),{label:'了解更多',href:''}]})}>添加按钮</button>}
    </fieldset>)}
    {(draft.content_blocks||[]).length<16&&<button type="button" className="flex items-center gap-2 border border-white/20 px-4 py-3" onClick={()=>setDraft({...draft,content_blocks:[...(draft.content_blocks||[]),{key:`section-${Date.now()}`,title:'新模块',content:'',layout:'intro'}]})}><Plus size={16}/>添加模块</button>}
    {error&&<p role="alert" className="text-error">{error}</p>}<SaveCancelButtons onCancel={()=>setDraft(null)} loading={saving} submitLabel="保存修改"/>
  </form></Modal>}
  </Dashboard>
}
