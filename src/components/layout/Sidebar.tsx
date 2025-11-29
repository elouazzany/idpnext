import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  Rocket,
  Globe,
  Zap,
  Settings,
  Shield,
  BarChart3
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Catalog', href: '/catalog', icon: Database },
  { name: 'Self-Service', href: '/self-service', icon: Rocket },
  { name: 'Environments', href: '/environments', icon: Globe },
  { name: 'Actions', href: '/actions', icon: Zap },
  { name: 'Observability', href: '/observability', icon: BarChart3 },
  { name: 'Governance', href: '/governance', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
