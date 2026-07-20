import axios, { type AxiosResponse } from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const inFlightGets = new Map<string, Promise<AxiosResponse>>()

function cachedGet<T = any>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
  const key = `${url}:${JSON.stringify(params || {})}`
  const pending = inFlightGets.get(key)
  if (pending) return pending as Promise<AxiosResponse<T>>

  const request = api.get<T>(url, { params })
    .finally(() => inFlightGets.delete(key))

  inFlightGets.set(key, request)
  return request
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
export const getHomeConfig = () => cachedGet('/home')
export const getSiteConfig = () => cachedGet('/site-config')
export const getPageConfig = (key: string) => cachedGet(`/page/${key}`)
export const updatePageConfig = (key: string, data: any) => api.put(`/admin/page/${key}`, data)
export const getNavigation = () => cachedGet('/navigation')
export const getFooter = () => cachedGet('/footer')
export const getSocial = () => cachedGet('/social')

export const getFabricSeries = () => api.get('/fabrics/series', { params: { schema: 'dual-code-v1' } })
export const getFabricSeriesDetail = (slug: string) => api.get(`/fabrics/series/${slug}`, { params: { schema: 'dual-code-v1' } })
export const getEquipmentCategories = () => cachedGet('/equipment/categories')
export const getCategoryProducts = (slug: string) => cachedGet(`/equipment/categories/${slug}/products`)
export const getCareGuides = () => cachedGet('/services/care-guides')
export const getFaqs = () => cachedGet('/services/faqs')

export const getContactConfig = () => cachedGet('/contact-config')

export const getContentSections = (pageKey: string) => cachedGet(`/content-sections/${pageKey}`)

export const getInquirySubjects = () => cachedGet('/inquiry-subjects')
export const updateInquirySubjects = (data: { items: any[] }) => api.put('/admin/inquiry-subjects', data)

export const submitContactForm = (data: { name: string; company?: string; position?: string; email: string; phone?: string; subject: string; cooperation_type?: string; message: string }) => api.post('/contact', data)

export const uploadFile = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
