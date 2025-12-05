import { Outlet, NavLink } from 'react-router-dom'
import {
    Network,
    Database,
    Zap,
    Users as UsersIcon,
    FileText,
    Key,
    Settings,
    Building2
} from 'lucide-react'
import { clsx } from 'clsx'

const adminNavItems = [
    { name: 'Data model', href: '/admin/data-model', icon: Network },
    { name: 'Data sources', href: '/admin/data-sources', icon: Database },
    { name: 'Automations', href: '/admin/automations', icon: Zap },
    { name: 'Tenants', href: '/admin/tenants', icon: Building2 },
    { name: 'Users and teams', href: '/admin/users-teams', icon: UsersIcon },
    { name: 'Audit log', href: '/admin/audit-log', icon: FileText },
    { name: 'Credentials', href: '/admin/credentials', icon: Key },
    { name: 'Organization settings', href: '/admin/organization', icon: Settings },
]

export function AdminLayout() {
    return (
        <div className="h-full flex">
            {/* Admin Sidebar */}
            <aside className="w-48 bg-white border-r flex flex-col">
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {adminNavItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                                    isActive
                                        ? 'bg-gray-100 text-gray-900 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Admin Content */}
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    )
}
