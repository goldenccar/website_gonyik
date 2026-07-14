export type FabricCapabilityTheme = 'neutral' | 'blue' | 'cyan' | 'green' | 'amber' | 'red'

export interface FabricCapabilityDefinition {
  id?: number
  key: string
  label: string
  theme: FabricCapabilityTheme
  aliases?: string[]
  order_index?: number
}

export const FABRIC_CAPABILITY_THEMES: { value: FabricCapabilityTheme; label: string }[] = [
  { value: 'neutral', label: '中性灰' },
  { value: 'blue', label: '材料蓝' },
  { value: 'cyan', label: '科技青' },
  { value: 'green', label: '可持续绿' },
  { value: 'amber', label: '功能琥珀' },
  { value: 'red', label: '防护红' },
]

export const FABRIC_CAPABILITY_THEME_CLASSES: Record<FabricCapabilityTheme, string> = {
  neutral: 'border-[#b7c4ce] bg-transparent text-[#566f82]',
  blue: 'border-[#86abc4] bg-[#eaf3f8] text-[#2b6383]',
  cyan: 'border-[#80b8c0] bg-[#e8f5f6] text-[#28717a]',
  green: 'border-[#8cac99] bg-[#ebf3ee] text-[#416f57]',
  amber: 'border-[#c4a46f] bg-[#f7f1e6] text-[#785b2c]',
  red: 'border-[#c68f8f] bg-[#f7eaea] text-[#884646]',
}

export const DEFAULT_FABRIC_CAPABILITIES: FabricCapabilityDefinition[] = [
  { key: 'waterproof', label: '防水性', theme: 'blue', aliases: ['防水', '防水透气'] },
  { key: 'moisture-permeable', label: '透湿性', theme: 'cyan', aliases: ['透湿', '防水透气'] },
  { key: 'windproof', label: '防风性', theme: 'blue', aliases: ['防风'] },
  { key: 'weather-resistant', label: '耐候性', theme: 'neutral', aliases: ['耐候'] },
  { key: 'air-permeable', label: '透气性', theme: 'cyan', aliases: ['透气'] },
  { key: 'uv-protective', label: '防晒性', theme: 'amber', aliases: ['防晒', '防紫外线', 'UPF'] },
  { key: 'moisture-wicking', label: '吸湿排汗', theme: 'cyan', aliases: ['吸湿', '排汗', '导湿'] },
  { key: 'quick-dry', label: '速干性', theme: 'cyan', aliases: ['速干'] },
  { key: 'thermal', label: '保暖性', theme: 'amber', aliases: ['保暖', '保温'] },
  { key: 'abrasion-resistant', label: '耐磨性', theme: 'neutral', aliases: ['耐磨'] },
  { key: 'stretch', label: '弹力', theme: 'green', aliases: ['高弹', '四面弹'] },
  { key: 'tear-resistant', label: '抗撕裂', theme: 'neutral', aliases: ['抗撕裂', '防撕裂'] },
  { key: 'flame-resistant', label: '阻燃性', theme: 'red', aliases: ['阻燃'] },
  { key: 'antistatic', label: '防静电', theme: 'blue', aliases: ['抗静电'] },
  { key: 'cooling', label: '凉感', theme: 'cyan', aliases: ['凉感', '冷感'] },
  { key: 'stain-resistant', label: '防污性', theme: 'green', aliases: ['防污', '易去污'] },
]
