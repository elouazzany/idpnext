import { CatalogFilters, Entity } from '@/types/catalog'
import { ExternalLink, ArrowUpDown, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { clsx } from 'clsx'
import { mockEntities } from '@/data/mockEntities'

interface EntityTableViewProps {
  filters: CatalogFilters
}

const statusDots = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
  unknown: 'bg-gray-400',
}

const typeColors = {
  service: 'bg-blue-100 text-blue-700',
  api: 'bg-purple-100 text-purple-700',
  library: 'bg-green-100 text-green-700',
  website: 'bg-orange-100 text-orange-700',
  database: 'bg-red-100 text-red-700',
}

export function EntityTableView({ filters }: EntityTableViewProps) {
  // Filter entities
  const filteredEntities = mockEntities.filter((entity) => {
    if (filters.types.length > 0 && !filters.types.includes(entity.type)) {
      return false
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(entity.status)) {
      return false
    }
    if (filters.teams.length > 0 && !filters.teams.includes(entity.owner)) {
      return false
    }
    if (filters.tags.length > 0 && !filters.tags.some((tag) => entity.tags.includes(tag))) {
      return false
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        entity.name.toLowerCase().includes(searchLower) ||
        entity.description.toLowerCase().includes(searchLower) ||
        entity.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Results Count */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <p className="text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredEntities.length}</span> of{' '}
          <span className="font-medium text-gray-900">{mockEntities.length}</span> entities
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-0.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  Name
                  <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-0.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  Type
                  <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-0.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  Status
                  <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-0.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  Last Deployed
                  <ArrowUpDown className="h-2.5 w-2.5" />
                </button>
              </th>
              <th className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEntities.map((entity) => (
              <tr
                key={entity.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-900">{entity.name}</span>
                      {entity.tags.includes('critical') && (
                        <span className="px-1 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                      {entity.description}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={clsx('px-1.5 py-0.5 text-[10px] font-medium rounded', typeColors[entity.type])}>
                    {entity.type}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={clsx('h-1.5 w-1.5 rounded-full', statusDots[entity.status])} />
                    <span className="text-xs text-gray-700 capitalize">{entity.status}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-gray-700">{entity.owner}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-gray-700">{entity.metadata.language || '-'}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-gray-500">
                    {entity.metadata.lastDeployed
                      ? formatDistanceToNow(new Date(entity.metadata.lastDeployed), {
                          addSuffix: true,
                        })
                      : '-'}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {entity.metadata.repository && (
                      <a
                        href={`https://${entity.metadata.repository}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredEntities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No entities found matching your filters</p>
          <button className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
