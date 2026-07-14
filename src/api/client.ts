import axios, { type AxiosResponse } from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const responseCache = new Map<string, { response: AxiosResponse; expiry: number }>()
const inFlightGets = new Map<string, Promise<AxiosResponse>>()
const CACHE_TTL = 60_000 // 60 seconds
let cacheGeneration = 0

function cachedGet<T = any>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
  const key = `${url}:${JSON.stringify(params || {})}`
  const cached = responseCache.get(key)

  if (cached && cached.expiry > Date.now()) {
    return Promise.resolve(cached.response as AxiosResponse<T>)
  }

  const pending = inFlightGets.get(key)
  if (pending) return pending as Promise<AxiosResponse<T>>

  const requestGeneration = cacheGeneration
  const request = api.get<T>(url, { params })
    .then((response) => {
      if (requestGeneration === cacheGeneration) {
        responseCache.set(key, { response, expiry: Date.now() + CACHE_TTL })
      }
      return response
    })
    .finally(() => inFlightGets.delete(key))

  inFlightGets.set(key, request)
  return request
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.method !== 'get') {
    cacheGeneration += 1
    responseCache.clear()
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

export const getHomeConfig = () => cachedGet('/home')
export const getSiteConfig = () => cachedGet('/site-config')
export const getPageConfig = (key: string) => cachedGet(`/page/${key}`)
export const updatePageConfig = (key: string, data: any) => api.put(`/admin/page/${key}`, data)
export const getNavigation = () => cachedGet('/navigation')
export const getFooter = () => cachedGet('/footer')
export const getSocial = () => cachedGet('/social')

export const getFabricSeries = () => cachedGet('/fabrics/series')
export const getFabricSeriesDetail = (slug: string) => cachedGet(`/fabrics/series/${slug}`)
export const getEquipmentCategories = () => cachedGet('/equipment/categories')
export const getCategoryProducts = (slug: string) => cachedGet(`/equipment/categories/${slug}/products`)
export const getCareGuides = () => cachedGet('/services/care-guides')
export const getFaqs = () => cachedGet('/services/faqs')

export const getContactConfig = () => cachedGet('/contact-config')

export const getFluorineSections = () => cachedGet('/fluorine-sections')

export const getInquirySubjects = () => cachedGet('/inquiry-subjects')
export const updateInquirySubjects = (data: { items: any[] }) => api.put('/admin/inquiry-subjects', data)

export const submitContactForm = (data: { name: string; company?: string; position?: string; email: string; phone?: string; subject: string; cooperation_type?: string; message: string }) => api.post('/contact', data)

export const uploadFile = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
