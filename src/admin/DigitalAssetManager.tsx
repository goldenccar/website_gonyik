import { useState, useEffect } from 'react'
import { Plus, Trash2, Download } from 'lucide-react'
import api from '@/api/client'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import Modal from './components/Modal'
import FormField from './components/FormField'
import SaveCancelButtons from './components/SaveCancelButtons'

interface DigitalAsset {
  id: number
  series_slug: string
  file_name: string
  file_url: string
  file_type: string
  order_index: number
}

interface SeriesOption {
  id: number
  name: string
  slug: string
}

export default function AdminDigitalAssetManager() {
  const [assets, setAssets] = useState<DigitalAsset[]>([])
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    const [aRes, sRes] = await Promise.all([
      api.get('/fabrics/admin/digital-assets'),
      api.get('/fabrics/admin/series'),
    ])
    setAssets(aRes.data.data || [])
    setSeriesList(sRes.data.data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const file = (e.currentTarget as any).file.files[0]

    const formData = new FormData()
    formData.append('series_slug', fd.get('series_slug') as string)
    formData.append('file_name', fd.get('file_name') as string)
    formData.append('file_type', fd.get('file_type') as string)
    if (file) formData.append('file', file)

    await api.post('/fabrics/admin/digital-assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setShowForm(false)
    loadData()
    setMessage('上传成功')
    setTimeout(() => setMessage(''), 2000)
  }

  const deleteAsset = async (id: number) => {
    if (!confirm('确定删除该数字资产？')) return
    await api.delete(`/fabrics/admin/digital-assets/${id}`)
    loadData()
  }

  const grouped = assets.reduce<Record<string, DigitalAsset[]>>((acc, a) => {
    if (!acc[a.series_slug]) acc[a.series_slug] = []
    acc[a.series_slug].push(a)
    return acc
  }, {})

  const seriesName = (slug: string) =>
    seriesList.find((s) => s.slug === slug)?.name || slug

  return (
    <Dashboard>
      <div>
        <AdminHeader
          title="数字资产管理"
          action={(
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-primary px-4 py-2 text-[13px] font-medium hover:bg-bg"
            >
              <Plus size={16} />
              上传资产
            </button>
          )}
        />

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="space-y-6">
          {Object.entries(grouped).map(([slug, items]) => (
            <div key={slug} className="bg-dark">
              <div className="px-6 py-3 border-b border-white/10 text-[12px] text-accent uppercase tracking-wider">
                {seriesName(slug)}
              </div>
              <table className="w-full text-left text-[13px]">
                <tbody className="text-white">
                  {items.map((a) => (
                    <tr key={a.id} className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium">{a.file_name}</td>
                      <td className="px-6 py-4 text-accent">{a.file_type}</td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={a.file_url}
                          download
                          className="text-accent hover:text-white mr-3 inline-block"
                        >
                          <Download size={14} />
                        </a>
                        <button onClick={() => deleteAsset(a.id)} className="text-error hover:text-white">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {assets.length === 0 && (
            <p className="text-accent text-center py-12">暂无数字资产</p>
          )}
        </div>

        {showForm && (
          <Modal title="上传数字资产" onClose={() => setShowForm(false)}>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField
                label="对应面料系列"
                name="series_slug"
                select
                required
                options={[
                  { value: '', label: '请选择系列' },
                  ...seriesList.map((s) => ({ value: s.slug, label: s.name })),
                ]}
              />
              <FormField label="文件名称" name="file_name" required placeholder="如：Otter_3D_Asset_Pack.zip" />
              <FormField label="文件格式" name="file_type" required placeholder="如：zip / zfab / u3ma / sbsar / png" />
              <div>
                <label className="block text-[12px] text-secondary uppercase mb-1">上传文件</label>
                <input type="file" name="file" required className="text-white text-[13px]" />
              </div>
              <SaveCancelButtons onCancel={() => setShowForm(false)} submitLabel="上传" />
            </form>
          </Modal>
        )}
      </div>
    </Dashboard>
  )
}
