import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PageScrollProgress from './components/PageScrollProgress'
import { getPublicBootstrap } from './api/client'
import Home from './pages/Home'

function PublicLayout() {
  const location = useLocation()
  const { pathname } = location

  useEffect(() => {
    const smoothScroll = Boolean((location.state as { smoothScroll?: boolean } | null)?.smoothScroll)
    window.scrollTo({ top: 0, left: 0, behavior: smoothScroll ? 'smooth' : 'auto' })
  }, [pathname])

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function PageLoader() {
  return (
    <div className="min-h-[100dvh] bg-darker flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
}

// Public pages
const FabricDatabase = lazy(() => import('./pages/FabricDatabase'))

const EndUseEquipment = lazy(() => import('./pages/EndUseEquipment'))
const FluorineFreeFuture = lazy(() => import('./pages/FluorineFreeFuture'))
const ServicesSupport = lazy(() => import('./pages/ServicesSupport'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))

const Contact = lazy(() => import('./pages/Contact'))

// Admin pages
const AdminLogin = lazy(() => import('./admin/Login'))
const AdminDashboard = lazy(() => import('./admin/Dashboard'))
const AdminHomeEditor = lazy(() => import('./admin/HomeEditor'))
const AdminFabricManager = lazy(() => import('./admin/FabricManager'))
const AdminEquipmentManager = lazy(() => import('./admin/EquipmentManager'))
const AdminServiceManager = lazy(() => import('./admin/ServiceManager'))
const AdminMediaLibrary = lazy(() => import('./admin/MediaLibrary'))
const AdminBrandSettings = lazy(() => import('./admin/BrandSettings'))
const AdminFooterManager = lazy(() => import('./admin/FooterManager'))
const AdminHeaderManager = lazy(() => import('./admin/HeaderManager'))
const AdminContactConfig = lazy(() => import('./admin/ContactConfig'))
const AdminInquirySubjectManager = lazy(() => import('./admin/InquirySubjectManager'))
const AdminContactMessageManager = lazy(() => import('./admin/ContactMessageManager'))
const AdminFluorineManager = lazy(() => import('./admin/FluorineManager'))
const AdminPageConfigManager = lazy(() => import('./admin/PageConfigManager'))

function App() {
  useEffect(() => {
    getPublicBootstrap().then((res) => {
      const favicon = res.data.site_config?.favicon_url
      if (favicon) {
        let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = favicon
      }
    })
  }, [])

  return (
    <div className="min-h-[100dvh] bg-bg">
      <PageScrollProgress />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin/home" replace />} />
          <Route path="/admin/home" element={<AdminHomeEditor />} />
          <Route path="/admin/fabrics" element={<AdminFabricManager />} />
          <Route path="/admin/equipment" element={<AdminEquipmentManager />} />
          <Route path="/admin/services" element={<AdminServiceManager />} />
          <Route path="/admin/media" element={<AdminMediaLibrary />} />
          <Route path="/admin/brand" element={<AdminBrandSettings />} />
          <Route path="/admin/footer" element={<AdminFooterManager />} />
          <Route path="/admin/header" element={<AdminHeaderManager />} />
          <Route path="/admin/contact-config" element={<AdminContactConfig />} />
          <Route path="/admin/inquiry-subjects" element={<AdminInquirySubjectManager />} />
          <Route path="/admin/contact-messages" element={<AdminContactMessageManager />} />
          <Route path="/admin/fluorine" element={<AdminFluorineManager />} />
          <Route path="/admin/fabrics/config" element={<AdminPageConfigManager pageKey="fabrics" />} />
          <Route path="/admin/equipment/config" element={<AdminPageConfigManager pageKey="equipment" />} />
          <Route path="/admin/fluorine/config" element={<AdminPageConfigManager pageKey="pfas-free-innovation" />} />
          <Route path="/admin/services/config" element={<AdminPageConfigManager pageKey="services" />} />
          <Route path="/admin/contact/config" element={<AdminPageConfigManager pageKey="contact" />} />

          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/fabrics" element={<FabricDatabase />} />

            <Route path="/equipment" element={<EndUseEquipment />} />
            <Route path="/pfas-free-innovation" element={<FluorineFreeFuture />} />
            <Route path="/fluorine-free" element={<Navigate to="/pfas-free-innovation" replace />} />
            <Route path="/services" element={<ServicesSupport />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
