import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Copy, Upload } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'

export default function AdminMediaLibrary() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<any[]>([])
  const [message, setMessage] = useState('')

  const load = async () => {
    const res = await api.get('/media')
    setFiles(res.data.data || [])
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    load()
    setMessage('上传成功'); setTimeout(() => setMessage(''), 2000)
  }

  const del = async (filename: string) => {
    if (!confirm('确定删除？')) return
    await api.delete(`/media/${filename}`)
    load()
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url)
    setMessage('链接已复制'); setTimeout(() => setMessage(''), 2000)
  }

  return (
    <Dashboard>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="text-accent hover:text-white"><ArrowLeft size={20} /></button>
            <h1 className="text-h3 text-white">多媒体资源库</h1>
          </div>
          <label className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg cursor-pointer">
            <Upload size={16} /> 上传文件
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((f) => (
            <div key={f.filename} className="bg-dark group">
              <div className="aspect-square bg-white/5 flex items-center justify-center relative overflow-hidden">
                {f.filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-[11px] uppercase text-accent">{f.filename.split('.').pop()}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(f.url)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded"><Copy size={14} /></button>
                  <button onClick={() => del(f.filename)} className="p-2 bg-error/20 hover:bg-error/40 text-error rounded"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-accent truncate">{f.filename}</p>
                <p className="text-[10px] text-muted">{(f.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ))}
        </div>
        {files.length === 0 && <p className="text-accent text-center py-16">暂无资源</p>}
      </div>
    </Dashboard>
  )
}
