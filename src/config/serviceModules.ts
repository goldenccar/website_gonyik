const SERVICE_MODULE_DEFINITIONS = [
  { type: 'material-care', route: 'material-care' },
  { type: 'garment-care', route: 'garment-care' },
  { type: 'digital-fabrics', route: 'digital-fabrics' },
] as const

export type ServiceModuleType = (typeof SERVICE_MODULE_DEFINITIONS)[number]['type']
export const getServiceModuleDefinition = (type?: string) => SERVICE_MODULE_DEFINITIONS.find(item => item.type === type)
export const isServiceModuleType = (type?: string): type is ServiceModuleType => Boolean(getServiceModuleDefinition(type))
