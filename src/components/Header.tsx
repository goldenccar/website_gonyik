import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Globe, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNavigation } from '@/api/client'
import type { NavItem } from '@/types'

export default function Header() {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    getNavigation().then((res) => setNavItems(res.data.data || []))
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-darker border-b border-white/[0.08] px-6 lg:px-12"
      >
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="mr-2">
              <rect width="28" height="28" fill="white" />
              <text x="14" y="19" textAnchor="middle" fill="#0D0D0D" fontSize="11" fontWeight="800" fontFamily="Inter, sans-serif">GY</text>
            </svg>
            <span className="text-white text-[15px] font-bold tracking-tight">港翼科技</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.link
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`text-[13px] font-medium transition-colors duration-250 ${
                    isActive ? 'text-white' : 'text-accent hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="block h-[1px] bg-white/60 mt-[2px]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-5">
            <button className="text-accent hover:text-white transition-colors">
              <Globe size={20} />
            </button>
            <button className="text-accent hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <button
              className="md:hidden text-accent hover:text-white transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-darker"
          >
            <div className="flex justify-end p-6">
              <button onClick={() => setMobileOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col items-center gap-6 pt-12">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="text-white text-[22px] font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
