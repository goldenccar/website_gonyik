import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../server/app'
import { db, initDatabase } from '../server/db'
import { generateToken } from '../server/middleware/auth'

initDatabase()
test('CMS menu hero reference follows page edits and explicit clearing without overriding custom images', async () => {
  const server = createApp().listen(0, '127.0.0.1')
  await new Promise<void>(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as {port:number}).port}/api`
  const user = {id:98766,username:'hero-menu-test',password_hash:'unused',must_change_password:false} as any
  db.users.push(user)
  const headers = {'Content-Type':'application/json',Authorization:`Bearer ${generateToken(user.id,user.username)}`}
  const page = db.page_configs.find(p=>p.page_key==='equipment')!
  const originalImage = page.hero_background
  const originalNavigation = db.navigation
  const put = (path:string,body:unknown)=>fetch(base+path,{method:'PUT',headers,body:JSON.stringify(body)})
  const read = async ()=> (await (await fetch(base+'/navigation?market=cn')).json()).data.find((n:any)=>n.link==='/equipment').mega_menu
  try {
    const response = await put('/admin/navigation',{items:[{id:999,label:'Applications',link:'/equipment',mega_menu:[
      {id:'linked',title:'Linked',link:'/equipment',layout:'feature',image_source:'page-hero',image_url:'/stale.webp',items:[{id:'secondary',label:'Catalog',link:'/fabrics/catalog'}]},
      {id:'custom',title:'Custom',link:'/equipment',image_source:'custom',image_url:'/custom.webp',items:[]},
    ]}]})
    assert.equal(response.status,200)
    await put('/admin/page/equipment',{hero_background:'/new.webp'})
    assert.equal((await read())[0].image_url,'/new.webp')
    assert.equal((await read())[0].image_source,'page-hero')
    assert.equal((await read())[0].layout,'feature')
    assert.equal((await read())[0].items[0].link,'/fabrics/catalog')
    assert.equal((await read())[1].image_url,'/custom.webp')
    await put('/admin/page/equipment',{hero_background:null})
    assert.equal((await read())[0].image_url,'')
  } finally {
    page.hero_background=originalImage
    db.navigation=originalNavigation
    db.users=db.users.filter(u=>u.id!==user.id)
    await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()))
  }
})
