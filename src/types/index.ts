export interface HomeFeature {
  icon: string
  title: string
  subtitle: string
}

export interface HomePlatformCard {
  icon: string
  title: string
  subtitle: string
  description: string
  footer: string
}

export interface HomeScenario {
  icon: string
  label: string
  link: string
}

export interface HomeVerification {
  icon: string
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
  hero_features: HomeFeature[]
  platform_section_title: string
  platform_section_subtitle: string
  platform_section_link_text: string
  platform_section_link: string
  platform_cards: HomePlatformCard[]
  series_section_title: string
  series_section_subtitle: string
  series_section_link_text: string
  series_section_link: string
  scenarios_section_title: string
  scenarios: HomeScenario[]
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
}

export interface NavItem {
  id: number
  label: string
  link: string
  order_index: number
}

export interface FooterConfig {
  id: number
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
  order_index: number
}

export interface FabricScene {
  id: number
  category: string
  label: string
  series_slug: string
  order_index: number
}

export interface DigitalAsset {
  id: number
  series_slug: string
  file_name: string
  file_url: string
  file_type: string
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
}

export interface TestReport {
  id: number
  title: string
  file_url: string
  file_type: string
  category: string
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
}

export interface AboutUs {
  id: number
  positioning_title: string
  positioning_content: string
  slogan_text: string
}

export interface Philosophy {
  id: number
  number: number
  title: string
  description: string
}

export interface Milestone {
  id: number
  year: string
  event: string
}

export interface NewsItem {
  id: number
  title: string
  cover_image: string | null
  content: string
  images: string | null
  status: string
  published_at: string
}

export interface CareGuide {
  id: number
  icon: string
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

export interface EquipmentScene {
  id: number
  category: string
  label: string
  equipment_slug: string
  order_index: number
}
