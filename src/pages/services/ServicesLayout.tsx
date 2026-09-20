import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getServicesBootstrap } from '@/api/client'
import PageHero from '@/components/PageHero'
import { PageShell } from '@/components/PageLayout'
import CatalogSelectorBar from '@/components/CatalogSelectorBar'
import { getServiceModuleDefinition, isServiceModuleType } from '@/config/serviceModules'
import type { ContentSection, PageConfig } from '@/types'
import { useSiteLocale } from '@/i18n/SiteLocale'
import PublicContentLoader from '@/components/PublicContentLoader'

export interface ServicesOutletContext {
  sections: ContentSection[]
}

export default function ServicesLayout() {
  const [page, setPage] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<ContentSection[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const location = useLocation()
  const navigate = useNavigate()
  const { path: localePath, t } = useSiteLocale()

  const load = useCallback(() => {
    setStatus('loading')
    getServicesBootstrap().then((response) => {
      const data = response.data.data || {}
      setPage(data.page || null)
      setSections((data.sections || []).filter((section: ContentSection) => isServiceModuleType(section.module_type)))
      setStatus('ready')
    }).catch(() => setStatus('error'))
  }, [])
  useEffect(load, [load])

  const navigation = useMemo(() => sections.map((section) => ({
    section,
    definition: getServiceModuleDefinition(section.module_type)!,
  })), [sections])

  useEffect(() => {
    if (status !== 'ready' || navigation.length === 0) return
    const route = location.pathname.split('/').filter(Boolean).at(-1)
    if (!route || !navigation.some((item) => item.definition.route === route)) {
      navigate(localePath(`/services/${navigation[0].definition.route}`), { replace: true })
    }
  }, [status, location.pathname, navigate, navigation])

  if (status === 'loading') return <PublicContentLoader label="正在加载专业支持内容" />
  if (status === 'error') return <PageShell><div role="alert" className="mx-auto w-full max-w-[1760px] px-7 py-24 md:px-12 lg:px-20"><div className="border-l-2 border-[#69B2C1] pl-5"><p className="text-[16px] text-primary">专业支持内容加载失败。</p><button type="button" onClick={load} className="mt-4 border-b border-primary text-[14px] text-primary">重新加载</button></div></div></PageShell>

  return (
    <PageShell className="services-page">
      <PageHero variant="editorial" title={page?.page_title || ''} subtitle={page?.page_subtitle} image={page?.hero_background} />
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
      {navigation.length > 0 && <Outlet context={{ sections } satisfies ServicesOutletContext} />}
    </PageShell>
  )
}
