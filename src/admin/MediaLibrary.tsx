import { useState, useEffect, useMemo } from 'react'
import { Trash2, Copy, Upload, Edit2, Image, FileText, Film, Music, File } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'
import PrimaryButton from './components/PrimaryButton'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'

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

function isImage(type: string, filename: string) {
  if (type.startsWith('image/')) return true
  const ext = filename.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')
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
        <AdminHeader title="多媒体资源库" action={<PrimaryButton onClick={() => setShowUpload(true)} icon={<Upload size={16} />}>上传文件</PrimaryButton>} />

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        {/* Category Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
          {CATEGORIES.map((cat) => {
            const count = cat.key === 'all' ? items.length : items.filter((i) => i.category === cat.key).length
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`min-h-10 shrink-0 border px-3 py-1.5 text-[12px] transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-accentWarm text-white border-accentWarm'
                    : 'bg-white/5 text-accent border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat.label} <span className="text-muted ml-1">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const Icon = getFileIcon(item.file_type)
            const catLabel = CATEGORIES.find((c) => c.key === item.category)?.label || item.category
            const catColor = CATEGORY_COLORS[item.category] || '#888'
            return (
              <div key={item.id} className="bg-dark group flex flex-col">
                {/* Preview */}
                <div className="aspect-square bg-white/5 flex items-center justify-center relative overflow-hidden">
                  {isImage(item.file_type, item.filename) ? (
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Icon size={32} className="mx-auto text-accent mb-2" />
                      <span className="text-[11px] uppercase text-accent">{item.filename.split('.').pop()}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/70 py-2 opacity-100 transition-opacity md:inset-0 md:py-0 md:opacity-0 md:group-hover:opacity-100">
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
        <Modal title="上传资源" onClose={() => setShowUpload(false)}>
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-secondary uppercase mb-1">选择文件</label>
                  <input name="file" type="file" required className="min-h-11 w-full text-[16px] text-white file:mr-4 file:border-0 file:bg-white file:px-3 file:py-2 file:text-[13px] file:text-primary sm:text-[13px]" />
                </div>
                <FormField label="所属模块" name="category" select required options={CATEGORIES.filter((category) => category.key !== 'all').map((category) => ({ value: category.key, label: category.label }))} />
                <FormField label="功能说明" name="description" placeholder="如：首页 Hero 背景图" />
              </div>
              <SaveCancelButtons onCancel={() => setShowUpload(false)} submitLabel="上传" />
            </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editing && (
        <Modal title="编辑资源信息" onClose={() => setEditing(null)}>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <FormField label="所属模块" name="category" select required defaultValue={editing.category} options={CATEGORIES.filter((category) => category.key !== 'all').map((category) => ({ value: category.key, label: category.label }))} />
                <FormField label="功能说明" name="description" defaultValue={editing.description} placeholder="如：首页 Hero 背景图" />
              </div>
              <SaveCancelButtons onCancel={() => setEditing(null)} />
            </form>
        </Modal>
      )}
    </Dashboard>
  )
}
