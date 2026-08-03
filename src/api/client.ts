import axios, { type AxiosResponse } from 'axios'
import { marketCodeFromPath, type SiteLocale, type SiteMarket, type MarketVisibility } from '@/config/markets'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const inFlightGets = new Map<string, Promise<AxiosResponse>>()

function cachedGet<T = any>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
  const market = typeof window === 'undefined' ? 'cn' : marketCodeFromPath(window.location.pathname)
  const requestParams = { market, ...params }
  const key = `${url}:${JSON.stringify(requestParams)}`
  const pending = inFlightGets.get(key)
  if (pending) return pending as Promise<AxiosResponse<T>>

  const request = api.get<T>(url, { params: requestParams })
    .finally(() => inFlightGets.delete(key))

  inFlightGets.set(key, request)
  return request
}

async function withLegacy404Fallback<T>(
  request: () => Promise<AxiosResponse<T>>,
  fallback: () => Promise<AxiosResponse<T>>,
) {
  try {
    return await request()
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error
    return fallback()
  }
}

function localDataResponse<T>(data: T): AxiosResponse<{ data: T }> {
  return {
    data: { data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin'
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const getPublicBootstrap = () => cachedGet('/bootstrap')
export const getAdminLocalizations = (locale: Exclude<SiteLocale, 'zh-CN'>) => api.get('/admin/localizations', { params: { locale } })
export const updateLocalizations = (locale: Exclude<SiteLocale, 'zh-CN'>, translations: Record<string, string>) => api.put(`/admin/localizations/${locale}`, { translations })
export const getAdminMarkets = () => api.get('/admin/markets')
export const updateAdminMarkets = (data: {
  markets: SiteMarket[]
  page_visibility: Record<string, Record<string, MarketVisibility>>
  section_visibility: Record<string, Record<string, MarketVisibility>>
}) => api.put('/admin/markets', data)
export const getHomeConfig = () => cachedGet('/home')
export const getSiteConfig = () => cachedGet('/site-config')
export const getPageConfig = (key: string) => cachedGet(`/page/${key}`)
export const updatePageConfig = (key: string, data: any) => api.put(`/admin/page/${key}`, data)
export const getNavigation = () => cachedGet('/navigation')
export const getAdminCmsConfig = () => api.get('/admin/cms-config')
export const updateAdminCmsConfig = (data: { module_order: string[] }) => api.put('/admin/cms-config', data)
export const getFooter = () => cachedGet('/footer')
export const getSocial = () => cachedGet('/social')

export const getFabricSeries = () => cachedGet('/fabrics/series', { schema: 'dual-code-v1' })
export const getFabricSeriesDetail = (slug: string) => cachedGet(`/fabrics/series/${slug}`, { schema: 'dual-code-v1' })
export const getFabricCatalog = () => withLegacy404Fallback(
  () => cachedGet('/fabrics/catalog', { schema: 'dual-code-v1' }),
  async () => {
    const [pageResponse, seriesResponse] = await Promise.all([getPageConfig('fabrics'), getFabricSeries()])
    const series = seriesResponse.data.data || []
    const detailResponses = await Promise.all(series.map((item: any) => getFabricSeriesDetail(item.slug)))
    const details = detailResponses.map((response) => response.data.data)
    const capabilities = details.find((detail: any) => Array.isArray(detail?.capabilities))?.capabilities || []
    return localDataResponse({ page: pageResponse.data.data, series: details, capabilities })
  },
)
export const getEquipmentCatalog = () => withLegacy404Fallback(
  () => cachedGet('/equipment/catalog'),
  async () => {
    const [pageResponse, categoryResponse, productResponse] = await Promise.all([
      getPageConfig('equipment'),
      cachedGet('/equipment/categories'),
      cachedGet('/equipment/products'),
    ])
    return localDataResponse({
      page: pageResponse.data.data,
      categories: categoryResponse.data.data || [],
      products: productResponse.data.data?.products || [],
    })
  },
)
export const getMaterialCareGuides = () => cachedGet('/services/material-care-guides')
export const getCareGuides = () => cachedGet('/services/care-guides')
export const getFaqs = (category: 'material-care' | 'garment-care') => cachedGet('/services/faqs', { category })
export const getDigitalFabricFormats = () => cachedGet('/services/digital-fabric-formats')
export const getServicesBootstrap = () => withLegacy404Fallback(
  () => cachedGet('/services/bootstrap'),
  async () => {
    const [pageResponse, sectionResponse] = await Promise.all([
      getPageConfig('services'),
      getContentSections('services'),
    ])
    return localDataResponse({ page: pageResponse.data.data, sections: sectionResponse.data.data || [] })
  },
)

export const getContactConfig = () => cachedGet('/contact-config')

export const getContentSections = (pageKey: string) => cachedGet(`/content-sections/${pageKey}`)

export const getInquirySubjects = () => cachedGet('/inquiry-subjects')
export const updateInquirySubjects = (data: { items: any[] }) => api.put('/admin/inquiry-subjects', data)

export const submitContactForm = (data: { name: string; company?: string; position?: string; email: string; phone?: string; subject: string; cooperation_type?: string; message: string; source_page?: string; product_model?: string }) => api.post('/contact', data)

export const uploadFile = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
