import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = process.cwd()
const sourceRoot = path.join(root, 'src')
const serverRoot = path.join(root, 'server')
const distAssets = path.join(root, 'dist/client/assets')
const publicRoot = path.join(root, 'public')

function walk(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(absolute, predicate) : (predicate(absolute) ? [absolute] : [])
  })
}

const sourceFiles = walk(sourceRoot, (file) => /\.(?:ts|tsx)$/.test(file))
const sourceText = new Map(sourceFiles.map((file) => [file, fs.readFileSync(file, 'utf8')]))

function resolveImport(importer, specifier) {
  const base = specifier.startsWith('@/')
    ? path.join(sourceRoot, specifier.slice(2))
    : specifier.startsWith('.') ? path.resolve(path.dirname(importer), specifier) : null
  if (!base) return null
  return [base, `${base}.tsx`, `${base}.ts`, path.join(base, 'index.tsx'), path.join(base, 'index.ts')]
    .find((candidate) => fs.existsSync(candidate)) || null
}

const inbound = new Map()
for (const [file, content] of sourceText) {
  const imports = content.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)
  for (const match of imports) {
    const resolved = resolveImport(file, match[1])
    if (resolved) inbound.set(resolved, (inbound.get(resolved) || 0) + 1)
  }
}

const componentFiles = sourceFiles.filter((file) => (
  file.includes(`${path.sep}components${path.sep}`)
  && !file.endsWith('.test.tsx')
))
const unusedComponents = componentFiles.filter((file) => !inbound.has(file))

const exactComponentBodies = new Map()
for (const file of componentFiles) {
  const normalized = sourceText.get(file).replace(/\s+/g, ' ').trim()
  const matches = exactComponentBodies.get(normalized) || []
  matches.push(file)
  exactComponentBodies.set(normalized, matches)
}
const duplicateComponents = [...exactComponentBodies.values()].filter((files) => files.length > 1)

const nonNativeInteractions = []
for (const [file, content] of sourceText) {
  for (const match of content.matchAll(/<(div|span|li|section|article)\b[^>]*\bonClick\s*=/g)) {
    const line = content.slice(0, match.index).split('\n').length
    nonNativeInteractions.push(`${path.relative(root, file)}:${line} <${match[1]}>`)
  }
}

function normalizeEndpoint(value) {
  return value
    .replace(/\?.*$/, '')
    .replace(/\$\{[^}]+\}/g, ':param')
    .replace(/:\w+/g, ':param')
    .replace(/\/+/g, '/')
}

const routeImports = new Map()
const appSource = fs.readFileSync(path.join(serverRoot, 'app.ts'), 'utf8')
for (const match of appSource.matchAll(/import\s+(\w+)\s+from\s+'\.\/routes\/([^']+)'/g)) {
  routeImports.set(match[1], path.join(serverRoot, 'routes', `${match[2]}.ts`))
}
const mounts = new Map()
for (const match of appSource.matchAll(/app\.use\('([^']+)'\s*,\s*(\w+)\)/g)) {
  if (routeImports.has(match[2])) mounts.set(routeImports.get(match[2]), match[1].replace(/^\/api/, ''))
}

const serverEndpoints = []
for (const [routeFile, mount] of mounts) {
  const content = fs.readFileSync(routeFile, 'utf8')
  for (const match of content.matchAll(/router\.(get|post|put|delete)\('([^']+)'/g)) {
    serverEndpoints.push({ method: match[1], path: normalizeEndpoint(`${mount}${match[2]}`) })
  }
  // Some CRUD modules deliberately register a family of native Express routes
  // through one helper instead of repeating five near-identical handlers.
  for (const match of content.matchAll(/registerContentCollection\('([^']+)'/g)) {
    const resource = match[1]
    serverEndpoints.push(
      { method: 'get', path: normalizeEndpoint(`${mount}/${resource}`) },
      { method: 'get', path: normalizeEndpoint(`${mount}/admin/${resource}`) },
      { method: 'post', path: normalizeEndpoint(`${mount}/admin/${resource}`) },
      { method: 'put', path: normalizeEndpoint(`${mount}/admin/${resource}/:param`) },
      { method: 'delete', path: normalizeEndpoint(`${mount}/admin/${resource}/:param`) },
    )
  }
}

