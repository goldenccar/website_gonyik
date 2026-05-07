import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Copy, Upload, Edit2, X, Save, Image, FileText, Film, Music, File } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'home', label: '首页' },
  { key: 'fabrics', label: '面料数据库' },
  { key: 'equipment', label: '终端装备' },
  { key: 'fluorine', label: 'RPO材料平台' },
  { key: 'services', label: '服务与支持' },
  { key: 'contact', label: '联系我们' },
  { key: 'global', label: '全局组件' },
  { key: 'admin', label: '后台管理' },
  { key: 'other', label: '其他' },
]

const CATEGORY_COLORS: Record<string, string> = {
  home: '#4A7BA7',
  fabrics: '#5A8A6E',
  equipment: '#6B7B8C',
  fluorine: '#8B6914',
  services: '#7B5EA7',
  contact: '#8B3A3A',
  global: '#C48A4D',
  admin: '#4A6FA5',
  other: '#888888',
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.includes('pdf')) return FileText
  if (type.startsWith('video/')) return Film
  if (type.startsWith('audio/')) return Music
  return File
}

function isImage(type: string) {
  return type.startsWith('image/')
}

interface MediaItem {
  id: number
  filename: string
  url: string
  category: string
  description: string
  file_type: string
  size: number
  created_at: string
}

export default function AdminMediaLibrary() {
  const navigate = useNavigate()
  const [items, setItems] = useState<MediaItem[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [message, setMessage] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [editing, setEditing] = useState<MediaItem | null>(null)

  const load = async () => {
    const res = await api.get('/media/admin')
    setItems(res.data.data || [])
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return items
    return items.filter((i) => i.category === activeCategory)
  }, [items, activeCategory])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (!fd.get('file')) { setMessage('请选择文件'); return }
    await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setShowUpload(false)
    load()
    setMessage('上传成功'); setTimeout(() => setMessage(''), 2000)
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    await api.put(`/media/admin/${editing.id}`, {
      category: fd.get('category'),
      description: fd.get('description'),
    })
    setEditing(null)
    load()
    setMessage('保存成功'); setTimeout(() => setMessage(''), 2000)
  }

  const del = async (id: number) => {
    if (!confirm('确定删除？文件和记录将同时删除。')) return
    await api.delete(`/media/${id}`)
    load()
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url)
    setMessage('链接已复制'); setTimeout(() => setMessage(''), 2000)
  }

  return (
    <Dashboard>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white"><ArrowLeft size={20} /></button>
            <h1 className="text-h3 text-white">多媒体资源库</h1>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
          >
            <Upload size={16} /> 上传文件
          </button>
        </div>

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const count = cat.key === 'all' ? items.length : items.filter((i) => i.category === cat.key).length
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 text-[12px] border transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-white text-primary border-white'
                    : 'text-accent border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat.label} <span className="text-muted ml-1">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const Icon = getFileIcon(item.file_type)
            const catLabel = CATEGORIES.find((c) => c.key === item.category)?.label || item.category
            const catColor = CATEGORY_COLORS[item.category] || '#888'
            return (
              <div key={item.id} className="bg-dark group flex flex-col">
                {/* Preview */}
                <div className="aspect-square bg-white/5 flex items-center justify-center relative overflow-hidden">
                  {isImage(item.file_type) ? (
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Icon size={32} className="mx-auto text-accent mb-2" />
                      <span className="text-[11px] uppercase text-accent">{item.filename.split('.').pop()}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(item.url)} className="p-2 bg-white/10 hover:bg-white/20 text-white" title="复制链接"><Copy size={14} /></button>
                    <button onClick={() => setEditing(item)} className="p-2 bg-white/10 hover:bg-white/20 text-white" title="编辑信息"><Edit2 size={14} /></button>
                    <button onClick={() => del(item.id)} className="p-2 bg-error/20 hover:bg-error/40 text-error" title="删除"><Trash2 size={14} /></button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 text-white" style={{ backgroundColor: catColor }}>{catLabel}</span>
                  </div>
                  <p className="text-[11px] text-accent truncate" title={item.filename}>{item.filename}</p>
                  {item.description && <p className="text-[10px] text-muted mt-1 line-clamp-2" title={item.description}>{item.description}</p>}
                  <p className="text-[10px] text-muted mt-auto pt-2">{(item.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <div className="bg-dark p-10 text-center">
            <p className="text-white text-[16px] mb-2">暂无资源</p>
            <p className="text-accent text-[13px]">该分类下还没有上传任何文件</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-dark w-full max-w-[500px] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-[18px] font-bold">上传资源</h3>
              <button onClick={() => setShowUpload(false)} className="text-accent hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">选择文件</label>
                  <input name="file" type="file" required className="w-full text-[13px] text-white file:mr-4 file:px-3 file:py-2 file:bg-white file:text-primary file:border-0 file:text-[13px]" />
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">所属模块</label>
                  <select name="category" required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none">
                    {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                      <option key={c.key} value={c.key} className="bg-dark">{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">功能说明</label>
                  <input name="description" placeholder="如：首页 Hero 背景图" className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-white text-primary py-2.5 text-[13px] font-medium hover:bg-bg">上传</button>
                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 border border-white/20 text-white py-2.5 text-[13px] hover:bg-white/5">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-dark w-full max-w-[500px] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-[18px] font-bold">编辑资源信息</h3>
              <button onClick={() => setEditing(null)} className="text-accent hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">所属模块</label>
                  <select name="category" defaultValue={editing.category} required className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none">
                    {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                      <option key={c.key} value={c.key} className="bg-dark">{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">功能说明</label>
                  <input name="description" defaultValue={editing.description} placeholder="如：首页 Hero 背景图" className="w-full bg-white/5 border border-borderDark text-white px-3 py-2.5 text-[13px] focus:border-white focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-white text-primary py-2.5 text-[13px] font-medium hover:bg-bg">保存</button>
                <button type="button" onClick={() => setEditing(null)} className="flex-1 border border-white/20 text-white py-2.5 text-[13px] hover:bg-white/5">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Dashboard>
  )
}
