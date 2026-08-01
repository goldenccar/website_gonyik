import { Router } from 'express'
import nodemailer from 'nodemailer'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, nextOrderIndex } from '../db'
import { registerUploadedFile } from '../mediaAssets'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()
const TECHNOLOGY_NAV_LABEL_MAX_LENGTH = 12

const NON_TRANSLATABLE_KEYS = new Set([
  'id', 'order_index', 'page_key', 'section_key', 'module_type', 'image_url', 'image_fit',
  'hero_background', 'hero_mobile_background', 'verification_image', 'url', 'link', 'href',
  'slug', 'sku_code', 'internal_code', 'email', 'phone', 'qrcode_url', 'logo_url', 'favicon_url',
  'status', 'visibility', 'role', 'platform', 'format', 'smtp_host', 'smtp_user', 'smtp_pass',
])

function collectTranslatableStrings(value: unknown, output = new Set<string>(), key = ''): Set<string> {
  if (NON_TRANSLATABLE_KEYS.has(key)) return output
  if (typeof value === 'string') {
    const normalized = value.trim()
    if (normalized && /[\u3400-\u9fff]/.test(normalized) && !normalized.startsWith('data:')) output.add(normalized)
    return output
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectTranslatableStrings(item, output, key))
    return output
  }
  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      collectTranslatableStrings(childValue, output, childKey)
    })
  }
  return output
}

function publicTranslationSources() {
  const publicContent = {
    home_config: db.home_config,
    site_config: db.site_config,
    page_configs: db.page_configs,
    navigation: db.navigation,
    footer_config: db.footer_config,
    fabric_series: db.fabric_series,
    fabric_capabilities: db.fabric_capabilities,
    fabric_sku: db.fabric_sku,
    equipment_categories: db.equipment_categories,
    equipment_products: db.equipment_products,
    material_care_guides: db.material_care_guides,
    care_guides: db.care_guides,
    faqs: db.faqs,
    digital_fabric_formats: db.digital_fabric_formats,
    contact_config: {
      address: db.contact_config?.address,
      response_text: db.contact_config?.response_text,
    },
    fluorine_sections: db.fluorine_sections,
    inquiry_subjects: db.inquiry_subjects,
  }
  return [...collectTranslatableStrings(publicContent)].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function characterLength(value: string) {
  return Array.from(value).length
}

function validateTechnologyNavLabel(value: unknown, fallback: string) {
  const label = String(value || fallback).trim()
  if (characterLength(label) > TECHNOLOGY_NAV_LABEL_MAX_LENGTH) {
    return { error: `导航名称不能超过 ${TECHNOLOGY_NAV_LABEL_MAX_LENGTH} 个字符` }
  }
  return { value: label }
}

function normalizeTechnologyContentBlocks(value: unknown) {
  if (!Array.isArray(value)) return undefined
  return value.slice(0, 8).map((block: any, index: number) => ({
    key: String(block?.key || `section-${index + 1}`).trim(),
    title: String(block?.title || '').trim(),
    content: String(block?.content || ''),
    highlights: Array.isArray(block?.highlights)
      ? block.highlights.slice(0, 8).map((item: unknown) => String(item).trim()).filter(Boolean)
      : undefined,
    items: Array.isArray(block?.items)
      ? block.items.slice(0, 8).map((item: any) => ({
          title: String(item?.title || '').trim(),
          content: String(item?.content || ''),
        })).filter((item: any) => item.title || item.content)
      : undefined,
  })).filter((block) => block.title || block.content)
}

router.get('/home', (_req, res) => {
  res.json({
    data: db.home_config,
    series: [...db.fabric_series].sort(sortByOrderIndex),
  })
})

router.get('/bootstrap', (_req, res) => {
  res.json({
    site_config: db.site_config,
    navigation: [...db.navigation].sort(sortByOrderIndex),
    home_config: db.home_config,
    series: [...db.fabric_series].sort(sortByOrderIndex),
  })
})

router.get('/translations/:locale', (req, res) => {
  const locale = req.params.locale
  res.json({ data: locale === 'en' ? (db.translations?.en || {}) : {} })
})

router.get('/admin/localizations', authMiddleware, (_req, res) => {
  res.json({
    data: {
      sources: publicTranslationSources(),
      translations: db.translations?.en || {},
    },
  })
})

router.put('/admin/localizations/en', authMiddleware, (req: AuthRequest, res) => {
  const incoming = req.body?.translations
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    res.status(400).json({ error: '翻译数据格式无效' })
    return
  }
  const allowedSources = new Set(publicTranslationSources())
  const next: Record<string, string> = {}
  for (const [source, translation] of Object.entries(incoming as Record<string, unknown>)) {
    const normalizedSource = String(source).trim()
    const normalizedTranslation = String(translation || '').trim()
    if (!allowedSources.has(normalizedSource) || !normalizedTranslation || normalizedTranslation.length > 8000) continue
    next[normalizedSource] = normalizedTranslation
  }
  db.translations.en = next
  saveDb()
  res.json({ success: true, count: Object.keys(next).length })
})

