import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// One-time local migration of the reviewed media. No runtime content fallback.
export function applyHomeMediaCms(source: Record<string, any>) {
  const database = structuredClone(source)
  if (database.home_media_cms_version >= 1) return database
  const home = database.home_config
  if (!home) throw Error('Missing home_config')
  const media = {
    membrane_image: '/visuals/membrane-waterdrops-v3.webp',
    membrane_label: '微孔膜阻挡液态水并允许湿气通过的示意图',
    lamination_top_image: '/visuals/lamination-layer-top-alpha-v3.webp',
    lamination_membrane_image: '/visuals/lamination-layer-membrane-alpha-v3.webp',
    lamination_backing_image: '/visuals/lamination-layer-backing-alpha-v3.webp',
    lamination_label: '织物、膜层和内层压合形成完整复合面料的示意图',
    supply_ribbon_image: '/visuals/supply-chain-ribbon-v2.webp',
    supply_lab_image: '/visuals/supply-chain-node-lab-v2.webp',
    supply_factory_image: '/visuals/supply-chain-node-factory-v2.webp',
    supply_retail_image: '/visuals/supply-chain-node-retail-v2.webp',
    supply_materials_image: '/visuals/supply-chain-node-materials-v2.webp',
    supply_material_image: '/visuals/supply-chain-node-material-v2.webp',
    supply_label: '原料、材料、实验验证、制造与终端应用的供应链示意图',
    supply_home_center: 'PFAS FREE',
    supply_rpo_center: 'GONYIK',
  }
  home.technical_visuals = { ...media, ...home.technical_visuals }
  const legacy: Record<string, { link: string; visual: string }> = {
    MEMBRANE: { link: '/pfas-free-innovation/rpo-sotex-membrane', visual: 'membrane' },
    LAMINATION: { link: '/pfas-free-innovation/lamination', visual: 'lamination' },
    'SUPPLY CHAIN': { link: '/pfas-free-innovation/supply-chain', visual: 'supply' },
  }
  home.platform_cards = (home.platform_cards || []).map((item: Record<string, any>) => {
    const prior = legacy[item.footer]
    return {
      title: item.title || '',
      subtitle: Object.hasOwn(item, 'subtitle') ? item.subtitle : item.description || '',
      link: Object.hasOwn(item, 'link') ? item.link : prior?.link || '',
      visual: Object.hasOwn(item, 'visual') ? item.visual : prior?.visual || 'none',
      image_url: item.image_url || '',
    }
  })
  database.home_media_cms_version = 1
  return database
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = path.resolve('preview.local/production-preview-db.json')
  const original = fs.readFileSync(target, 'utf8')
  const source = JSON.parse(original)
  if (source.home_media_cms_version >= 1) {
    console.log('Home media configuration already migrated; CMS edits preserved.')
  } else {
    const result = applyHomeMediaCms(source)
    fs.writeFileSync(path.resolve(`preview.local/db-before-home-media-cms-${Date.now()}.json`), original, { flag: 'wx' })
    fs.writeFileSync(`${target}.tmp`, JSON.stringify(result, null, 2))
    fs.renameSync(`${target}.tmp`, target)
    console.log('Home and RPO shared media migrated in the local preview database only.')
  }
}
