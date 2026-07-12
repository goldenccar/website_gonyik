import { Router } from 'express'
import nodemailer from 'nodemailer'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, uploadUrl, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/home', (_req, res) => {
  res.json({ data: db.home_config })
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
  db.site_config.logo_url = uploadUrl(req.file)
  saveDb()
  res.json({ success: true, url: db.site_config.logo_url })
})

router.put('/admin/site-config/favicon', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  db.site_config.favicon_url = uploadUrl(req.file)
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
  res.json({ data: db.contact_config })
})

router.put('/admin/contact-config', authMiddleware, (req: AuthRequest, res) => {
  db.contact_config = { ...db.contact_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.get('/fluorine-sections', (_req, res) => {
  res.json({ data: db.fluorine_sections.filter((s) => s.page_key === 'pfas-free-innovation').sort(sortByOrderIndex) })
})

router.put('/admin/fluorine-sections/:id', authMiddleware, (req: AuthRequest, res) => {
  const ok = updateById(db.fluorine_sections, Number(req.params.id), req.body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/fluorine-sections/:id/image-fit', authMiddleware, (req: AuthRequest, res) => {
  const ok = updateById(db.fluorine_sections, Number(req.params.id), { image_fit: req.body.image_fit })
  if (!ok) { res.status(404).json({ error: 'Not found' }); return }
  saveDb()
  res.json({ success: true })
})

// Fluorine Value Chain
router.get('/fluorine-value-chain', (_req, res) => {
  res.json({ data: db.fluorine_value_chain || null })
})

router.put('/admin/fluorine-value-chain', authMiddleware, (req: AuthRequest, res) => {
  db.fluorine_value_chain = { ...db.fluorine_value_chain, ...req.body }
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
  db.home_config.hero_background = uploadUrl(req.file)
  saveDb()
  res.json({ success: true, url: db.home_config.hero_background })
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
  db.navigation = (req.body.items || []).map((item: any, i: number) => ({ ...item, order_index: i }))
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
  const qrcode_url = req.file ? uploadUrl(req.file) : req.body.qrcode_url
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