router.get('/site-config', (_req, res) => {
  res.json({ data: db.site_config })
})

router.put('/admin/site-config', authMiddleware, (req: AuthRequest, res) => {
  db.site_config = { ...db.site_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/site-config/logo', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  db.site_config.logo_url = registerUploadedFile(req.file, 'global', '网站标志').url
  saveDb()
  res.json({ success: true, url: db.site_config.logo_url })
})

router.put('/admin/site-config/favicon', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  db.site_config.favicon_url = registerUploadedFile(req.file, 'global', '网站图标').url
  saveDb()
  res.json({ success: true, url: db.site_config.favicon_url })
})

router.get('/page/:pageKey', (req, res) => {
  const row = db.page_configs.find((p) => p.page_key === req.params.pageKey)
  res.json({ data: row || null })
})

router.get('/navigation', (_req, res) => {
  res.json({ data: db.navigation.sort(sortByOrderIndex) })
})

router.get('/footer', (_req, res) => {
  res.json({ data: db.footer_config })
})

router.get('/social', (_req, res) => {
  res.json({ data: db.social_media })
})

router.get('/contact-config', (_req, res) => {
  const { email, phone, address, response_text } = db.contact_config
  res.json({ data: { email, phone, address, response_text } })
})

router.put('/admin/contact-config', authMiddleware, (req: AuthRequest, res) => {
  db.contact_config = { ...db.contact_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.get('/content-sections/:pageKey', (req, res) => {
  res.json({ data: db.fluorine_sections.filter((section) => section.page_key === req.params.pageKey && section.status !== 'draft').sort(sortByOrderIndex) })
})

router.get('/admin/content-sections/:pageKey', authMiddleware, (req, res) => {
  res.json({ data: db.fluorine_sections.filter((section) => section.page_key === req.params.pageKey).sort(sortByOrderIndex) })
})

router.post('/admin/content-sections/:pageKey', authMiddleware, (req: AuthRequest, res) => {
  const title = String(req.body.title || '').trim()
  if (!title) { res.status(400).json({ error: '标题不能为空' }); return }

  const pageKey = req.params.pageKey
  const navLabelResult = pageKey === 'pfas-free-innovation'
    ? validateTechnologyNavLabel(req.body.nav_label, title)
    : { value: String(req.body.nav_label || title).trim() }
  if ('error' in navLabelResult) { res.status(400).json({ error: navLabelResult.error }); return }
  const pageSections = db.fluorine_sections.filter((section) => section.page_key === pageKey)
  const moduleType = String(req.body.module_type || 'rich').trim()
  const status = pageKey === 'pfas-free-innovation'
    ? (req.body.status === 'published' ? 'published' : 'draft')
    : (req.body.status === 'draft' ? 'draft' : 'published')
  const imageUrl = req.body.image_url || null
  if (pageKey === 'pfas-free-innovation' && status === 'published' && !imageUrl) {
    res.status(400).json({ error: '发布技术模块前请先上传配图' })
    return
  }
  if (pageKey === 'services' && pageSections.some((section) => section.module_type === moduleType)) {
    res.status(409).json({ error: '该服务模块已存在' })
    return
  }
  const newSection = {
    id: getNextId(db.fluorine_sections),
    page_key: pageKey,
    order_index: nextOrderIndex(pageSections),
    section_key: String(req.body.section_key || '').trim(),
    module_type: moduleType,
    nav_label: navLabelResult.value,
    eyebrow: String(req.body.eyebrow || '').trim(),
    title,
    subtitle: String(req.body.subtitle || '').trim(),
    content: String(req.body.content || ''),
    image_url: imageUrl,
    image_fit: req.body.image_fit === 'contain' ? 'contain' : 'cover',
    status,
    hero_statement: String(req.body.hero_statement || '').trim(),
    hero_scroll_label: String(req.body.hero_scroll_label || '').trim(),
    content_blocks: normalizeTechnologyContentBlocks(req.body.content_blocks),
  }
  db.fluorine_sections.push(newSection)
  saveDb()
  res.json({ success: true, id: newSection.id })
})

router.put('/admin/content-sections/:pageKey/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fluorine_sections.find((section) => section.id === id && section.page_key === req.params.pageKey)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const title = String(req.body.title ?? existing.title).trim()
  if (!title) { res.status(400).json({ error: '标题不能为空' }); return }
  const navLabelResult = req.params.pageKey === 'pfas-free-innovation'
    ? validateTechnologyNavLabel(req.body.nav_label ?? existing.nav_label, title)
    : { value: String(req.body.nav_label ?? existing.nav_label ?? title).trim() }
  if ('error' in navLabelResult) { res.status(400).json({ error: navLabelResult.error }); return }
  const imageUrl = Object.prototype.hasOwnProperty.call(req.body, 'image_url') ? (req.body.image_url || null) : existing.image_url
  const status = req.body.status === 'draft' ? 'draft' : req.body.status === 'published' ? 'published' : (existing.status || 'published')
  if (req.params.pageKey === 'pfas-free-innovation' && existing.status === 'draft' && status === 'published' && !imageUrl) {
    res.status(400).json({ error: '发布技术模块前请先上传配图' })
    return
  }
  updateById(db.fluorine_sections, id, {
    nav_label: navLabelResult.value,
    eyebrow: String(req.body.eyebrow ?? existing.eyebrow ?? '').trim(),
    title,
    subtitle: String(req.body.subtitle ?? existing.subtitle).trim(),
    content: String(req.body.content ?? existing.content),
    image_url: imageUrl,
    image_fit: req.body.image_fit === 'contain' ? 'contain' : 'cover',
    status,
    hero_statement: String(req.body.hero_statement ?? existing.hero_statement ?? '').trim(),
    hero_scroll_label: String(req.body.hero_scroll_label ?? existing.hero_scroll_label ?? '').trim(),
    content_blocks: Object.prototype.hasOwnProperty.call(req.body, 'content_blocks')
      ? normalizeTechnologyContentBlocks(req.body.content_blocks)
      : existing.content_blocks,
  })
  saveDb()
  res.json({ success: true })
})

router.put('/admin/content-section-order/:pageKey', authMiddleware, (req: AuthRequest, res) => {
  const ids = Array.isArray(req.body.ordered_ids) ? req.body.ordered_ids.map(Number) : []
  const validIds = new Set(db.fluorine_sections.filter((section) => section.page_key === req.params.pageKey).map((section) => section.id))
  if (ids.length !== validIds.size || ids.some((id: number) => !validIds.has(id))) {
    res.status(400).json({ error: '排序数据无效' })
    return
  }
  ids.forEach((id: number, order_index: number) => updateById(db.fluorine_sections, id, { order_index }))
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/content-sections/:pageKey/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fluorine_sections.find((section) => section.id === id && section.page_key === req.params.pageKey)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  deleteById(db.fluorine_sections, id)
  db.fluorine_sections
    .filter((section) => section.page_key === req.params.pageKey)
    .sort(sortByOrderIndex)
    .forEach((section, order_index) => { section.order_index = order_index })
  saveDb()
  res.json({ success: true })
})

router.put('/admin/home', authMiddleware, (req: AuthRequest, res) => {
  db.home_config = { ...db.home_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/home/background', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  db.home_config.hero_background = registerUploadedFile(req.file, 'home', '首页桌面首图').url
  saveDb()
  res.json({ success: true, url: db.home_config.hero_background })
})

router.put('/admin/home/mobile-background', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  db.home_config.hero_mobile_background = registerUploadedFile(req.file, 'home', '首页移动端首图').url
  saveDb()
  res.json({ success: true, url: db.home_config.hero_mobile_background })
})

router.put('/admin/page/:pageKey', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.page_configs.findIndex((p) => p.page_key === req.params.pageKey)
  if (idx >= 0) {
    db.page_configs[idx] = { ...db.page_configs[idx], ...req.body }
    saveDb()
  }
  res.json({ success: true })
})

router.put('/admin/navigation', authMiddleware, (req: AuthRequest, res) => {
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    res.status(400).json({ error: '至少需要保留一个一级菜单' })
    return
  }
  const cleanText = (value: unknown) => String(value || '').trim()
  let nextNavigationId = getNextId(db.navigation)
  const sanitized = req.body.items.map((item: any, i: number) => {
    const id = Number(item.id) || nextNavigationId++
    return {
      id,
      label: cleanText(item.label),
      link: cleanText(item.link),
      order_index: i,
      mega_menu: (Array.isArray(item.mega_menu) ? item.mega_menu : [])
        .map((group: any, groupIndex: number) => ({
          id: cleanText(group.id) || `nav-${id}-group-${groupIndex + 1}`,
          title: cleanText(group.title),
          link: cleanText(group.link),
          order_index: groupIndex,
          items: (Array.isArray(group.items) ? group.items : [])
            .map((link: any, linkIndex: number) => ({
              id: cleanText(link.id) || `nav-${id}-group-${groupIndex + 1}-item-${linkIndex + 1}`,
              label: cleanText(link.label),
              link: cleanText(link.link),
              order_index: linkIndex,
            }))
            .filter((link: any) => link.label && link.link),
        }))
        .filter((group: any) => group.title && (group.link || group.items.length)),
    }
  })
  if (sanitized.some((item: any) => !item.label || !item.link)) {
    res.status(400).json({ error: '一级菜单名称和链接不能为空' })
    return
  }
  if (new Set(sanitized.map((item: any) => item.link)).size !== sanitized.length) {
    res.status(400).json({ error: '一级菜单链接不能重复' })
    return
  }
  db.navigation = sanitized
  saveDb()
  res.json({ success: true })
})

