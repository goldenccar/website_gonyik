export interface ContactSubmission {
  name: string
  company: string
  email: string
  phone: string
  subject: string
  message: string
  source_page: string
  product_model: string
}

export function validateContactSubmission(body: Record<string, unknown>, allowedSubjects: string[]): { value?: ContactSubmission; error?: string } {
  const value: ContactSubmission = {
    name: String(body?.name || '').trim(),
    company: String(body?.company || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    phone: String(body?.phone || '').trim(),
    subject: String(body?.subject || '').trim(),
    message: String(body?.message || '').trim(),
    source_page: String(body?.source_page || '').trim().slice(0, 200),
    product_model: String(body?.product_model || '').trim().slice(0, 120),
  }
  if (String(body?.website || '').trim()) return { error: '提交内容无效' }
  if (value.name.length < 1 || value.name.length > 80 || value.company.length < 1 || value.company.length > 120) return { error: '姓名或公司信息无效' }
  if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return { error: '邮箱格式无效' }
  if (value.phone.length > 80) return { error: '电话或微信信息过长' }
  if (!allowedSubjects.includes(value.subject)) return { error: '咨询方向无效' }
  if (value.message.length < 10 || value.message.length > 500) return { error: '留言须为 10 至 500 个字符' }
  return { value }
}

export function updateContactConfiguration(existing: Record<string, unknown>, body: Record<string, unknown>) {
  const email = String(body?.email || '').trim().slice(0, 254)
  const smtpPort = Number(body?.smtp_port || 587)
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: '收件邮箱格式无效' }
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) return { error: 'SMTP 端口无效' }
  const value: Record<string, unknown> = {
    ...existing,
    email,
    phone: String(body?.phone || '').trim().slice(0, 120),
    address: String(body?.address || '').trim().slice(0, 300),
    response_text: String(body?.response_text || '').trim().slice(0, 300),
    smtp_host: String(body?.smtp_host || '').trim().slice(0, 253),
    smtp_port: smtpPort,
    smtp_user: String(body?.smtp_user || '').trim().slice(0, 254),
    smtp_secure: Boolean(body?.smtp_secure),
  }
  const newPassword = String(body?.smtp_pass || '')
  if (newPassword) value.smtp_pass = newPassword.slice(0, 500)
  return { value }
}
