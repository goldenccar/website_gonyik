import { Suspense, lazy } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

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
const EndUseEquipment = lazy(() => import('./pages/EndUseEquipment'))
const FluorineFreeFuture = lazy(() => import('./pages/FluorineFreeFuture'))
const ServicesSupport = lazy(() => import('./pages/ServicesSupport'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))

// Admin pages
const AdminLogin = lazy(() => import('./admin/Login'))
const AdminDashboard = lazy(() => import('./admin/Dashboard'))
const AdminHomeEditor = lazy(() => import('./admin/HomeEditor'))
const AdminFabricManager = lazy(() => import('./admin/FabricManager'))
const AdminEquipmentManager = lazy(() => import('./admin/EquipmentManager'))
const AdminReportManager = lazy(() => import('./admin/ReportManager'))
const AdminServiceManager = lazy(() => import('./admin/ServiceManager'))
const AdminNewsManager = lazy(() => import('./admin/NewsManager'))
const AdminMediaLibrary = lazy(() => import('./admin/MediaLibrary'))
const AdminBrandSettings = lazy(() => import('./admin/BrandSettings'))
const AdminFooterManager = lazy(() => import('./admin/FooterManager'))

function App() {
  return (
    <div className="min-h-[100dvh] bg-bg">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/home" element={<AdminHomeEditor />} />
          <Route path="/admin/fabrics" element={<AdminFabricManager />} />
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
