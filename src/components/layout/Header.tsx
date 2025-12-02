import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, Search, UserPlus, Settings, Home, Database, Rocket } from 'lucide-react'
import { clsx } from 'clsx'
import { UserMenu } from './UserMenu'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Catalog', href: '/catalog', icon: Database },
  { name: 'Self-service', href: '/self-service', icon: Rocket },
]

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, currentOrganization } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left side: Logo and Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
            {currentOrganization?.logoUrl ? (
              <img
                src={currentOrganization.logoUrl}
                alt={currentOrganization.name}
                className="h-7 w-auto max-w-[100px] object-contain"
              />
            ) : (
              <div className="h-7 w-7 rounded bg-gray-900 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2L12 6L8 10L4 6L8 2Z" fill="white" />
                </svg>
              </div>
            )}
            <span className="text-sm font-semibold text-gray-900">
              {currentOrganization?.name || 'Port'}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-20 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right side: Actions and User */}
        <div className="flex items-center gap-3">
          {/* Builder Button */}
          <button
            onClick={() => navigate('/admin/data-model')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Builder</span>
          </button>

          {/* Add User Icon */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <UserPlus className="h-5 w-5" />
          </button>

          {/* Last Run Tasks - Activity Icon with Badge */}
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <Activity className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
              9
            </span>
          </button>

          {/* Megaphone/Announcement Icon */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l18-5v12L3 13v-2z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
          </button>

          {/* Document/File Icon */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </button>

          {/* User Menu (replaces static profile photo) */}
          {isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  )
}