router.get('/admin/cms-config', authMiddleware, (_req, res) => {
  res.json({ data: db.cms_config })
})

router.put('/admin/cms-config', authMiddleware, (req: AuthRequest, res) => {
  const allowedModules = ['home', 'fabrics', 'equipment', 'technology', 'services', 'contact', 'media']
  const submittedOrder = Array.isArray(req.body.module_order)
    ? req.body.module_order.map((value: unknown) => String(value)).filter((value: string) => allowedModules.includes(value))
    : []
  const uniqueOrder = [...new Set(submittedOrder)]
  db.cms_config = {
    ...db.cms_config,
    module_order: [...uniqueOrder, ...allowedModules.filter((value) => !uniqueOrder.includes(value))],
  }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/footer', authMiddleware, (req: AuthRequest, res) => {
  db.footer_config = { ...db.footer_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/social', authMiddleware, upload.single('qrcode'), (req: AuthRequest, res) => {
  const { platform, account } = req.body
  const idx = db.social_media.findIndex((s) => s.platform === platform)
  const qrcode_url = req.file ? registerUploadedFile(req.file, 'global', `${platform || ''}二维码`).url : req.body.qrcode_url
  if (idx >= 0) {
    db.social_media[idx] = { ...db.social_media[idx], account, qrcode_url }
    saveDb()
  }
  res.json({ success: true })
})

router.get('/inquiry-subjects', (_req, res) => {
  res.json({ data: db.inquiry_subjects.sort(sortByOrderIndex) })
})

router.put('/admin/inquiry-subjects', authMiddleware, (req: AuthRequest, res) => {
  db.inquiry_subjects = (req.body.items || []).map((item: any, i: number) => ({
    id: item.id || getNextId(db.inquiry_subjects),
    label: item.label,
    order_index: i,
  }))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/contact-messages', authMiddleware, (_req, res) => {
  res.json({ data: db.contact_messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) })
})

