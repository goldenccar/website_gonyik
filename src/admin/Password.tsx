import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'

export default function AdminPassword() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (newPassword.length < 12 || newPassword !== confirmation) {
      setMessage(newPassword.length < 12 ? '新密码至少 12 个字符。' : '两次输入的新密码不一致。')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.post('/admin/change-password', { current_password: currentPassword, new_password: newPassword })
      localStorage.removeItem('admin_must_change_password')
      navigate('/admin/home', { replace: true })
    } catch (error: any) {
      setMessage(error.response?.data?.error || '密码修改失败。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dashboard>
      <div className="max-w-[620px]">
        <AdminHeader title="修改密码" />
        <p className="mb-6 text-[13px] leading-6 text-secondary">新密码至少 12 个字符。首次登录必须完成修改后才能进入其他管理页面。</p>
        <form onSubmit={submit} className="grid gap-5">
          <label className="grid gap-2 text-[12px] uppercase text-secondary">当前密码<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="border border-borderDark bg-white/5 px-4 py-3 text-[16px] text-white outline-none focus:border-white" /></label>
          <label className="grid gap-2 text-[12px] uppercase text-secondary">新密码<input required minLength={12} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border border-borderDark bg-white/5 px-4 py-3 text-[16px] text-white outline-none focus:border-white" /></label>
          <label className="grid gap-2 text-[12px] uppercase text-secondary">确认新密码<input required minLength={12} type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="border border-borderDark bg-white/5 px-4 py-3 text-[16px] text-white outline-none focus:border-white" /></label>
          {message && <p role="alert" className="text-[13px] text-error">{message}</p>}
          <button disabled={saving} className="w-fit bg-white px-6 py-3 text-[14px] font-medium text-darker disabled:opacity-50">{saving ? '保存中…' : '保存新密码'}</button>
        </form>
      </div>
    </Dashboard>
  )
}
