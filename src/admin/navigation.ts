import {
  Dock,
  FileText,
  HelpCircle,
  Home,
  Image,
  Layers,
  Mail,
  MessageSquare,
  Palette,
  Settings,
  Shirt,
  SlidersHorizontal,
  Sun,
  Languages,
  type LucideIcon,
} from 'lucide-react'

export interface AdminMenuItem {
  label: string
  icon: LucideIcon
  path: string
}

export interface AdminMenuGroup {
  id: string
  label: string
  icon: LucideIcon
  children: AdminMenuItem[]
}

export const ADMIN_FIXED_START: AdminMenuGroup[] = [
  {
    id: 'site-frame',
    label: '页面框架',
    icon: Settings,
    children: [
      { label: '品牌设置', icon: Palette, path: '/admin/brand' },
      { label: 'Header 管理', icon: Settings, path: '/admin/header' },
      { label: 'Footer 管理', icon: Dock, path: '/admin/footer' },
    ],
  },
]

export const ADMIN_REORDERABLE_GROUPS: AdminMenuGroup[] = [
  { id: 'home', label: '首页', icon: Home, children: [{ label: '首页管理', icon: Home, path: '/admin/home' }] },
  { id: 'fabrics', label: '面料数据库', icon: Layers, children: [{ label: '页面配置', icon: FileText, path: '/admin/fabrics/config' }, { label: '面料系列管理', icon: Layers, path: '/admin/fabrics' }] },
  { id: 'equipment', label: '终端装备', icon: Shirt, children: [{ label: '页面配置', icon: FileText, path: '/admin/equipment/config' }, { label: '终端装备管理', icon: Shirt, path: '/admin/equipment' }] },
  { id: 'technology', label: '技术创新', icon: Sun, children: [{ label: '技术页面管理', icon: Sun, path: '/admin/fluorine' }] },
  { id: 'services', label: '服务与支持', icon: HelpCircle, children: [{ label: '页面配置', icon: FileText, path: '/admin/services/config' }, { label: '服务与支持管理', icon: HelpCircle, path: '/admin/services' }] },
  { id: 'contact', label: '联系我们', icon: Mail, children: [{ label: '页面配置', icon: FileText, path: '/admin/contact/config' }, { label: '联系配置', icon: Mail, path: '/admin/contact-config' }, { label: '咨询主题管理', icon: Mail, path: '/admin/inquiry-subjects' }, { label: '留言管理', icon: MessageSquare, path: '/admin/contact-messages' }] },
  { id: 'media', label: '资源库', icon: Image, children: [{ label: '多媒体资源库', icon: Image, path: '/admin/media' }] },
]

export const ADMIN_FIXED_END: AdminMenuGroup[] = [
  { id: 'cms', label: 'CMS 管理', icon: SlidersHorizontal, children: [
    { label: '英文内容', icon: Languages, path: '/admin/localizations' },
    { label: '模块排序', icon: SlidersHorizontal, path: '/admin/cms' },
  ] },
]

export const DEFAULT_ADMIN_MODULE_ORDER = ADMIN_REORDERABLE_GROUPS.map((group) => group.id)

export function getAdminMenuGroups(moduleOrder: string[] = []) {
  const rank = new Map(moduleOrder.map((id, index) => [id, index]))
  const fallbackRank = new Map(DEFAULT_ADMIN_MODULE_ORDER.map((id, index) => [id, index]))
  const middle = [...ADMIN_REORDERABLE_GROUPS].sort((a, b) => (
    (rank.get(a.id) ?? moduleOrder.length + (fallbackRank.get(a.id) ?? 0))
    - (rank.get(b.id) ?? moduleOrder.length + (fallbackRank.get(b.id) ?? 0))
  ))
  return [...ADMIN_FIXED_START, ...middle, ...ADMIN_FIXED_END]
}

export const ADMIN_MENU_GROUPS = getAdminMenuGroups()

export function getAdminPageLabel(pathname: string) {
  return ADMIN_MENU_GROUPS.flatMap((group) => group.children).find((item) => item.path === pathname)?.label || '港翼科技 CMS'
}
