import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getContentSections, getPageConfig } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageShell } from '@/components/PageLayout'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import { getServiceModuleDefinition, isServiceModuleType } from '@/config/serviceModules'
import type { ContentSection, PageConfig } from '@/types'
import { useSiteLocale } from '@/i18n/SiteLocale'

export interface ServicesOutletContext {
  sections: ContentSection[]
}

export default function ServicesLayout() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<ContentSection[]>([])
  const [loaded, setLoaded] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { path: localePath, t } = useSiteLocale()

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
    const route = location.pathname.split('/').filter(Boolean).at(-1)
    if (!route || !navigation.some((item) => item.definition.route === route)) {
      navigate(localePath(`/services/${navigation[0].definition.route}`), { replace: true })
    }
  }, [loaded, location.pathname, navigate, navigation])

  return (
    <PageShell>
      <PageHero title={page?.page_title || '专业支持'} subtitle={page?.page_subtitle} image={page?.hero_background} imageAlt="功能材料护理与数字面料服务" />
      {navigation.length > 0 && <CatalogSelectorBar
        label={t('专业支持')}
        groups={[{
          label: t('服务内容'),
          items: navigation.map(({ section, definition }) => ({
            key: section.id,
            label: t(section.nav_label || definition.label),
            active: location.pathname.endsWith(`/${definition.route}`),
            onSelect: () => navigate(localePath(`/services/${definition.route}`)),
          })),
        }]}
      />}
      {loaded && navigation.length > 0 && <Outlet context={{ sections } satisfies ServicesOutletContext} />}
    </PageShell>
  )
}
