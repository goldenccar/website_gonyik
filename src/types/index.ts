export interface HomePlatformCard {
  title: string
  subtitle: string
  description?: string
  evidence?: string
}

export interface HomeVerification {
  title: string
  subtitle: string
}

export interface HomeVerificationImage {
  id: string
  url: string
  order_index: number
}

export interface HomeConfig {
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
  verifications: HomeVerification[]
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
}

export interface NavMenuGroup {
  id: string
  title: string
  link?: string
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
  id: number
  email: string
  phone: string
  address: string
  response_text: string
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass: string
  smtp_secure: boolean
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
  content_blocks?: TechnologyContentBlock[]
  certification_logos?: CertificationLogo[]
}

export interface CertificationLogo {
  name: string
  image_url: string
}

export interface TechnologyContentItem {
  title: string
  content: string
}

export interface TechnologyContentBlock {
  key: string
  title: string
  content: string
  highlights?: string[]
  items?: TechnologyContentItem[]
}

export type FluorineSection = ContentSection

export interface InquirySubject {
  id: number
  label: string
  order_index: number
}
