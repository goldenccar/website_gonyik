import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import api, { getFooter, getSocial } from '@/api/client'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'
import type { FooterConfig, SocialMedia } from '@/types'

const PLATFORM_NAMES: Record<string, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  douyin: '抖音',
}

export default function AdminFooterManager() {
  const navigate = useNavigate()
  const [footer, setFooter] = useState<FooterConfig | null>(null)
  const [socials, setSocials] = useState<SocialMedia[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getFooter().then((res) => setFooter(res.data.data || {}))
    getSocial().then((res) => setSocials(res.data.data || []))
  }, [])

  const handleSaveFooter = async () => {
    if (!footer) return
    setSaving(true)
    try {
      await api.put('/admin/footer', footer)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSocialUpload = async (platform: string, file: File) => {
    const fd = new FormData()
    fd.append('qrcode', file)
    fd.append('platform', platform)
    const s = socials.find((x) => x.platform === platform)
    if (s) fd.append('account', s.account)
    try {
      await api.put('/admin/social', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const res = await getSocial()
      setSocials(res.data.data || [])
      setMessage('二维码上传成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('上传失败')
    }
  }

  const updateSocialAccount = (platform: string, account: string) => {
    setSocials((prev) =>
      prev.map((s) => (s.platform === platform ? { ...s, account } : s))
    )
  }

  const saveSocialAccount = async (platform: string) => {
    const s = socials.find((x) => x.platform === platform)
    if (!s) return
    try {
      await api.put('/admin/social', {
        platform,
        account: s.account,
        qrcode_url: s.qrcode_url,
      })
      setMessage('账号保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('保存失败')
    }
  }

  const field = (label: string, key: keyof FooterConfig, textarea = false) => (
    <div className="mb-6">
      <label className="block text-[12px] text-secondary uppercase mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={footer?.[key] || ''}
          onChange={(e) => setFooter((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          rows={10}
          className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none font-mono"
        />
      ) : (
        <input
          type="text"
          value={footer?.[key] || ''}
          onChange={(e) => setFooter((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
          className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
        />
      )}
    </div>
  )

  return (
    <Dashboard>
      <div className="max-w-[800px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">Footer 管理</h1>
          </div>
          <SaveButton onClick={handleSaveFooter} loading={saving} />
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {/* Footer 信息 */}
        <div className="mb-10">
          <h2 className="text-[14px] text-white font-medium mb-6 pb-2 border-b border-borderDark">底栏内容</h2>
          {field('品牌小标题', 'brand_tag')}
          {field('品牌标题', 'brand_title')}
          {field('品牌说明', 'brand_description', true)}
          <div className="grid grid-cols-2 gap-x-6">
            {field('材料栏目标题', 'material_title')}
            {field('支持栏目标题', 'support_title')}
            {field('联系栏目标题', 'contact_title')}
            {field('联系栏目说明', 'contact_subtitle')}
          </div>
          <p className="-mt-2 mb-8 text-[12px] text-secondary">栏目链接复用“顶栏管理”的名称、地址和顺序；联系邮箱复用“联系我们”配置。</p>

          <h2 className="text-[14px] text-white font-medium mb-6 pb-2 border-b border-borderDark">法律与备案信息</h2>
          {field('版权文字', 'copyright')}
          {field('ICP 备案号', 'icp_number')}
          {field('ICP 链接', 'icp_link')}
          {field('公安联网备案号', 'police_number')}
          {field('公安备案链接', 'police_link')}
          {field('隐私政策链接', 'privacy_policy_link')}
          {field('隐私政策内容（支持 HTML）', 'privacy_policy_content', true)}
          <p className="text-[12px] text-secondary -mt-4 mb-6">支持 HTML 标签，如 &lt;h2&gt;、&lt;h3&gt;、&lt;p&gt; 等</p>
        </div>

        {/* 社交账号 */}
        <div>
          <h2 className="text-[14px] text-white font-medium mb-6 pb-2 border-b border-borderDark">社交账号管理</h2>
          <div className="space-y-8">
            {socials.map((s) => (
              <div key={s.platform} className="bg-white/5 p-5">
                <h3 className="text-white text-[14px] font-medium mb-4">{PLATFORM_NAMES[s.platform] || s.platform}</h3>

                {/* 账号 */}
                <div className="mb-4">
                  <label className="block text-[12px] text-secondary uppercase mb-2">账号名称</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={s.account}
                      onChange={(e) => updateSocialAccount(s.platform, e.target.value)}
                      className="flex-1 bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none"
                    />
                    <SaveButton onClick={() => saveSocialAccount(s.platform)} size="sm">保存账号</SaveButton>
                  </div>
                </div>

                {/* 二维码 */}
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-2">二维码</label>
                  {s.qrcode_url && (
                    <div className="mb-3">
                      <img src={s.qrcode_url} alt="QR" className="w-[120px] h-[120px] object-contain bg-white p-1" />
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 bg-accentWarm text-white px-4 py-2 text-[13px] font-medium rounded shadow-sm hover:bg-accentWarm/90 cursor-pointer transition-colors">
                    <Upload size={16} />
                    <span>{s.qrcode_url ? '更换二维码' : '上传二维码'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleSocialUpload(s.platform, file)
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dashboard>
  )
}
