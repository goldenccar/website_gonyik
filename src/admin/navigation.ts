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
  Sun,
  type LucideIcon,
} from 'lucide-react'

export interface AdminMenuItem {
  label: string
  icon: LucideIcon
  path: string
}

export interface AdminMenuGroup {
  label: string
  icon: LucideIcon
  children: AdminMenuItem[]
}

export const ADMIN_MENU_GROUPS: AdminMenuGroup[] = [
  { label: '首页', icon: Home, children: [{ label: '首页管理', icon: Home, path: '/admin/home' }] },
  { label: '面料数据库', icon: Layers, children: [{ label: '页面配置', icon: FileText, path: '/admin/fabrics/config' }, { label: '面料系列管理', icon: Layers, path: '/admin/fabrics' }] },
  { label: '终端装备', icon: Shirt, children: [{ label: '页面配置', icon: FileText, path: '/admin/equipment/config' }, { label: '终端装备管理', icon: Shirt, path: '/admin/equipment' }] },
  { label: '技术创新', icon: Sun, children: [{ label: '页面配置', icon: FileText, path: '/admin/fluorine/config' }, { label: '技术创新内容管理', icon: Sun, path: '/admin/fluorine' }] },
  { label: '服务与支持', icon: HelpCircle, children: [{ label: '页面配置', icon: FileText, path: '/admin/services/config' }, { label: '服务与支持管理', icon: HelpCircle, path: '/admin/services' }] },
  { label: '联系我们', icon: Mail, children: [{ label: '页面配置', icon: FileText, path: '/admin/contact/config' }, { label: '联系配置', icon: Mail, path: '/admin/contact-config' }, { label: '咨询主题管理', icon: Mail, path: '/admin/inquiry-subjects' }, { label: '留言管理', icon: MessageSquare, path: '/admin/contact-messages' }] },
  { label: '站点框架', icon: Settings, children: [{ label: '品牌设置', icon: Palette, path: '/admin/brand' }, { label: 'Header 管理', icon: Settings, path: '/admin/header' }, { label: 'Footer 管理', icon: Dock, path: '/admin/footer' }] },
  { label: '资源库', icon: Image, children: [{ label: '多媒体资源库', icon: Image, path: '/admin/media' }] },
]

export function getAdminPageLabel(pathname: string) {
  return ADMIN_MENU_GROUPS.flatMap((group) => group.children).find((item) => item.path === pathname)?.label || '港翼科技 CMS'
}
