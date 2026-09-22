import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { applyReviewedRpoContent } from '../scripts/publish-rpo-content'

test('support release preserves private records, rejects concurrent edits and repeats safely', () => {
  const changes=JSON.parse(fs.readFileSync('files/releases/support-content-20260922.json','utf8'))
  const db:any={users:[{id:1,password_hash:'keep'}],contact_messages:[{id:5}],contact_config:{smtp:'keep'},fluorine_sections:[],translations:{},fabric_sku:[{id:1}]}
  for(const c of changes){
    if(!c.field){db[c.collection]=structuredClone(c.before);continue}
    let row=c.id===undefined?db[c.collection]:db[c.collection].find((r:any)=>r.id===c.id)
    if(!row){row={id:c.id,untouched:true};db[c.collection].push(row)}
    if('before' in c)row[c.field]=structuredClone(c.before)
  }
  const result=applyReviewedRpoContent(db,changes)
  for(const key of ['users','contact_messages','contact_config','fabric_sku'])assert.deepEqual(result[key],db[key])
  assert.deepEqual(applyReviewedRpoContent(result,changes),result)
  assert.ok(result.fluorine_sections.every((r:any)=>r.untouched))
  const concurrent=structuredClone(db);concurrent.care_guides.push({id:999,title:'Production edit'})
  assert.throws(()=>applyReviewedRpoContent(concurrent,changes),/Production content changed/)
  assert.throws(()=>applyReviewedRpoContent(db,[{collection:'users',before:db.users,after:[]}]),/Unexpected/)
  assert.throws(()=>applyReviewedRpoContent(db,[{collection:'__proto__',after:[]}]),/Unexpected/)
})
