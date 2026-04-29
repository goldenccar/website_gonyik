import { Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import FabricDatabase from './pages/FabricDatabase'
import EndUseEquipment from './pages/EndUseEquipment'
import FluorineFreeFuture from './pages/FluorineFreeFuture'
import ServicesSupport from './pages/ServicesSupport'
import AdminLogin from './admin/Login'
import AdminDashboard from './admin/Dashboard'
import AdminHomeEditor from './admin/HomeEditor'
import AdminFabricManager from './admin/FabricManager'
import AdminEquipmentManager from './admin/EquipmentManager'
import AdminReportManager from './admin/ReportManager'
import AdminServiceManager from './admin/ServiceManager'
import AdminNewsManager from './admin/NewsManager'
import AdminMediaLibrary from './admin/MediaLibrary'

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

function App() {
  return (
    <div className="min-h-screen bg-bg">
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

        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fabrics" element={<FabricDatabase />} />
          <Route path="/equipment" element={<EndUseEquipment />} />
          <Route path="/fluorine-free" element={<FluorineFreeFuture />} />
          <Route path="/services" element={<ServicesSupport />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
