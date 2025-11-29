import { CatalogFilters, EntityType, EntityStatus } from '@/types/catalog'
import { X } from 'lucide-react'

interface CatalogSidebarProps {
  filters: CatalogFilters
  onChange: (filters: CatalogFilters) => void
}

const entityTypes: { value: EntityType; label: string; color: string }[] = [
  { value: 'service', label: 'Service', color: 'bg-blue-100 text-blue-700' },
  { value: 'api', label: 'API', color: 'bg-purple-100 text-purple-700' },
  { value: 'library', label: 'Library', color: 'bg-green-100 text-green-700' },
  { value: 'website', label: 'Website', color: 'bg-orange-100 text-orange-700' },
  { value: 'database', label: 'Database', color: 'bg-red-100 text-red-700' },
]

const statuses: { value: EntityStatus; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: 'text-green-600' },
  { value: 'degraded', label: 'Degraded', color: 'text-yellow-600' },
  { value: 'down', label: 'Down', color: 'text-red-600' },
  { value: 'unknown', label: 'Unknown', color: 'text-gray-600' },
]

const teams = ['Platform Team', 'Payments Team', 'Data Team', 'Security Team']
const allTags = ['production', 'critical', 'auth', 'payment', 'analytics', 'internal', 'pci-compliant']

export function CatalogSidebar({ filters, onChange }: CatalogSidebarProps) {
  const toggleType = (type: EntityType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    onChange({ ...filters, types: newTypes })
  }

  const toggleStatus = (status: EntityStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    onChange({ ...filters, statuses: newStatuses })
  }

  const toggleTeam = (team: string) => {
    const newTeams = filters.teams.includes(team)
      ? filters.teams.filter((t) => t !== team)
      : [...filters.teams, team]
    onChange({ ...filters, teams: newTeams })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onChange({ ...filters, tags: newTags })
  }

  const clearAllFilters = () => {
    onChange({
      search: filters.search,
      types: [],
      teams: [],
      statuses: [],
      tags: [],
    })
  }

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.teams.length > 0 ||
    filters.tags.length > 0

  return (
    <aside className="w-60 bg-white border-r overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Entity Type */}
        <div>
          <h4 className="text-[11px] font-medium text-gray-700 mb-2">Entity Type</h4>
          <div className="space-y-1.5">
            {entityTypes.map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.types.includes(type.value)}
                  onChange={() => toggleType(type.value)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-3 h-3"
                />
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${type.color}`}>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="pt-4 border-t">
          <h4 className="text-[11px] font-medium text-gray-700 mb-2">Status</h4>
          <div className="space-y-1.5">
            {statuses.map((status) => (
              <label
                key={status.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(status.value)}
                  onChange={() => toggleStatus(status.value)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-3 h-3"
                />
                <span className={`text-xs ${status.color} font-medium`}>
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="pt-4 border-t">
          <h4 className="text-[11px] font-medium text-gray-700 mb-2">Team</h4>
          <div className="space-y-1.5">
            {teams.map((team) => (
              <label
                key={team}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.teams.includes(team)}
                  onChange={() => toggleTeam(team)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-3 h-3"
                />
                <span className="text-xs text-gray-700">{team}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="pt-4 border-t">
          <h4 className="text-[11px] font-medium text-gray-700 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const isSelected = filters.tags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                    isSelected
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                  {isSelected && <X className="h-2.5 w-2.5" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
