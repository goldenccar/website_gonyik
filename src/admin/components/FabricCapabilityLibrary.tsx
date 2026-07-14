import { useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import api from '@/api/client'
import {
  FABRIC_CAPABILITY_THEMES,
  FABRIC_CAPABILITY_THEME_CLASSES,
  type FabricCapabilityDefinition,
} from '@/config/fabricCapabilities'
import FormField from './FormField'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import SaveCancelButtons from './SaveCancelButtons'

interface Props {
  items: FabricCapabilityDefinition[]
  onChange: () => Promise<void> | void
  onMessage: (message: string) => void
}

export default function FabricCapabilityLibrary({ items, onChange, onMessage }: Props) {
  const [editing, setEditing] = useState<FabricCapabilityDefinition | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (editing?.id) await api.put(`/fabrics/admin/capabilities/${editing.id}`, data)
      else await api.post('/fabrics/admin/capabilities', data)
      setOpen(false)
      setEditing(null)
      setError('')
      await onChange()
      onMessage('性能标签已保存')
    } catch (requestError: any) {
      setError(requestError?.response?.status === 409 ? '已存在同名标签' : '保存失败，请稍后重试')
    }
  }

  const remove = async (item: FabricCapabilityDefinition) => {
    if (!item.id || !confirm(`确定删除“${item.label}”？已关联 SKU 中的该标签也会移除。`)) return
    await api.delete(`/fabrics/admin/capabilities/${item.id}`)
    await onChange()
    onMessage('性能标签已删除')
  }

  return (
    <section className="mb-8 bg-dark p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-white">性能标签库</h2>
          <p className="mt-1 text-[12px] text-muted">统一管理 SKU 可选标签的名称与主题色。</p>
        </div>
        <PrimaryButton onClick={() => { setEditing(null); setError(''); setOpen(true) }} icon={<Plus size={16} />}>新增标签</PrimaryButton>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.key} className={`flex h-10 items-center border pl-3 ${FABRIC_CAPABILITY_THEME_CLASSES[item.theme] || FABRIC_CAPABILITY_THEME_CLASSES.neutral}`}>
            <span className="text-[13px]">{item.label}</span>
            <button type="button" onClick={() => { setEditing(item); setError(''); setOpen(true) }} className="ml-2 flex h-10 w-9 items-center justify-center border-l border-current/20" aria-label={`编辑${item.label}`}><Edit2 size={14} /></button>
            <button type="button" onClick={() => remove(item)} className="flex h-10 w-9 items-center justify-center border-l border-current/20" aria-label={`删除${item.label}`}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {open && (
        <Modal title={editing ? '编辑性能标签' : '新增性能标签'} onClose={() => { setOpen(false); setEditing(null) }}>
          <form onSubmit={save} className="space-y-4">
            <FormField label="标签名称" name="label" defaultValue={editing?.label} required />
            <FormField label="主题色" name="theme" select defaultValue={editing?.theme || 'neutral'} options={FABRIC_CAPABILITY_THEMES} />
            {error && <p className="text-[13px] text-error">{error}</p>}
            <SaveCancelButtons onCancel={() => { setOpen(false); setEditing(null) }} />
          </form>
        </Modal>
      )}
    </section>
  )
}
