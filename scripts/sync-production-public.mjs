import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
const origin='https://gonyik.com'
const root=path.resolve('preview.local')
const stamp=new Date().toISOString().replace(/[:.]/g,'-')
const directory=path.join(root,'public-snapshot-'+stamp)
await fs.mkdir(directory,{recursive:true})
async function json(endpoint){const r=await fetch(origin+endpoint);if(!r.ok)throw Error(endpoint+': '+r.status);return r.json()}
const health=await json('/api/health')
const bootstrap=await json('/api/bootstrap')
const endpoints=['/api/bootstrap','/api/fabrics/catalog','/api/equipment/catalog','/api/services/bootstrap','/api/content-sections/pfas-free-innovation','/api/content-sections/services','/api/inquiry-subjects',...['fabrics','equipment','services','contact','pfas-free-innovation'].map(k=>'/api/page/'+k),...['material-care-guides','care-guides','faqs','digital-fabric-formats'].map(k=>'/api/services/'+k)]
const responses={}
for(const market of bootstrap.markets.filter(m=>m.enabled)){
 for(const endpoint of endpoints){const key=endpoint+'?market='+encodeURIComponent(market.code);responses[key]=await json(key)}
}
await fs.writeFile(path.join(directory,'responses.json'),JSON.stringify(responses,null,2))
const urls=new Set()
function collect(value){
 if(typeof value==='string')for(const match of value.matchAll(/(?:https:\/\/gonyik\.com)?\/(?:uploads|visuals)\/[^\s"'<>\\]+/g)){
  const url=new URL(match[0],origin);if(url.origin===origin)urls.add(url.pathname)
 }
 else if(value&&typeof value==='object')for(const v of Object.values(value))collect(v)
}
collect(responses)
const assets=[], failures=[]
for(const url of urls){
 const decoded=decodeURIComponent(url);const destination=path.resolve(root,'production-assets','.'+decoded)
 if(!destination.startsWith(path.resolve(root,'production-assets')+path.sep))throw Error('Unsafe asset path')
 const r=await fetch(origin+url)
 if(!r.ok){failures.push({url,status:r.status});continue}
 const data=Buffer.from(await r.arrayBuffer())
 await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,data)
 assets.push({url,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')})
 if(assets.length%10===0)console.log('Public assets downloaded: '+assets.length)
}
const manifest={source:origin,commit:health.commit,synced_at:new Date().toISOString(),endpoints:Object.keys(responses),assets,failures}
await fs.writeFile(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2))
if(failures.length)console.log('Unavailable production asset references: '+JSON.stringify(failures))
await fs.writeFile(path.join(root,'production-source.json'),JSON.stringify({directory,...manifest},null,2))
console.log(JSON.stringify({directory,commit:health.commit,endpoints:manifest.endpoints.length,assets:assets.length,failures:failures.length,bytes:assets.reduce((s,a)=>s+a.bytes,0)}))
