export const SERVICE_MODULE_DEFINITIONS = [
  {
    type: 'material-care',
    sectionKey: 'material-care',
    label: '材料护理',
    title: '面料护理与性能判断',
    subtitle: '了解清洁、表面拒水与材料防水之间的关系，才能在性能变化时采取正确的处理方式。',
    content: '以下为功能面料的一般护理原则。具体产品仍应以面料型号、成衣洗标和整件测试结果为准。',
    route: 'material-care',
    collection: { endpoint: 'material-care-guides', itemLabel: '材料建议', titleLabel: '建议标题' },
    faqCategory: 'material-care',
  },
  {
    type: 'garment-care',
    sectionKey: 'garment-care',
    label: '成衣洗涤',
    title: '功能外套清洁与保养',
    subtitle: '正确清洗有助于去除污垢、汗液与洗涤剂残留，并维持面料的拒水、透湿和穿着舒适性。',
    content: '开始前请先查看成衣洗标。不同面料、里布、压胶和辅料可能对应不同的水温、程序与干燥条件。',
    route: 'garment-care',
    collection: { endpoint: 'care-guides', itemLabel: '洗涤步骤', titleLabel: '步骤标题' },
    faqCategory: 'garment-care',
  },
  {
    type: 'digital-fabrics',
    sectionKey: 'digital-fabrics',
    label: '数字面料',
    title: '数字面料资产',
    subtitle: '面向 CLO3D 与 Style3D 工作流，逐步建立可用于数字打样的材料文件。',
    content: '数字资产将按具体面料型号和版本交付，并同步记录视觉参数、物理属性与适用软件版本。',
    route: 'digital-fabrics',
    collection: { endpoint: 'digital-fabric-formats', itemLabel: '文件格式', titleLabel: '平台与格式' },
  },
] as const

export type ServiceModuleType = (typeof SERVICE_MODULE_DEFINITIONS)[number]['type']

export const getServiceModuleDefinition = (type?: string) => SERVICE_MODULE_DEFINITIONS.find((item) => item.type === type)

export const isServiceModuleType = (type?: string): type is ServiceModuleType => Boolean(getServiceModuleDefinition(type))
