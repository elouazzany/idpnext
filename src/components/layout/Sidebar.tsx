import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Search,
  PlusSquare,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Box,
  Layers,
  Flag,
  Wifi,
  User,
  Users,
  Phone,
  Layout,
  LayoutTemplate,
  LayoutDashboard,
  FolderPlus,
  Sparkles,
  Network
} from 'lucide-react'
import { clsx } from 'clsx'

type NavItem = {
  name: string
  href?: string
  icon?: any
  children?: NavItem[]
  isHeader?: boolean
  iconColor?: string
  isOpen?: boolean
}

const initialNavigation: NavItem[] = [
  {
    name: 'Service Catalog',
    isHeader: true,
    href: '/catalog',
    icon: Box,
    iconColor: 'text-pink-500'
  },
  {
    name: 'Developer',
    isOpen: true,
    children: [
      { name: 'Plan My Day', href: '/catalog?name=Plan My Day', icon: Layout, iconColor: 'text-blue-500' },
      { name: 'My Services', href: '/catalog?name=My Services', icon: Box, iconColor: 'text-pink-500' },
      { name: 'Feature Development', href: '/catalog?name=Feature Development', icon: Layers, iconColor: 'text-yellow-500' },
      { name: 'Feature Flags', href: '/catalog?name=Feature Flags', icon: Flag, iconColor: 'text-gray-700' },
      {
        name: 'Initiatives',
        isOpen: false,
        children: [
          { name: 'Sonar is setup', href: '/catalog?name=Sonar is setup', icon: Wifi, iconColor: 'text-blue-500' },
          { name: 'Service belongs to team', href: '/catalog?name=Service belongs to team', icon: Users, iconColor: 'text-gray-500' },
          { name: 'Service is monitored', href: '/catalog?name=Service is monitored', icon: Flag, iconColor: 'text-green-500' },
        ]
      },
    ]
  },
  {
    name: 'Team Lead',
    isOpen: false,
    children: []
  },
  {
    name: 'On-Call',
    isOpen: false,
    children: [
      { name: 'PagerDuty', href: '/catalog?name=PagerDuty', icon: Phone, iconColor: 'text-green-600' }
    ]
  },
  { name: 'Users', href: '/users', icon: User, iconColor: 'text-gray-700' },
  { name: 'Teams', href: '/teams', icon: Users, iconColor: 'text-gray-700' },
  { name: 'Data Model', href: '/admin/data-model', icon: Network, iconColor: 'text-gray-700' }
]

export function Sidebar() {
  // State to track expanded items by their path string (e.g. "0-0")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '1': true // Developer section open by default (now at index 1)
  })
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false)

  const toggleItem = (pathKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [pathKey]: !prev[pathKey]
    }))
  }

  const renderItem = (item: NavItem, path: number[], level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isHeader = item.isHeader
    const pathKey = path.join('-')
    const isOpen = expandedItems[pathKey]

    if (isHeader) {
      return (
        <div key={item.name} className="mb-4">
          {item.href ? (
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2 px-2 py-1.5 mb-1 rounded-md cursor-pointer transition-colors",
                  isActive
                    ? 'bg-gray-200'
                    : 'bg-gray-100/50 hover:bg-gray-200'
                )
              }
            >
              {item.icon && <item.icon className={clsx("h-3.5 w-3.5", item.iconColor)} />}
              <span className="text-xs font-semibold text-gray-700">{item.name}</span>
            </NavLink>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1 bg-gray-100/50 rounded-md">
              {item.icon && <item.icon className={clsx("h-3.5 w-3.5", item.iconColor)} />}
              <span className="text-xs font-semibold text-gray-700">{item.name}</span>
            </div>
          )}
          <div className="space-y-0.5">
            {item.children?.map((child, index) => renderItem(child, [...path, index], level + 1))}
          </div>
        </div>
      )
    }

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleItem(pathKey)}
            className={clsx(
              "w-full flex items-center justify-between px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md group transition-colors",
              level > 1 && "ml-2"
            )}
            style={{ paddingLeft: `${level * 0.5 + 0.5}rem` }}
          >
            <div className="flex items-center gap-1.5">
              {isOpen ? (
                <ChevronDown className="h-3 w-3 text-gray-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-400" />
              )}
              {item.icon && <item.icon className={clsx("h-3.5 w-3.5", item.iconColor)} />}
              <span>{item.name}</span>
            </div>
            <MoreHorizontal className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />
          </button>
          {isOpen && (
            <div className="border-l border-gray-200 ml-3 mt-0.5 space-y-0.5">
              {item.children?.map((child, index) => renderItem(child, [...path, index], level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <NavLink
        key={item.name}
        to={item.href || '#'}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-2 py-1 rounded-md text-xs transition-colors',
            isActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'
          )
        }
        style={{ paddingLeft: `${level * 0.5 + 0.5}rem`, paddingRight: '0.5rem' }}
      >
        {item.icon && <item.icon className={clsx("h-3.5 w-3.5", item.iconColor)} />}
        <span className="truncate">{item.name}</span>
      </NavLink>
    )
  }

  return (
    <aside className="w-48 border-r bg-gray-50/50 flex flex-col h-full">
      {/* Search and New Button */}
      <div className="p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <ChevronDown className="h-2 w-2 text-gray-400" />
            <ChevronDown className="h-2 w-2 text-gray-400 rotate-180" />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="flex items-center gap-2 px-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <PlusSquare className="h-3.5 w-3.5 fill-gray-800 text-white" />
            New
          </button>

          {isNewMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsNewMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <LayoutTemplate className="h-3.5 w-3.5 text-gray-400" />
                  New catalog page
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <LayoutDashboard className="h-3.5 w-3.5 text-gray-400" />
                  New dashboard
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <FolderPlus className="h-3.5 w-3.5 text-gray-400" />
                  New folder
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                  New experience
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {initialNavigation.map((item, index) => renderItem(item, [index]))}
      </nav>
    </aside>
  )
}
