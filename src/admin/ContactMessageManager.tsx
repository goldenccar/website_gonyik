import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Mail, User, Building2, Phone, Clock, MessageSquare } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'

interface ContactMessage {
  id: number
  name: string
  company: string
  email: string
  phone: string
  subject: string
  message: string
  created_at: string
}

export default function AdminContactMessageManager() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/contact-messages')
      setMessages(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const del = async (id: number) => {
    if (!confirm('确定删除这条留言？')) return
    await api.delete(`/admin/contact-messages/${id}`)
    load()
  }

  return (
    <Dashboard>
      <div className="max-w-[1200px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">留言管理</h1>
          </div>
          <span className="text-[13px] text-accent">共 {messages.length} 条留言</span>
        </div>

        {loading ? (
          <div className="text-accent text-[13px]">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="bg-dark p-10 text-center">
            <Mail size={48} className="mx-auto text-accent mb-4" />
            <p className="text-white text-[16px] mb-2">暂无留言</p>
            <p className="text-accent text-[13px]">用户提交的表单将显示在这里</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-dark p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-white/10 text-white text-[12px] px-2 py-0.5">{msg.subject}</span>
                      <span className="text-[12px] text-accent flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(msg.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-accent mb-3">
                      <span className="flex items-center gap-1"><User size={13} />{msg.name}</span>
                      {msg.company && <span className="flex items-center gap-1"><Building2 size={13} />{msg.company}</span>}
                      <span className="flex items-center gap-1"><Mail size={13} />{msg.email}</span>
                      {msg.phone && <span className="flex items-center gap-1"><Phone size={13} />{msg.phone}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => del(msg.id)}
                    className="text-accent hover:text-red-400 transition-colors p-1 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="bg-white/5 p-4">
                  <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent('回复：' + msg.subject)}`}
                    className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:text-white transition-colors"
                  >
                    <MessageSquare size={12} />
                    回复邮件
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dashboard>
  )
}
