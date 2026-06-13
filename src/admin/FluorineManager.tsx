import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X, Image } from 'lucide-react'
import api, { getFluorineSections, getFluorineValueChain, uploadFile } from '@/api/client'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'

interface ValueChainColumn {
  tag: string
  tag_cn: string
  title: string
  description: string
  items: string[]
}

interface ValueChainData {
  id: number
  module_tag: string
  title: string
  subtitle: string
  columns: ValueChainColumn[]
}

export default function AdminFluorineManager() {
  const navigate = useNavigate()
  const [sections, setSections] = useState<any[]>([])
  const [saveMessages, setSaveMessages] = useState<Record<number, string>>({})
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [valueChain, setValueChain] = useState<ValueChainData | null>(null)
  const [vcMessage, setVcMessage] = useState('')

  const load = async () => {
    const [sRes, vcRes] = await Promise.all([
      getFluorineSections(),
      getFluorineValueChain(),
    ])
    setSections(sRes.data.data || [])
    setValueChain(vcRes.data.data)
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
      const url = res.data.url || res.data.data?.url
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

  const saveValueChain = async () => {
    if (!valueChain) return
    try {
      await api.put('/admin/fluorine-value-chain', {
        module_tag: valueChain.module_tag,
        title: valueChain.title,
        subtitle: valueChain.subtitle,
        columns: valueChain.columns.map((c) => ({
          ...c,
          items: c.items.filter((s: string) => s.trim()),
        })),
      })
      setVcMessage('保存成功')
      setTimeout(() => setVcMessage(''), 2000)
    } catch {
      setVcMessage('保存失败')
      setTimeout(() => setVcMessage(''), 2000)
    }
  }

  const updateVcColumn = (index: number, field: keyof ValueChainColumn, value: string | string[]) => {
    if (!valueChain) return
    const newColumns = [...valueChain.columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setValueChain({ ...valueChain, columns: newColumns })
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

        {/* Sections */}
        <div className="space-y-6 mb-10">
          {sections.map((section) => (
            <div key={section.id} className="bg-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">{section.title}</h3>
                <div className="flex items-center gap-3">
                  {saveMessages[section.id] && (
                    <span className="text-[12px] text-success">{saveMessages[section.id]}</span>
                  )}
                  <SaveButton onClick={() => saveSection(section)} size="sm">
                    保存
                  </SaveButton>
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

        {/* Value Chain */}
        {valueChain && (
          <div className="bg-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold">产业链全景图</h3>
              <div className="flex items-center gap-3">
                {vcMessage && <span className="text-[12px] text-success">{vcMessage}</span>}
                <SaveButton onClick={saveValueChain} size="sm">
                  保存
                </SaveButton>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">标题</label>
                  <input
                    value={valueChain.title}
                    onChange={(e) => setValueChain({ ...valueChain, title: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">副标题（Slogan）</label>
                  <input
                    value={valueChain.subtitle}
                    onChange={(e) => setValueChain({ ...valueChain, subtitle: e.target.value })}
                    className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {valueChain.columns.map((col, idx) => (
                  <div key={idx} className="bg-white/5 p-4 border border-borderDark">
                    <h4 className="text-white text-[14px] font-medium mb-3">第 {idx + 1} 列 — {col.tag_cn}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-secondary uppercase mb-1">英文标签</label>
                        <input
                          value={col.tag}
                          onChange={(e) => updateVcColumn(idx, 'tag', e.target.value)}
                          className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-secondary uppercase mb-1">中文标签</label>
                        <input
                          value={col.tag_cn}
                          onChange={(e) => updateVcColumn(idx, 'tag_cn', e.target.value)}
                          className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-secondary uppercase mb-1">标题</label>
                        <input
                          value={col.title}
                          onChange={(e) => updateVcColumn(idx, 'title', e.target.value)}
                          className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-secondary uppercase mb-1">描述</label>
                        <input
                          value={col.description}
                          onChange={(e) => updateVcColumn(idx, 'description', e.target.value)}
                          className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-secondary uppercase mb-1">列表项（每行一个）</label>
                        <textarea
                          value={col.items.join('\n')}
                          onChange={(e) => updateVcColumn(idx, 'items', e.target.value.split('\n'))}
                          rows={4}
                          className="w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}