const clientEndpoints = []
for (const [file, content] of sourceText) {
  for (const match of content.matchAll(/\b(api\.(get|post|put|delete)|cachedGet)\(\s*([`'"])([^`'"]+)\3/g)) {
    clientEndpoints.push({
      method: match[1] === 'cachedGet' ? 'get' : match[2],
      path: normalizeEndpoint(match[4]),
      source: path.relative(root, file),
    })
  }
}

function endpointMatches(client, server) {
  if (client.method !== server.method) return false
  const clientSegments = client.path.split('/').filter(Boolean)
  const serverSegments = server.path.split('/').filter(Boolean)
  return clientSegments.length === serverSegments.length && serverSegments.every((segment, index) => (
    segment === ':param' || clientSegments[index] === ':param' || segment === clientSegments[index]
  ))
}
const unmatchedEndpoints = clientEndpoints.filter((client) => !serverEndpoints.some((server) => endpointMatches(client, server)))

const assetFiles = walk(distAssets, (file) => /\.(?:js|css)$/.test(file))
const assetMetrics = assetFiles.map((file) => {
  const buffer = fs.readFileSync(file)
  return { file: path.basename(file), bytes: buffer.length, gzip: zlib.gzipSync(buffer).length }
})
const oversizedBundles = assetMetrics.filter((asset) => (
  (asset.file.endsWith('.js') && asset.gzip > 120 * 1024)
  || (asset.file.endsWith('.css') && asset.gzip > 90 * 1024)
))
const oversizedPublicAssets = walk(publicRoot, (file) => fs.statSync(file).size > 750 * 1024)

const failures = [
  ...unusedComponents.map((file) => `未被引用的组件：${path.relative(root, file)}`),
  ...duplicateComponents.map((files) => `完全重复的组件：${files.map((file) => path.relative(root, file)).join(', ')}`),
  ...unmatchedEndpoints.map((endpoint) => `找不到服务端路由：${endpoint.method.toUpperCase()} ${endpoint.path} (${endpoint.source})`),
  ...oversizedBundles.map((asset) => `构建产物超预算：${asset.file} gzip ${(asset.gzip / 1024).toFixed(1)} KB`),
  ...oversizedPublicAssets.map((file) => `公共资源超 750 KB：${path.relative(root, file)}`),
]

console.log('\n港翼官网自动化质量审计')
console.log(`- 数据流：检查 ${clientEndpoints.length} 个静态 API 调用，服务端识别 ${serverEndpoints.length} 个路由`)
console.log(`- 组件复用：检查 ${componentFiles.length} 个组件，零引用 ${unusedComponents.length}，完全重复 ${duplicateComponents.length}`)
console.log(`- 原生交互：发现 ${nonNativeInteractions.length} 个非原生可点击元素（提示项，不阻断发布）`)
console.log(`- 性能预算：检查 ${assetMetrics.length} 个构建资源和公共媒体，超预算 ${oversizedBundles.length + oversizedPublicAssets.length}`)

if (nonNativeInteractions.length) {
  console.log('\n建议复核的非原生交互：')
  nonNativeInteractions.slice(0, 12).forEach((item) => console.log(`  · ${item}`))
  if (nonNativeInteractions.length > 12) console.log(`  · 其余 ${nonNativeInteractions.length - 12} 项省略`)
}

if (failures.length) {
  console.error('\n阻断项：')
  failures.forEach((failure) => console.error(`  × ${failure}`))
  process.exitCode = 1
} else {
  console.log('\n结果：通过。未发现会阻断发布的数据流、组件复用或性能问题。')
}
