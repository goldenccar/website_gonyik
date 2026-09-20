import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../server/app'
import { db, initDatabase } from '../server/db'
import { generateToken } from '../server/middleware/auth'

initDatabase()
test('catalog copy is editable while technical specifications remain admin-only', async () => {
  const server = createApp().listen(0, '127.0.0.1')
  await new Promise<void>(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as {port:number}).port}/api`
  const user = {id:98767,username:'catalog-test',password_hash:'unused',must_change_password:false} as any
  db.users.push(user)
  const sku = db.fabric_sku[0]
  const original = {...sku}
  const headers = {'Content-Type':'application/json',Authorization:`Bearer ${generateToken(user.id,user.username)}`}
  const put = (body:unknown)=>fetch(base+'/fabrics/admin/sku/'+sku.id,{method:'PUT',headers,body:JSON.stringify(body)})
  const read = async () => {
    const body = await (await fetch(base+'/fabrics/catalog')).json()
    return body.data.series.flatMap((s:any)=>s.skus).find((s:any)=>s.id===sku.id)
  }
  try {
    assert.equal((await put({public_description:'Sample description',application_notes:'Outdoor jackets'})).status,200)
    let result = await read()
    assert.equal(result.public_description,'Sample description')
    assert.equal(result.application_notes,'Outdoor jackets')
    assert.equal('specifications' in result,false)
    assert.equal('internal_code' in result,false)
    assert.equal(db.fabric_sku.find(s=>s.id===sku.id)!.specifications,original.specifications)
    assert.equal((await put({public_description:''})).status,200)
    result=await read()
    assert.equal(result.public_description,'')
    assert.equal(result.application_notes,'Outdoor jackets')
    assert.equal((await put({application_notes:{invalid:true}})).status,400)
  } finally {
    Object.assign(db.fabric_sku.find(s=>s.id===sku.id)!,original)
    db.users=db.users.filter(u=>u.id!==user.id)
    await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()))
  }
})