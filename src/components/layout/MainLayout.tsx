import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const hideSidebar = location.pathname === '/self-service' || location.pathname.startsWith('/admin')
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-3.5rem)]">
        {!hideSidebar && <Sidebar />}
        <main className={`flex-1 overflow-y-auto ${isAdminRoute ? '' : 'p-6'}`}>
          <div className={isAdminRoute ? 'h-full' : 'mx-auto max-w-7xl'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
