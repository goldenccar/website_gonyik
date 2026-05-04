import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, Save } from 'lucide-react'
import api, { getFluorineSections } from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminServiceManager() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'about' | 'care' | 'faq' | 'fluorine'>('about')
  const [about, setAbout] = useState<any>({})
  const [philosophies, setPhilosophies] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [careGuides, setCareGuides] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [fluorineSections, setFluorineSections] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const load = async () => {
    const aRes = await api.get('/services/about')
    const data = aRes.data.data
    setAbout(data.about || {})
    setPhilosophies(data.philosophies || [])
    setMilestones(data.milestones || [])
    const cRes = await api.get('/services/admin/care-guides')
    setCareGuides(cRes.data.data || [])
    const fRes = await api.get('/services/admin/faqs')
    setFaqs(fRes.data.data || [])
    const fluRes = await getFluorineSections()
    setFluorineSections(fluRes.data.data || [])
  }

  useEffect(() => { load() }, [])

  const saveAbout = async () => {
    await api.put('/services/admin/about', about)
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const saveFluorineSection = async (section: any) => {
    await api.put(`/admin/fluorine-sections/${section.id}`, {
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      image_url: section.image_url,
    })
    setMessage('保存成功')
    setTimeout(() => setMessage(''), 2000)
    const fluRes = await getFluorineSections()
    setFluorineSections(fluRes.data.data || [])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd)
    const endpoint = activeTab === 'care' ? 'care-guides' : 'faqs'
    const payload = activeTab === 'care'
      ? { icon: data.icon, title: data.title, content: data.content }
      : { question: data.question, answer: data.answer, category: data.category }

    if (editing?.id) {
      await api.put(`/services/admin/${endpoint}/${editing.id}`, payload)
    } else {
      await api.post(`/services/admin/${endpoint}`, payload)
    }
    setShowForm(false); setEditing(null); load()
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const del = async (id: number) => {
    if (!confirm('确定删除？')) return
    const endpoint = activeTab === 'care' ? 'care-guides' : 'faqs'
    await api.delete(`/services/admin/${endpoint}/${id}`)
    load()
  }

  return (
    <Dashboard>
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white"><ArrowLeft size={20} /></button>
          <h1 className="text-h3 text-white">服务与支持管理</h1>
        </div>
        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="flex gap-4 mb-6 border-b border-white/10">
          {[{ key: 'about', label: '关于我们' }, { key: 'care', label: '洗护指南' }, { key: 'faq', label: 'FAQs' }, { key: 'fluorine', label: 'RPO材料平台' }].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)} className={`pb-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === t.key ? 'text-white border-white' : 'text-accent border-transparent hover:text-white'}`}>{t.label}</button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-dark p-6">
              <h3 className="text-white font-bold mb-4">公司定位</h3>
              <div className="space-y-4">
                <div><label className="block text-[12px] text-secondary uppercase mb-1">标题</label><input value={about.positioning_title || ''} onChange={(e) => setAbout({ ...about, positioning_title: e.target.value })} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                <div><label className="block text-[12px] text-secondary uppercase mb-1">内容</label><textarea value={about.positioning_content || ''} onChange={(e) => setAbout({ ...about, positioning_content: e.target.value })} rows={5} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                <div><label className="block text-[12px] text-secondary uppercase mb-1">Slogan</label><input value={about.slogan_text || ''} onChange={(e) => setAbout({ ...about, slogan_text: e.target.value })} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                <button onClick={saveAbout} className="bg-white text-primary px-5 py-2 text-[13px] font-medium hover:bg-bg">保存</button>
              </div>
            </div>

            <div className="bg-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">理念</h3>
                <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-1 bg-white text-primary px-3 py-1.5 text-[12px] font-medium hover:bg-bg"><Plus size={14} /> 新增</button>
              </div>
              <div className="space-y-3">
                {philosophies.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white/5 px-4 py-3">
                    <div><span className="text-accent mr-3">#{p.number}</span><span className="text-white">{p.title}</span></div>
                    <div>
                      <button onClick={() => { setEditing(p); setShowForm(true) }} className="text-accent hover:text-white mr-2"><Edit2 size={14} /></button>
                      <button onClick={() => del(p.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">里程碑</h3>
                <button onClick={() => { setEditing({ type: 'milestone' }); setShowForm(true) }} className="flex items-center gap-1 bg-white text-primary px-3 py-1.5 text-[12px] font-medium hover:bg-bg"><Plus size={14} /> 新增</button>
              </div>
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-white/5 px-4 py-3">
                    <div><span className="text-white font-bold mr-3">{m.year}</span><span className="text-accent">{m.event}</span></div>
                    <div>
                      <button onClick={() => { setEditing({ ...m, type: 'milestone' }); setShowForm(true) }} className="text-accent hover:text-white mr-2"><Edit2 size={14} /></button>
                      <button onClick={() => del(m.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="bg-dark">
            <div className="flex justify-end p-4">
              <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"><Plus size={16} /> 新增指南</button>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-white/10 text-accent uppercase"><tr><th className="px-6 py-3">图标</th><th className="px-6 py-3">标题</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
              <tbody className="text-white">
                {careGuides.map((g) => (
                  <tr key={g.id} className="border-b border-white/5">
                    <td className="px-6 py-4 text-accent">{g.icon}</td>
                    <td className="px-6 py-4">{g.title}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditing(g); setShowForm(true) }} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                      <button onClick={() => del(g.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="bg-dark">
            <div className="flex justify-end p-4">
              <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"><Plus size={16} /> 新增 FAQ</button>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-white/10 text-accent uppercase"><tr><th className="px-6 py-3">问题</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
              <tbody className="text-white">
                {faqs.map((f) => (
                  <tr key={f.id} className="border-b border-white/5">
                    <td className="px-6 py-4">{f.question}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditing(f); setShowForm(true) }} className="text-accent hover:text-white mr-3"><Edit2 size={14} /></button>
                      <button onClick={() => del(f.id)} className="text-error hover:text-white"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'fluorine' && (
          <div className="space-y-6">
            <div className="bg-dark p-4">
              <p className="text-[12px] text-accent mb-2">标记语言说明：</p>
              <div className="text-[12px] text-muted space-y-1">
                <p><code className="text-accent">&lt;b&gt;...&lt;/b&gt;</code> → 粗体高亮</p>
                <p><code className="text-accent">&lt;i&gt;...&lt;/i&gt;</code> → 引用（斜体灰色）</p>
                <p><code className="text-accent">&lt;note&gt;...&lt;/note&gt;</code> → 备注小字</p>
                <p><code className="text-accent">/h</code> → 换行分段</p>
              </div>
            </div>
            {fluorineSections.map((section) => (
              <div key={section.id} className="bg-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">{section.title}</h3>
                  <button
                    onClick={() => saveFluorineSection(section)}
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
                      onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, title: e.target.value } : s))}
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">摘要</label>
                    <input
                      value={section.subtitle || ''}
                      onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, subtitle: e.target.value } : s))}
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">配图 URL</label>
                    <input
                      value={section.image_url || ''}
                      onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, image_url: e.target.value } : s))}
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                      placeholder="留空则显示占位图"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-secondary uppercase mb-1">正文内容</label>
                    <textarea
                      value={section.content || ''}
                      onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, content: e.target.value } : s))}
                      rows={10}
                      className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
            <div className="bg-dark w-full max-w-[500px] p-8">
              <h3 className="text-white text-[18px] font-bold mb-6">{editing ? '编辑' : '新增'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'about' && editing?.type === 'milestone' ? (
                  <>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">年份</label><input name="year" defaultValue={editing?.year} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">事件</label><input name="event" defaultValue={editing?.event} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                  </>
                ) : activeTab === 'about' ? (
                  <>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">编号</label><input name="number" type="number" defaultValue={editing?.number} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">标题</label><input name="title" defaultValue={editing?.title} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">描述</label><textarea name="description" defaultValue={editing?.description} rows={3} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                  </>
                ) : activeTab === 'care' ? (
                  <>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">图标（Lucide 名称）</label><input name="icon" defaultValue={editing?.icon} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">标题</label><input name="title" defaultValue={editing?.title} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">内容</label><textarea name="content" defaultValue={editing?.content} rows={4} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                  </>
                ) : (
                  <>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">问题</label><input name="question" defaultValue={editing?.question} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">答案</label><textarea name="answer" defaultValue={editing?.answer} rows={4} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                    <div><label className="block text-[12px] text-secondary uppercase mb-1">分类</label><input name="category" defaultValue={editing?.category} className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none" /></div>
                  </>
                )}
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-white text-primary py-2.5 text-[13px] font-medium hover:bg-bg">保存</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-white/20 text-white py-2.5 text-[13px] hover:bg-white/5">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}
