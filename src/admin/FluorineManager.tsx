import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api, { getFluorineSections } from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminFluorineManager() {
  const navigate = useNavigate()
  const [sections, setSections] = useState<any[]>([])
  const [message, setMessage] = useState('')

  const load = async () => {
    const res = await getFluorineSections()
    setSections(res.data.data || [])
  }

  useEffect(() => { load() }, [])

  const saveSection = async (section: any) => {
    await api.put(`/admin/fluorine-sections/${section.id}`, {
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      image_url: section.image_url,
    })
    setMessage('保存成功')
    setTimeout(() => setMessage(''), 2000)
    load()
  }

  return (
    <Dashboard>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 text-white">RPO材料平台管理</h1>
          </div>
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="bg-dark p-4 mb-6">
          <p className="text-[12px] text-accent mb-2">标记语言说明：</p>
          <div className="text-[12px] text-muted space-y-1">
            <p><code className="text-accent">&lt;b&gt;...&lt;/b&gt;</code> → 粗体高亮</p>
            <p><code className="text-accent">&lt;i&gt;...&lt;/i&gt;</code> → 引用（斜体灰色）</p>
            <p><code className="text-accent">&lt;note&gt;...&lt;/note&gt;</code> → 备注小字</p>
            <p><code className="text-accent">/h</code> → 换行分段</p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">{section.title}</h3>
                <button
                  onClick={() => saveSection(section)}
                  className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
                >
                  <Save size={14} />
                  保存
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">标题</label>
                  <input
                    value={section.title || ''}
                    onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, title: e.target.value } : s))}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">摘要</label>
                  <input
                    value={section.subtitle || ''}
                    onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, subtitle: e.target.value } : s))}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">配图 URL</label>
                  <input
                    value={section.image_url || ''}
                    onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, image_url: e.target.value } : s))}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                    placeholder="留空则显示占位图"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">正文内容</label>
                  <textarea
                    value={section.content || ''}
                    onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, content: e.target.value } : s))}
                    rows={10}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dashboard>
  )
}
