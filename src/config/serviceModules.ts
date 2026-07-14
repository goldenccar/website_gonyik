export const SERVICE_MODULE_DEFINITIONS = [
  {
    type: 'care',
    sectionKey: 'care',
    label: '洗涤保养',
    eyebrow: 'CARE',
    title: '洗涤与保养',
    subtitle: '正确清洗与保养，有助于维持材料的防护和舒适表现。',
    collection: { endpoint: 'care-guides', itemLabel: '保养步骤', titleLabel: '步骤标题' },
  },
  {
    type: 'faq',
    sectionKey: 'faq',
    label: '常见问题',
    eyebrow: 'Q&A',
    title: '常见问题',
    subtitle: '',
    collection: { endpoint: 'faqs', itemLabel: '问题', titleLabel: '问题' },
  },
  {
    type: 'contact',
    sectionKey: 'contact',
    label: '联系我们',
    eyebrow: 'CONTACT',
    title: '材料建议、样品与合作咨询',
    subtitle: '告诉我们使用环境、目标性能和项目阶段，我们会根据已有材料或开发需求提供对应支持。',
    collection: null,
  },
] as const

export type ServiceModuleType = (typeof SERVICE_MODULE_DEFINITIONS)[number]['type']

export const getServiceModuleDefinition = (type?: string) => SERVICE_MODULE_DEFINITIONS.find((item) => item.type === type)

export const isServiceModuleType = (type?: string): type is ServiceModuleType => Boolean(getServiceModuleDefinition(type))
