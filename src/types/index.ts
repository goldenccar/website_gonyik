export interface HomePlatformCard {
  title: string
  subtitle: string
  description?: string
  link?: string
  visual?: 'membrane' | 'lamination' | 'supply' | 'image' | 'none'
  image_url?: string
}

export interface HomeTechnicalVisualsConfig {
  membrane_image?: string
  membrane_label?: string
  lamination_top_image?: string
  lamination_membrane_image?: string
  lamination_backing_image?: string
  lamination_label?: string
  supply_ribbon_image?: string
  supply_lab_image?: string
  supply_factory_image?: string
  supply_retail_image?: string
  supply_materials_image?: string
  supply_material_image?: string
  supply_label?: string
  supply_home_center?: string
  supply_rpo_center?: string
}

export interface HomeVerificationImage {
  id: string
  url: string
  order_index: number
}

export interface HomeConfig {
  series_entries?: Record<string, { title: string; description: string }>
  id: number
  hero_tag: string
  hero_title: string
  hero_slogan: string
  hero_background: string | null
  hero_mobile_background: string | null
  primary_btn_text: string
  primary_btn_link: string
  secondary_btn_text: string
  secondary_btn_link: string
  platform_section_title: string
  platform_section_subtitle: string
  platform_section_link_text: string
  platform_section_link: string
  platform_cards: HomePlatformCard[]
  technical_visuals?: HomeTechnicalVisualsConfig
  series_section_title: string
  series_section_subtitle: string
  series_section_link_text: string
  series_section_link: string
  verification_image: string | null
  verification_images?: HomeVerificationImage[]
  verification_section_title: string
  verification_section_subtitle: string
  verification_section_link_text: string
  verification_section_link: string
}

export interface PageConfig {
  id: number
  page_key: string
  page_title: string
  page_subtitle: string
  hero_background: string | null
  rail_end_card_visible?: boolean
  rail_end_card_title?: string
  rail_end_card_description?: string
  rail_end_card_cta_label?: string
  rail_end_card_cta_href?: string
  core_performance_title?: string
}

export interface NavItem {
  id: number
  label: string
  link: string
  order_index: number
  mega_menu?: NavMenuGroup[]
}

export interface NavMenuLink {
  id: string
  label: string
  link: string
  order_index: number
  description?: string
}

export interface NavMenuGroup {
  id: string
  title: string
  link?: string
  description?: string
  image_url?: string
  order_index: number
  items: NavMenuLink[]
}

export interface FooterConfig {
  id: number
  brand_tag: string
  brand_title: string
  brand_description: string
  material_title: string
  support_title: string
  contact_title: string
  contact_subtitle: string
  copyright: string
  privacy_policy_link: string
  icp_number: string
  icp_link: string
  police_number: string
  police_link: string
  police_badge_url?: string | null
  privacy_policy_content: string
}

export interface SocialMedia {
  id: number
  platform: string
  account: string
  qrcode_url: string | null
}

export interface FabricSeries {
  id: number
  name: string
  slug: string
  description: string
  tagline: string
  story_title?: string
  story_intro?: string
  story_highlights?: string[]
  story_features_label?: string
  story_icons?: string[]
  story_primary_label?: string
  story_primary_link?: string
  story_secondary_label?: string
  story_secondary_link?: string
  home_image: string | null
  home_badge_image: string | null
  order_index: number
}

export interface FabricSku {
  id: number
  series_id: number
  name: string
  sku_code: string
  internal_code?: string
  image: string | null
  features: string // JSON
  specifications: string // JSON
  card_summary?: string
  public_name?: string
  product_type?: string
  position_performance?: number | null
  position_durability?: number | null
  position_handfeel?: number | null
  visibility?: 'public' | 'hidden'
  status?: 'active' | 'archived'
  order_index: number
}

export interface EquipmentCategory {
  id: number
  parent_id: number | null
  name: string
  slug: string
  description: string
  visibility: 'public' | 'hidden'
  order_index: number
  product_count?: number
}

export interface EquipmentProduct {
  id: number
  name: string
  image: string | null
  features: string // JSON
  card_summary?: string
  material_platforms: string[]
  visibility?: 'public' | 'hidden'
  status?: 'active' | 'archived'
  order_index: number
  category_ids: number[]
  categories?: EquipmentCategory[]
  related_sku_ids?: number[]
  related_skus?: Array<{
    id: number
    sku_code: string
    public_name?: string
    name: string
    series_slug: string
    series_name: string
  }>
}

export interface CareGuide {
  id: number
  title: string
  content: string
}

export interface FAQ {
  id: number
  question: string
  answer: string
  category: string
}

export interface DigitalFabricFormat {
  id: number
  platform: string
  format: string
  description: string
  role: 'primary' | 'exchange'
  order_index: number
}

export interface ContactConfig {
  email: string
  phone: string
  address: string
  response_text: string
}

export interface AdminContactConfig extends ContactConfig {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass?: string
  smtp_secure: boolean
  smtp_password_configured: boolean
}

export interface ContactMessage {
  id: number
  name: string
  company: string
  email: string
  phone: string
  subject: string
  message: string
  source_page: string
  product_model: string
  created_at: string
  position?: string
  cooperation_type?: string
}

export interface ContentSection {
  id: number
  page_key: string
  order_index: number
  section_key?: string
  module_type?: string
  nav_label?: string
  eyebrow?: string
  title: string
  subtitle: string
  content: string
  image_url: string | null
  image_fit: 'cover' | 'contain' | 'original'
  status?: 'draft' | 'published'
  hero_statement?: string
  hero_scroll_label?: string
  hero_visual?: string
  hero_link?: string
  content_blocks?: TechnologyContentBlock[]
  certification_logos?: CertificationLogo[]
}

export interface CertificationLogo {
  name: string
  image_url: string
}

export interface TechnologyMedia {
  visual?: string
  image_url?: string
  caption?: string
}

export interface TechnologyContentItem extends TechnologyMedia {
  title: string
  content: string
  link_label?: string
  link_url?: string
  highlights?: string[]
}

export interface TechnologyContentBlock extends TechnologyMedia {
  key: string
  title: string
  content: string
  highlights?: string[]
  items?: TechnologyContentItem[]
  layout?: string
  tone?: string
  hidden?: boolean
  note?: string
  links?: { label: string; href: string }[]
}

export type FluorineSection = ContentSection

export interface InquirySubject {
  id: number
  label: string
  order_index: number
}
