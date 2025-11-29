import { CatalogFilters, EntityType, EntityStatus } from '@/types/catalog'

interface EntityFiltersProps {
  filters: CatalogFilters
  onChange: (filters: CatalogFilters) => void
}

const entityTypes: { value: EntityType; label: string }[] = [
  { value: 'service', label: 'Services' },
  { value: 'library', label: 'Libraries' },
  { value: 'website', label: 'Websites' },
  { value: 'database', label: 'Databases' },
  { value: 'api', label: 'APIs' },
]

const statuses: { value: EntityStatus; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'down', label: 'Down' },
  { value: 'unknown', label: 'Unknown' },
]

export function EntityFilters({ filters, onChange }: EntityFiltersProps) {
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

  return (
    <div className="bg-white rounded-lg border p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Entity Type</h3>
        <div className="space-y-2">
          {entityTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.types.includes(type.value)}
                onChange={() => toggleType(type.value)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
        <div className="space-y-2">
          {statuses.map((status) => (
            <label key={status.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.statuses.includes(status.value)}
                onChange={() => toggleStatus(status.value)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{status.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
