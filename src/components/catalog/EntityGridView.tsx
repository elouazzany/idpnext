import { CatalogFilters } from '@/types/catalog'
import { EntityCard } from './EntityCard'
import { mockEntities } from '@/data/mockEntities'

interface EntityGridViewProps {
  filters: CatalogFilters
}

export function EntityGridView({ filters }: EntityGridViewProps) {
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
    <div className="space-y-4">
      {/* Results Count */}
      <div className="bg-white rounded-lg border px-6 py-3">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredEntities.length}</span> of{' '}
          <span className="font-medium text-gray-900">{mockEntities.length}</span> entities
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>

      {/* Empty State */}
      {filteredEntities.length === 0 && (
        <div className="bg-white rounded-lg border text-center py-12">
          <p className="text-gray-500">No entities found matching your filters</p>
          <button className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
