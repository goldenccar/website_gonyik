import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export const getHomeConfig = () => api.get('/home')
export const getSiteConfig = () => api.get('/site-config')
export const getPageConfig = (key: string) => api.get(`/page/${key}`)
export const getNavigation = () => api.get('/navigation')
export const getFooter = () => api.get('/footer')
export const getSocial = () => api.get('/social')

export const getFabricSeries = () => api.get('/fabrics/series')
export const getFabricSeriesDetail = (slug: string) => api.get(`/fabrics/series/${slug}`)
export const getFabricSku = (id: number) => api.get(`/fabrics/sku/${id}`)
export const getFabricScenes = () => api.get('/fabrics/scenes')
export const getDigitalAssets = (seriesSlug?: string) => api.get('/fabrics/digital-assets' + (seriesSlug ? `?series_slug=${seriesSlug}` : ''))

export const getEquipmentCategories = () => api.get('/equipment/categories')
export const getCategoryProducts = (slug: string) => api.get(`/equipment/categories/${slug}/products`)

export const getTestReports = () => api.get('/reports')
export const getTestReport = (id: number) => api.get(`/reports/${id}`)

export const getAboutUs = () => api.get('/services/about')
export const getNews = () => api.get('/services/news')
export const getNewsDetail = (id: number) => api.get(`/services/news/${id}`)
export const getCareGuides = () => api.get('/services/care-guides')
export const getFaqs = () => api.get('/services/faqs')

export const getContactConfig = () => api.get('/contact-config')
export const updateContactConfig = (data: any) => api.put('/admin/contact-config', data)

export const getFluorineSections = () => api.get('/fluorine-sections')
export const updateFluorineSection = (id: number, data: any) => api.put(`/admin/fluorine-sections/${id}`, data)

export const getInquirySubjects = () => api.get('/inquiry-subjects')
export const updateInquirySubjects = (data: { items: any[] }) => api.put('/admin/inquiry-subjects', data)

export const submitContactForm = (data: { name: string; company?: string; email: string; phone?: string; subject: string; message: string }) => api.post('/contact', data)

export const uploadFile = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
