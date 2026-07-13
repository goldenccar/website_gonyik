import { useState, useEffect } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { getInquirySubjects, updateInquirySubjects } from '@/api/client'
import type { InquirySubject } from '@/types'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'
import PrimaryButton from './components/PrimaryButton'
import AdminHeader from './components/AdminHeader'

export default function AdminInquirySubjectManager() {
  const [items, setItems] = useState<InquirySubject[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getInquirySubjects().then((res) => setItems(res.data.data || []))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateInquirySubjects({ items })
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const addItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1
    setItems([...items, { id: nextId, label: '', order_index: items.length }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const move = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= items.length) return
    const next = [...items]
    const [removed] = next.splice(index, 1)
    next.splice(newIndex, 0, removed)
    setItems(next)
  }

  const updateLabel = (index: number, label: string) => {
    setItems(items.map((item, i) => i === index ? { ...item, label } : item))
  }

  return (
    <Dashboard>
      <div className="max-w-[800px]">
        <AdminHeader title="咨询主题管理" action={<SaveButton onClick={handleSave} loading={saving} />} />

        {message && <p className="text-success text-[13px] mb-4">{message}</p>}

        <div className="space-y-3 mb-6">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-dark p-4 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-accent hover:text-white disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-accent hover:text-white disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
              </div>
              <input
                value={item.label}
                onChange={(e) => updateLabel(idx, e.target.value)}
                placeholder="主题名称"
                className="flex-1 bg-white/5 border border-borderDark text-white px-3 py-2 text-[13px] focus:border-white focus:outline-none"
              />
              <button
                onClick={() => removeItem(idx)}
                className="text-accent hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <PrimaryButton onClick={addItem} icon={<Plus size={16} />}>添加主题</PrimaryButton>
      </div>
    </Dashboard>
  )
}
