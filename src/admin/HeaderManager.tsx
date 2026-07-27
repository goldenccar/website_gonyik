import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import api, { getNavigation } from '@/api/client'
import type { NavItem, NavMenuGroup } from '@/types'
import Dashboard from './Dashboard'
import SaveButton from './components/SaveButton'
import AdminHeader from './components/AdminHeader'

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`

function moveAt<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= items.length) return items
  const next = [...items]
  const [removed] = next.splice(index, 1)
  next.splice(nextIndex, 0, removed)
  return next
}

export default function AdminHeaderManager() {
  const [items, setItems] = useState<NavItem[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getNavigation().then((res) => setItems(res.data.data || []))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/navigation', {
        items: items.map((item, orderIndex) => ({
          ...item,
          order_index: orderIndex,
          mega_menu: (item.mega_menu || []).map((group, groupIndex) => ({
            ...group,
            order_index: groupIndex,
            items: group.items.map((link, linkIndex) => ({ ...link, order_index: linkIndex })),
          })),
        })),
      })
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setMessage('保存失败，请检查菜单名称和链接')
    } finally {
      setSaving(false)
    }
  }

  const updateNavItem = (index: number, patch: Partial<NavItem>) => {
    setItems((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  const updateGroups = (navIndex: number, updater: (groups: NavMenuGroup[]) => NavMenuGroup[]) => {
    setItems((previous) => previous.map((item, itemIndex) => (
      itemIndex === navIndex ? { ...item, mega_menu: updater(item.mega_menu || []) } : item
    )))
  }

  return (
    <Dashboard>
      <div className="max-w-[1040px]">
        <AdminHeader title="Header 管理" action={<SaveButton onClick={handleSave} loading={saving} />} />
        <p className="mb-6 max-w-[720px] text-[13px] leading-6 text-secondary">
          一级导航显示在 Header；下拉菜单仅展示二级分组和链接名称。调整后会同时应用于桌面端与移动端。
        </p>

        {message && <p className="mb-4 text-[13px] text-success">{message}</p>}

        <div className="space-y-5">
          {items.map((item, navIndex) => (
            <section key={item.id} className="border border-borderDark bg-dark">
              <div className="flex items-start gap-4 border-b border-borderDark p-5">
                <div className="flex flex-col gap-1 pt-1">
                  <button type="button" onClick={() => setItems((previous) => moveAt(previous, navIndex, -1))} disabled={navIndex === 0} className="text-accent hover:text-white disabled:opacity-30" aria-label="上移一级导航"><ArrowUp size={16} /></button>
                  <button type="button" onClick={() => setItems((previous) => moveAt(previous, navIndex, 1))} disabled={navIndex === items.length - 1} className="text-accent hover:text-white disabled:opacity-30" aria-label="下移一级导航"><ArrowDown size={16} /></button>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-[12px] uppercase text-secondary">
                    一级菜单名称
                    <input value={item.label} onChange={(event) => updateNavItem(navIndex, { label: event.target.value })} className="mt-1 w-full border border-borderDark bg-white/5 px-3 py-2.5 text-[13px] normal-case text-white outline-none focus:border-white" />
                  </label>
                  <label className="text-[12px] uppercase text-secondary">
                    一级菜单链接
                    <input value={item.link} onChange={(event) => updateNavItem(navIndex, { link: event.target.value })} className="mt-1 w-full border border-borderDark bg-white/5 px-3 py-2.5 text-[13px] normal-case text-white outline-none focus:border-white" />
                  </label>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {(item.mega_menu || []).map((group, groupIndex) => (
                  <div key={group.id} className="border border-white/10 bg-white/[0.025] p-4">
                    <div className="mb-3 grid grid-cols-[auto_minmax(0,0.8fr)_minmax(0,1.2fr)_auto] items-center gap-2">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => updateGroups(navIndex, (groups) => moveAt(groups, groupIndex, -1))} disabled={groupIndex === 0} className="p-1 text-accent hover:text-white disabled:opacity-25" aria-label="上移菜单分组"><ArrowUp size={15} /></button>
                        <button type="button" onClick={() => updateGroups(navIndex, (groups) => moveAt(groups, groupIndex, 1))} disabled={groupIndex === (item.mega_menu || []).length - 1} className="p-1 text-accent hover:text-white disabled:opacity-25" aria-label="下移菜单分组"><ArrowDown size={15} /></button>
                      </div>
                      <input aria-label="二级分组名称" value={group.title} onChange={(event) => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, title: event.target.value } : entry))} className="min-w-0 flex-1 border-b border-white/15 bg-transparent px-2 py-2 text-[14px] font-medium text-white outline-none focus:border-accent" />
                      <input aria-label="分组链接" value={group.link || ''} onChange={(event) => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, link: event.target.value } : entry))} placeholder="分组链接（可选）" className="min-w-0 border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white outline-none focus:border-white/40" />
                      <button type="button" onClick={() => updateGroups(navIndex, (groups) => groups.filter((_, index) => index !== groupIndex))} className="p-2 text-white/45 hover:text-red-300" aria-label="删除菜单分组"><Trash2 size={16} /></button>
                    </div>

                    <div className="space-y-2 pl-1">
                      {group.items.map((link, linkIndex) => (
                        <div key={link.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[auto_minmax(0,0.7fr)_minmax(0,1.3fr)_auto]">
                          <div className="row-span-2 flex sm:row-span-1">
                            <button type="button" onClick={() => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, items: moveAt(entry.items, linkIndex, -1) } : entry))} disabled={linkIndex === 0} className="p-1 text-white/45 hover:text-white disabled:opacity-20" aria-label="上移链接"><ArrowUp size={14} /></button>
                            <button type="button" onClick={() => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, items: moveAt(entry.items, linkIndex, 1) } : entry))} disabled={linkIndex === group.items.length - 1} className="p-1 text-white/45 hover:text-white disabled:opacity-20" aria-label="下移链接"><ArrowDown size={14} /></button>
                          </div>
                          <input aria-label="链接名称" value={link.label} onChange={(event) => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, items: entry.items.map((child, childIndex) => childIndex === linkIndex ? { ...child, label: event.target.value } : child) } : entry))} placeholder="链接名称" className="min-w-0 border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-white/40" />
                          <input aria-label="链接地址" value={link.link} onChange={(event) => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, items: entry.items.map((child, childIndex) => childIndex === linkIndex ? { ...child, link: event.target.value } : child) } : entry))} placeholder="/页面路径" className="col-start-2 min-w-0 border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-white/40 sm:col-start-auto" />
                          <button type="button" onClick={() => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, items: entry.items.filter((_, childIndex) => childIndex !== linkIndex) } : entry))} className="row-span-2 row-start-1 p-2 text-white/40 hover:text-red-300 sm:row-span-1 sm:row-start-auto" aria-label="删除链接"><Trash2 size={15} /></button>
                        </div>
                      ))}
                    </div>

                    <button type="button" onClick={() => updateGroups(navIndex, (groups) => groups.map((entry, index) => index === groupIndex ? { ...entry, items: [...entry.items, { id: createId('menu-link'), label: '新链接', link: '/', order_index: entry.items.length }] } : entry))} className="mt-3 inline-flex items-center gap-1.5 px-2 py-2 text-[12px] text-accent hover:text-white"><Plus size={14} />添加链接</button>
                  </div>
                ))}

                <button type="button" onClick={() => updateGroups(navIndex, (groups) => [...groups, { id: createId('menu-group'), title: '新分组', link: '', order_index: groups.length, items: [] }])} className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[12px] text-white/70 hover:border-white/35 hover:text-white"><Plus size={15} />添加二级分组</button>
              </div>
            </section>
          ))}
        </div>
      </div>
    </Dashboard>
  )
}
