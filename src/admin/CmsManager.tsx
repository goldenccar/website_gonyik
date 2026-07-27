import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { getAdminCmsConfig, updateAdminCmsConfig } from '@/api/client'
import { ADMIN_REORDERABLE_GROUPS, DEFAULT_ADMIN_MODULE_ORDER } from './navigation'
import Dashboard from './Dashboard'
import AdminHeader from './components/AdminHeader'
import SaveButton from './components/SaveButton'

function moveAt(items: string[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= items.length) return items
  const next = [...items]
  const [removed] = next.splice(index, 1)
  next.splice(nextIndex, 0, removed)
  return next
}

export default function CmsManager() {
  const [order, setOrder] = useState<string[]>(DEFAULT_ADMIN_MODULE_ORDER)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const groups = useMemo(() => {
    const map = new Map(ADMIN_REORDERABLE_GROUPS.map((group) => [group.id, group]))
    return order.map((id) => map.get(id)).filter(Boolean) as typeof ADMIN_REORDERABLE_GROUPS
  }, [order])

  useEffect(() => {
    getAdminCmsConfig().then((response) => {
      const configured = response.data.data?.module_order || []
      const valid = configured.filter((id: string) => DEFAULT_ADMIN_MODULE_ORDER.includes(id))
      const missing = DEFAULT_ADMIN_MODULE_ORDER.filter((id) => !valid.includes(id))
      setOrder([...valid, ...missing])
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await updateAdminCmsConfig({ module_order: order })
      setMessage('排序已保存，刷新后台页面后生效')
      setTimeout(() => setMessage(''), 2500)
    } catch {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dashboard>
      <div className="max-w-[720px]">
        <AdminHeader title="CMS 管理" action={<SaveButton onClick={save} loading={saving} />} />
        <p className="mb-6 text-[13px] leading-6 text-secondary">
          调整后台内容模块的显示顺序。“页面框架”固定在顶部，“CMS 管理”固定在底部。
        </p>
        {message && <p className="mb-4 text-[13px] text-success">{message}</p>}
        <div className="divide-y divide-borderDark border border-borderDark bg-dark">
          {groups.map((group, index) => {
            const Icon = group.icon
            return (
              <div key={group.id} className="flex min-h-16 items-center gap-4 px-4">
                <Icon size={18} className="text-accent" />
                <span className="flex-1 text-[14px] text-white">{group.label}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setOrder((previous) => moveAt(previous, index, -1))} disabled={index === 0} className="grid size-9 place-items-center text-white/55 hover:bg-white/5 hover:text-white disabled:opacity-20" aria-label={`上移${group.label}`}><ArrowUp size={16} /></button>
                  <button type="button" onClick={() => setOrder((previous) => moveAt(previous, index, 1))} disabled={index === groups.length - 1} className="grid size-9 place-items-center text-white/55 hover:bg-white/5 hover:text-white disabled:opacity-20" aria-label={`下移${group.label}`}><ArrowDown size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Dashboard>
  )
}
