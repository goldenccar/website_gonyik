import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { getSiteConfig } from './api/client'

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1 pt-[60px] flex flex-col">
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
const Home = lazy(() => import('./pages/Home'))
const FabricDatabase = lazy(() => import('./pages/FabricDatabase'))
const SeriesPage = lazy(() => import('./pages/SeriesPage'))
const DeveloperSupport = lazy(() => import('./pages/DeveloperSupport'))
const EndUseEquipment = lazy(() => import('./pages/EndUseEquipment'))
const FluorineFreeFuture = lazy(() => import('./pages/FluorineFreeFuture'))
const ServicesSupport = lazy(() => import('./pages/ServicesSupport'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const SampleRequest = lazy(() => import('./pages/SampleRequest'))

// Admin pages
const AdminLogin = lazy(() => import('./admin/Login'))
const AdminDashboard = lazy(() => import('./admin/Dashboard'))
const AdminHomeEditor = lazy(() => import('./admin/HomeEditor'))
const AdminFabricManager = lazy(() => import('./admin/FabricManager'))
const AdminSceneManager = lazy(() => import('./admin/SceneManager'))
const AdminDigitalAssetManager = lazy(() => import('./admin/DigitalAssetManager'))
const AdminEquipmentManager = lazy(() => import('./admin/EquipmentManager'))
const AdminReportManager = lazy(() => import('./admin/ReportManager'))
const AdminServiceManager = lazy(() => import('./admin/ServiceManager'))
const AdminNewsManager = lazy(() => import('./admin/NewsManager'))
const AdminMediaLibrary = lazy(() => import('./admin/MediaLibrary'))
const AdminBrandSettings = lazy(() => import('./admin/BrandSettings'))
const AdminFooterManager = lazy(() => import('./admin/FooterManager'))

function App() {
  useEffect(() => {
    getSiteConfig().then((res) => {
      const favicon = res.data.data?.favicon_url
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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/home" element={<AdminHomeEditor />} />
          <Route path="/admin/fabrics" element={<AdminFabricManager />} />
          <Route path="/admin/scenes" element={<AdminSceneManager />} />
          <Route path="/admin/digital-assets" element={<AdminDigitalAssetManager />} />
          <Route path="/admin/equipment" element={<AdminEquipmentManager />} />
          <Route path="/admin/reports" element={<AdminReportManager />} />
          <Route path="/admin/services" element={<AdminServiceManager />} />
          <Route path="/admin/news" element={<AdminNewsManager />} />
          <Route path="/admin/media" element={<AdminMediaLibrary />} />
          <Route path="/admin/brand" element={<AdminBrandSettings />} />
          <Route path="/admin/footer" element={<AdminFooterManager />} />

          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/fabrics" element={<FabricDatabase />} />
            <Route path="/equipment" element={<EndUseEquipment />} />
            <Route path="/fluorine-free" element={<FluorineFreeFuture />} />
            <Route path="/services" element={<ServicesSupport />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
