import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

test('local series review preserves models and later CMS edits on repeat runs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gonyik-series-review-'))
  const preview = path.join(root, 'preview.local')
  fs.mkdirSync(preview)
  const file = path.join(preview, 'production-preview-db.json')
  const before = {
    fabric_series: ['otter', 'rayo', 'kais'].map(slug => ({ slug, home_image: `/${slug}.jpg` })),
    fabric_sku: [{ id: 1, name: 'keep model data' }],
    navigation: [{ url: '/fabrics/series/rayo' }, { url: '/equipment' }],
  }
  fs.writeFileSync(file, JSON.stringify(before))
  const run = () => execFileSync(process.execPath, ['--import', pathToFileURL(path.resolve('node_modules/tsx/dist/loader.mjs')).href, path.resolve('scripts/apply-series-screens.ts')], { cwd: root })
  try {
    run()
    const after = JSON.parse(fs.readFileSync(file, 'utf8'))
    assert.deepEqual(after.fabric_sku, before.fabric_sku)
    assert.deepEqual(after.fabric_series.map((s: any) => s.home_image), before.fabric_series.map(s => s.home_image))
    assert.deepEqual(after.fabric_series.map((s: any) => s.story_title), ['专业户外', '轻户外', '专业防护'])
    assert.deepEqual(after.navigation, [{ url: '/fabrics#series-rayo' }, { url: '/equipment' }])
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(preview, 'db-before-series-screens-v6-20260920.json'), 'utf8')), before)
    assert.deepEqual(after.fabric_series[0].story_icons, ['cloud-rain', 'waves', 'feather', 'shield-check'])
    assert.deepEqual(after.fabric_series.map((s: any) => s.story_highlights.length), [4, 4, 2])
    assert.equal(after.fabric_series[1].story_primary_link, '/fabrics/catalog?series=rayo#series-rayo')
    after.fabric_series[1].story_intro = 'Later CMS edit'
    after.fabric_series[1].story_primary_label = ''
    after.fabric_series[0].story_highlights = ['CMS replacement']
    after.fabric_series[0].story_icons = ['none']
    fs.writeFileSync(file, JSON.stringify(after))
    run()
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), after)
    // Upgrade an existing v5 library without touching the third series.
    const upgradePreview = path.join(root, 'upgrade', 'preview.local')
    fs.mkdirSync(upgradePreview, { recursive: true })
    after.series_screens_review_version = 5
    after.fabric_series[2].story_intro = 'KAIS copy maintained in CMS'
    const upgradeFile = path.join(upgradePreview, 'production-preview-db.json')
    fs.writeFileSync(upgradeFile, JSON.stringify(after))
    execFileSync(process.execPath, ['--import', pathToFileURL(path.resolve('node_modules/tsx/dist/loader.mjs')).href, path.resolve('scripts/apply-series-screens.ts')], { cwd: path.join(root, 'upgrade') })
    const upgraded = JSON.parse(fs.readFileSync(upgradeFile, 'utf8'))
    assert.deepEqual(upgraded.fabric_series[2], after.fabric_series[2])
    assert.equal(upgraded.fabric_series[0].story_highlights.length, 4)
    assert.equal(upgraded.fabric_series[1].story_primary_label, '')
  } finally {
    assert.ok(path.resolve(root).startsWith(path.join(os.tmpdir(), 'gonyik-series-review-')))
    fs.rmSync(root, { recursive: true })
  }
})
