import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getContentSections, getPageConfig } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageShell } from '@/components/PageLayout'
import { getServiceModuleDefinition, isServiceModuleType } from '@/config/serviceModules'
import type { ContentSection, PageConfig } from '@/types'

export interface ServicesOutletContext {
  sections: ContentSection[]
}

export default function ServicesLayout() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<ContentSection[]>([])
  const [loaded, setLoaded] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getPageConfig('services'), getContentSections('services')]).then(([pageResponse, sectionResponse]) => {
      setPage(pageResponse.data.data)
      setSections((sectionResponse.data.data || []).filter((section: ContentSection) => isServiceModuleType(section.module_type)))
      setLoaded(true)
    })
  }, [])

  const navigation = useMemo(() => sections.map((section) => ({
    section,
    definition: getServiceModuleDefinition(section.module_type)!,
  })), [sections])

  useEffect(() => {
    if (!loaded || navigation.length === 0) return
    const route = location.pathname.split('/').filter(Boolean)[1]
    if (!route || !navigation.some((item) => item.definition.route === route)) {
      navigate(`/services/${navigation[0].definition.route}`, { replace: true })
    }
  }, [loaded, location.pathname, navigate, navigation])

  return (
    <PageShell>
      <PageHero title={page?.page_title || '服务与支持'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="功能材料护理与数字面料服务" />
      <div className="bg-bg px-4 md:px-6">
        <nav aria-label="服务与支持" className="gonyik-rail mx-auto flex w-full max-w-[1760px] overflow-x-auto border-b border-border bg-white px-3 md:px-8">
          {navigation.map(({ section, definition }) => (
            <NavLink key={section.id} to={`/services/${definition.route}`} className={({ isActive }) => `relative shrink-0 px-4 py-5 text-[14px] font-medium transition-colors md:px-6 ${isActive ? 'text-primary after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-[#69B2C1] md:after:inset-x-6' : 'text-secondary hover:text-primary'}`}>
              {section.nav_label || definition.label}
            </NavLink>
          ))}
          <span className="mx-2 my-4 w-px shrink-0 bg-border md:mx-4" />
          <NavLink to="/contact" className="flex shrink-0 items-center gap-2 px-4 py-5 text-[14px] font-medium text-secondary transition-colors hover:text-primary md:px-6">
            联系我们 <ArrowUpRight size={14} />
          </NavLink>
        </nav>
      </div>
      {loaded && navigation.length > 0 && <Outlet context={{ sections } satisfies ServicesOutletContext} />}
    </PageShell>
  )
}
