import { useRef } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { CatalogProvider } from '../../contexts/CatalogContext'

export function MainLayout() {
  const location = useLocation()
  const hideSidebar = location.pathname === '/self-service' || location.pathname.startsWith('/admin')
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Create a ref to store the refresh function from Sidebar
  const refreshCatalogRef = useRef<(() => void) | null>(null)

  const handleRefreshCatalog = () => {
    if (refreshCatalogRef.current) {
      refreshCatalogRef.current()
    }
  }

  return (
    <CatalogProvider refreshCatalog={handleRefreshCatalog}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-[calc(100vh-3.5rem)]">
          {!hideSidebar && <Sidebar refreshCatalogRef={refreshCatalogRef} />}
          <main className={`flex-1 overflow-y-auto ${isAdminRoute ? '' : 'p-6'}`}>
            <div className={isAdminRoute ? 'h-full' : 'mx-auto max-w-7xl'}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </CatalogProvider>
  )
}
