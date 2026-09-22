import { useState } from 'react'
import { uploadFile } from '@/api/client'
import FormField from './FormField'

export default function ServiceImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <div className="space-y-3">
    <FormField label="配图地址（留空隐藏）" name="service-image" value={value} onChange={e => onChange(e.target.value)} />
    {value && <img src={value} alt="当前配图" className="h-28 max-w-full bg-white/5 object-contain" />}
    <label className="inline-block cursor-pointer border border-white/20 px-3 py-2 text-sm">{busy ? '上传中…' : '上传或替换配图'}
      <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = ''; if (!file) return
        setBusy(true); setError('')
        try { const res = await uploadFile(file); const url = res.data.url || res.data.data?.url; if (!url) throw Error(); onChange(url) }
        catch { setError('上传失败，请重试') } finally { setBusy(false) }
      }} />
    </label>
    {error && <p role="alert" className="text-error">{error}</p>}
  </div>
}
