import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown } from 'lucide-react'
import api, { getFluorineSections } from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'
import SaveButton from './components/SaveButton'

export default function AdminServiceManager() {
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

    if (activeTab === 'about' && editing?.type === 'milestone') {
      const payload = { year: data.year, event: data.event }
      if (editing?.id) {
        await api.put(`/services/admin/milestones/${editing.id}`, payload)
      } else {
        await api.post('/services/admin/milestones', payload)
      }
    } else if (activeTab === 'about') {
      const payload = { number: Number(data.number), title: data.title, description: data.description }
      if (editing?.id) {
        await api.put(`/services/admin/philosophies/${editing.id}`, payload)
      } else {
        await api.post('/services/admin/philosophies', payload)
      }
    } else {
      const endpoint = activeTab === 'care' ? 'care-guides' : 'faqs'
      const payload = activeTab === 'care'
        ? { icon: data.icon, title: data.title, content: data.content }
        : { question: data.question, answer: data.answer, category: data.category }
      if (editing?.id) {
        await api.put(`/services/admin/${endpoint}/${editing.id}`, payload)
      } else {
        await api.post(`/services/admin/${endpoint}`, payload)
      }
    }
    setShowForm(false); setEditing(null); load()
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const del = async (id: number, itemType?: string) => {
    if (!confirm('确定删除？')) return
    let endpoint = activeTab === 'care' ? 'care-guides' : 'faqs'
    if (itemType === 'milestone') endpoint = 'milestones'
    if (itemType === 'philosophy') endpoint = 'philosophies'
    await api.delete(`/services/admin/${endpoint}/${id}`)
    load()
  }

  const moveMilestone = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= milestones.length) return
    const itemA = milestones[index]
    const itemB = milestones[newIndex]
    await api.put(`/services/admin/milestones/${itemA.id}`, { order_index: itemB.order_index })
    await api.put(`/services/admin/milestones/${itemB.id}`, { order_index: itemA.order_index })
    load()
  }

  return (
    <Dashboard>
      <div>
        <AdminHeader title="服务与支持管理" />
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
                <SaveButton onClick={saveAbout} size="sm">保存</SaveButton>
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
                      <button onClick={() => del(p.id, 'philosophy')} className="text-error hover:text-white"><Trash2 size={14} /></button>
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
                {milestones.map((m, idx) => (
                  <div key={m.id} className="flex items-center justify-between bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveMilestone(idx, -1)} disabled={idx === 0} className="text-accent hover:text-white disabled:opacity-30"><ArrowUp size={14} /></button>
                        <button onClick={() => moveMilestone(idx, 1)} disabled={idx === milestones.length - 1} className="text-accent hover:text-white disabled:opacity-30"><ArrowDown size={14} /></button>
                      </div>
                      <div><span className="text-white font-bold mr-3">{m.year}</span><span className="text-accent">{m.event}</span></div>
                    </div>
                    <div>
                      <button onClick={() => { setEditing({ ...m, type: 'milestone' }); setShowForm(true) }} className="text-accent hover:text-white mr-2"><Edit2 size={14} /></button>
                      <button onClick={() => del(m.id, 'milestone')} className="text-error hover:text-white"><Trash2 size={14} /></button>
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
                <p><code className="text-accent">&lt;t&gt;...&lt;/t&gt;</code> → 翻译（默认隐藏，点击展开）</p>
                <p><code className="text-accent">/h</code> → 换行分段</p>
              </div>
            </div>
            {fluorineSections.map((section) => (
              <div key={section.id} className="bg-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">{section.title}</h3>
                  <SaveButton onClick={() => saveFluorineSection(section)} size="sm">
                    保存
                  </SaveButton>
                </div>
                <div className="space-y-4">
                  <FormField label="标题" name={`title-${section.id}`} value={section.title || ''} onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, title: e.target.value } : s))} />
                  <FormField label="摘要" name={`subtitle-${section.id}`} value={section.subtitle || ''} onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, subtitle: e.target.value } : s))} />
                  <FormField label="配图 URL" name={`image-${section.id}`} value={section.image_url || ''} onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, image_url: e.target.value } : s))} placeholder="留空则显示占位图" />
                  <FormField label="正文内容" name={`content-${section.id}`} value={section.content || ''} onChange={(e) => setFluorineSections((prev) => prev.map((s) => s.id === section.id ? { ...s, content: e.target.value } : s))} textarea rows={10} />
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <Modal title={editing ? '编辑' : '新增'} onClose={() => setShowForm(false)}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'about' && editing?.type === 'milestone' ? (
                <>
                  <FormField label="时间" name="year" defaultValue={editing?.year} required />
                  <FormField label="事件" name="event" defaultValue={editing?.event} required />
                </>
              ) : activeTab === 'about' ? (
                <>
                  <FormField label="编号" name="number" type="number" defaultValue={editing?.number} required />
                  <FormField label="标题" name="title" defaultValue={editing?.title} required />
                  <FormField label="描述" name="description" defaultValue={editing?.description} textarea />
                </>
              ) : activeTab === 'care' ? (
                <>
                  <FormField label="图标（Lucide 名称）" name="icon" defaultValue={editing?.icon} required />
                  <FormField label="标题" name="title" defaultValue={editing?.title} required />
                  <FormField label="内容" name="content" defaultValue={editing?.content} textarea rows={4} required />
                </>
              ) : (
                <>
                  <FormField label="问题" name="question" defaultValue={editing?.question} required />
                  <FormField label="答案" name="answer" defaultValue={editing?.answer} textarea rows={4} required />
                  <FormField label="分类" name="category" defaultValue={editing?.category} />
                </>
              )}
              <SaveCancelButtons onCancel={() => setShowForm(false)} />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