router.delete('/admin/contact-messages/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.contact_messages, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.post('/contact', async (req, res) => {
  const { name, company, position, email, phone, subject, cooperation_type, message } = req.body
  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: '缺少必填字段' })
    return
  }

  // Save to database
  const msg = {
    id: getNextId(db.contact_messages),
    name,
    company: company || '',
    position: position || '',
    email,
    phone: phone || '',
    subject,
    cooperation_type: cooperation_type || '',
    message,
    created_at: new Date().toISOString(),
  }
  db.contact_messages.push(msg)
  saveDb()

  // Try to send email if SMTP is configured
  const cfg = db.contact_config
  let emailSent = false
  if (cfg.smtp_host && cfg.smtp_user) {
    try {
      const transporter = nodemailer.createTransport({
        host: cfg.smtp_host,
        port: cfg.smtp_port || 587,
        secure: cfg.smtp_secure || false,
        auth: {
          user: cfg.smtp_user,
          pass: cfg.smtp_pass || '',
        },
      })

      const mailBody = `您收到一条新的网站留言：

━━━━━━━━━━━━━━━━━━━━
客户身份：${cooperation_type || '普通咨询'}
咨询主题：${subject}
姓名：${name}
公司：${company || '未填写'}
职位：${position || '未填写'}
邮箱：${email}
电话：${phone || '未填写'}
━━━━━━━━━━━━━━━━━━━━

留言内容：
${message}

━━━━━━━━━━━━━━━━━━━━
提交时间：${new Date().toLocaleString('zh-CN')}
`

      await transporter.sendMail({
        from: `"${cfg.smtp_user}" <${cfg.smtp_user}>`,
        to: cfg.email || 'contact@gangyi.tech',
        subject: `[网站留言] ${subject}`,
        text: mailBody,
      })
      emailSent = true
    } catch (err: any) {
      console.error('Email send failed:', err.message)
    }
  }

  res.json({ success: true, email_sent: emailSent })
})

export default router
