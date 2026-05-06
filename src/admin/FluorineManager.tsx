import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Upload, X, Image } from 'lucide-react'
import api, { getFluorineSections, uploadFile } from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminFluorineManager() {
  const navigate = useNavigate()
  const [sections, setSections] = useState<any[]>([])
  const [saveMessages, setSaveMessages] = useState<Record<number, string>>({})
  const [uploadingId, setUploadingId] = useState<number | null>(null)

  const load = async () => {
    const res = await getFluorineSections()
    setSections(res.data.data || [])
  }

  useEffect(() => { load() }, [])

  const showSectionMessage = (id: number, msg: string, duration = 2000) => {
    setSaveMessages((prev) => ({ ...prev, [id]: msg }))
    setTimeout(() => {
      setSaveMessages((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }, duration)
  }

  const saveSection = async (section: any) => {
    await api.put(`/admin/fluorine-sections/${section.id}`, {
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      image_url: section.image_url,
      image_fit: section.image_fit || 'cover',
    })
    showSectionMessage(section.id, '保存成功')
    load()
  }

  const handleImageUpload = async (sectionId: number, file: File) => {
    setUploadingId(sectionId)
    try {
      const res = await uploadFile(file)
      const url = res.data.url
      setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, image_url: url } : s))
      showSectionMessage(sectionId, '图片上传成功')
    } catch {
      showSectionMessage(sectionId, '图片上传失败', 3000)
    } finally {
      setUploadingId(null)
    }
  }

  const clearImage = (sectionId: number) => {
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, image_url: '' } : s))
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

        <div className="bg-dark p-4 mb-6">
          <p className="text-[12px] text-accent mb-2">标记语言说明：</p>
          <div className="text-[12px] text-muted space-y-1">
            <p><code className="text-accent">&lt;b&gt;...&lt;/b&gt;</code> → 粗体高亮</p>
            <p><code className="text-accent">&lt;i&gt;...&lt;/i&gt;</code> → 引用（斜体灰色）</p>
            <p><code className="text-accent">&lt;note&gt;...&lt;/note&gt;</code> → 备注小字</p>
            <p><code className="text-accent">&lt;t&gt;...&lt;/t&gt;</code> → 翻译（默认隐藏，点击展开）</p>
            <p><code className="text-accent">/h</code> → 换行分段</p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">{section.title}</h3>
                <div className="flex items-center gap-3">
                  {saveMessages[section.id] && (
                    <span className="text-[12px] text-success">{saveMessages[section.id]}</span>
                  )}
                  <button
                    onClick={() => saveSection(section)}
                    className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
                  >
                    <Save size={14} />
                    保存
                  </button>
                </div>
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
                  <label className="block text-[12px] text-secondary uppercase mb-1">配图</label>
                  <div className="flex items-center gap-3 mb-3">
                    <label className="text-[12px] text-accent">显示模式：</label>
                    {[
                      { value: 'cover', label: '填满裁剪' },
                      { value: 'contain', label: '完整显示' },
                      { value: 'original', label: '原始尺寸' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, image_fit: opt.value } : s))}
                        className={`text-[11px] px-2.5 py-1 transition-colors ${
                          section.image_fit === opt.value
                            ? 'bg-white text-primary'
                            : 'bg-white/10 text-accent hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {section.image_url ? (
                    <div className="relative mb-3">
                      <img
                        src={section.image_url}
                        alt={section.title}
                        className="w-full max-h-[300px] object-cover bg-white/5"
                      />
                      <button
                        onClick={() => clearImage(section.id)}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 hover:bg-black/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border border-dashed border-borderDark p-8 text-center mb-3 cursor-pointer hover:border-white/30 transition-colors"
                      onClick={() => document.getElementById(`file-${section.id}`)?.click()}
                    >
                      <Image size={32} className="mx-auto text-accent mb-2" />
                      <p className="text-[13px] text-accent">点击或拖拽上传图片</p>
                      <p className="text-[11px] text-muted mt-1">支持 JPG、PNG、WebP</p>
                    </div>
                  )}
                  <input
                    id={`file-${section.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(section.id, file)
                      e.currentTarget.value = ''
                    }}
                  />
                  {uploadingId === section.id && (
                    <p className="text-[12px] text-accent mb-2">上传中...</p>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      value={section.image_url || ''}
                      onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, image_url: e.target.value } : s))}
                      className="flex-1 bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                      placeholder="或手动输入图片 URL"
                    />
                    {!section.image_url && (
                      <button
                        onClick={() => document.getElementById(`file-${section.id}`)?.click()}
                        className="flex items-center gap-1.5 bg-white/10 text-white px-3 py-2 text-[12px] hover:bg-white/20 transition-colors"
                      >
                        <Upload size={14} />
                        上传
                      </button>
                    )}
                  </div>
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
