import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const source=JSON.parse(await fs.readFile('preview.local/production-source.json','utf8'))
const responses=JSON.parse(await fs.readFile(path.join(source.directory,'responses.json'),'utf8'))
let failed=0
for(const [endpoint,expected] of Object.entries(responses)){
 const response=await fetch('http://127.0.0.1:5180'+endpoint)
 const actual=await response.json()
 try{assert.deepEqual(actual,expected)}catch(error){failed++;console.log('Mismatch '+endpoint+'\n'+error.message.slice(0,1600))}
}
for(const asset of source.assets){
 const response=await fetch('http://127.0.0.1:5180'+asset.url)
 const hash=crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex')
 assert.equal(hash,asset.sha256,'Asset mismatch '+asset.url)
}
assert.equal(failed,0,'Public API snapshots must match')
console.log(`Verified ${Object.keys(responses).length} API responses and ${source.assets.length} assets against production snapshot ${source.commit.slice(0,7)}.`)
