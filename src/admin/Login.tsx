import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/client'

export default function AdminLogin() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/admin/login', { username, password })
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.token)
        navigate('/admin/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-darker flex items-center justify-center px-6">
      <div className="w-full max-w-[400px] bg-dark p-12">
        <h1 className="text-h3 text-white mb-8 text-center">管理后台</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[12px] text-secondary uppercase mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] text-secondary uppercase mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-borderDark text-white px-4 py-3 text-[14px] focus:border-white focus:outline-none transition-colors"
            />
          </div>
          {error && <p className="text-error text-[13px]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-primary py-3.5 text-[14px] font-medium hover:bg-bg transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
