import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../server/app'
import { db, initDatabase } from '../server/db'
import { generateToken } from '../server/middleware/auth'
import { RPO_CONTENT } from '../src/config/rpoContent'

initDatabase()
test('CMS saves technology media, links, order and visibility without losing production paragraphs', async()=>{
 const app=createApp()
 const user={id:98765,username:'cms-fixture',password_hash:'unused',must_change_password:false} as any
 db.users.push(user)
 const section=db.fluorine_sections.find(s=>s.section_key==='rpo-sotex-membrane')!
 const previous=structuredClone(section)
 const navBefore=structuredClone(db.navigation)
 const server=app.listen(0,'127.0.0.1')
 await new Promise<void>(resolve=>server.once('listening',resolve))
 const address=server.address() as {port:number}
 const base=`http://127.0.0.1:${address.port}/api`
 const headers={'Content-Type':'application/json',Authorization:`Bearer ${generateToken(user.id,user.username)}`}
 try {
  const blocks=structuredClone(RPO_CONTENT['rpo-sotex-membrane'].content_blocks)
  blocks.push(structuredClone(RPO_CONTENT.lamination.content_blocks.find(b=>b.layout==='matrix')!))
  blocks.push(structuredClone(RPO_CONTENT['supply-chain'].content_blocks.find(b=>b.layout==='logos')!))
  blocks[0].hidden=true
  blocks[1].image_url='/visuals/technology-fiber-material-v1.webp'
  blocks[1].links=[{label:'Edited CTA',href:'/contact?topic=test'}]
  blocks[1].items![0].caption='Edited image caption'
  blocks[1].items![0].link_url='javascript:alert(1)'
  const response=await fetch(`${base}/admin/content-sections/pfas-free-innovation/${section.id}`,{method:'PUT',headers,body:JSON.stringify({nav_label:'RPO TECHNOLOGY',eyebrow:'Edited eyebrow',hero_visual:'supply',hero_link:'#transport-mechanism',content_blocks:blocks})})
  assert.equal(response.status,200,await response.text())
  const saved=(await (await fetch(`${base}/admin/content-sections/pfas-free-innovation`,{headers})).json()).data.find((s:any)=>s.id===section.id)
  assert.equal(saved.content_blocks[0].hidden,true)
  assert.equal(saved.content_blocks[1].content,blocks[1].content)
  assert.equal(saved.content_blocks[1].items[0].caption,'Edited image caption')
  assert.equal(saved.content_blocks[1].items[0].link_url,'')
  assert.deepEqual(saved.content_blocks[1].links,blocks[1].links)
  assert.equal(saved.hero_visual,'supply')
  assert.equal(saved.hero_link,'#transport-mechanism')
  assert.equal(saved.content_blocks[4].layout,'matrix')
  assert.equal(saved.content_blocks[5].layout,'logos')
  assert.equal(saved.content_blocks[5].items[0].image_url,blocks[5].items![0].image_url)
  const nav=structuredClone(db.navigation)
  const tech=nav.find(n=>n.link==='/pfas-free-innovation')!
  tech.label='RPO-Tech'
  tech.mega_menu=[{id:'platform',title:'RPO TECHNOLOGY',link:'/pfas-free-innovation/rpo-material-platform',description:'Edited menu description',image_url:'/visuals/technology-fiber-material-v1.webp',order_index:0,items:[]}]
  const updated=await fetch(`${base}/admin/navigation`,{method:'PUT',headers,body:JSON.stringify({items:nav})})
  assert.equal(updated.status,200,await updated.text())
  const bootstrap=await (await fetch(`${base}/bootstrap`)).json()
  assert.equal(bootstrap.navigation.find((n:any)=>n.label==='RPO-Tech').mega_menu[0].description,'Edited menu description')
 } finally {Object.assign(section,previous);db.navigation=navBefore;db.users=db.users.filter(u=>u.id!==user.id);await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
})
