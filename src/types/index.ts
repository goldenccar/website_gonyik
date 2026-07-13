export interface HomePlatformCard {
  title: string
  subtitle: string
  description?: string
}

export interface HomeVerification {
  title: string
  subtitle: string
}

export interface HomeConfig {
  id: number
  hero_tag: string
  hero_title: string
  hero_slogan: string
  hero_background: string | null
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
  verification_section_title: string
  verification_section_subtitle: string
  verification_section_link_text: string
  verification_section_link: string
  verifications: HomeVerification[]
}

export interface PageConfig {
  id: number
  page_key: string
  page_tag: string
  page_title: string
  page_subtitle: string
  hero_background: string | null
  rail_end_card_visible?: boolean
  rail_end_card_title?: string
  rail_end_card_description?: string
  rail_end_card_cta_label?: string
  rail_end_card_cta_href?: string
}

export interface NavItem {
  id: number
  label: string
  link: string
  order_index: number
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
  sub_series_data: string | null // JSON: [{slug, name, subtitle, description, accent_color, link}]
  cover_image: string | null
  home_image: string | null
  home_badge_image: string | null
  order_index: number
}

export interface FabricSku {
  id: number
  series_id: number
  name: string
  sku_code: string
  image: string | null
  features: string // JSON
  specifications: string // JSON
  card_summary?: string
  visibility?: 'public' | 'hidden'
  status?: 'active' | 'archived'
  order_index: number
}

export interface EquipmentCategory {
  id: number
  name: string
  slug: string
  description: string
  bg_image: string | null
  image_fit: 'cover' | 'contain' | 'original'
}

export interface EquipmentProduct {
  id: number
  category_id: number
  name: string
  image: string | null
  features: string // JSON
  card_summary?: string
  visibility?: 'public' | 'hidden'
  status?: 'active' | 'archived'
  order_index: number
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

export interface FluorineSection {
  id: number
  page_key: string
  order_index: number
  title: string
  subtitle: string
  content: string
  image_url: string | null
  image_fit: 'cover' | 'contain' | 'original'
}

export interface InquirySubject {
  id: number
  label: string
  order_index: number
}
