import { CatalogFilters } from '@/types/catalog'
import { EntityCard } from './EntityCard'
import { mockEntities } from '@/data/mockEntities'

interface EntityGridViewProps {
  filters: CatalogFilters
  entities?: any[]  // Optional: if provided, use these instead of mockEntities
}

export function EntityGridView({ filters, entities }: EntityGridViewProps) {
  // Use provided entities or fallback to mockEntities
  const sourceEntities = entities || mockEntities

  // Filter entities
  const filteredEntities = sourceEntities.filter((entity) => {
    // Handle both catalog entities and Port.io entities
    const entityType = entity.type || entity.properties?.type
    const entityStatus = entity.status || entity.properties?.status
    const entityOwner = entity.owner || entity.team || entity.properties?.owner
    const entityTags = entity.tags || entity.properties?.tags || []
    const entityName = entity.name || entity.title || entity.identifier
    const entityDescription = entity.description || entity.properties?.description || ''

    if (filters.types.length > 0 && entityType && !filters.types.includes(entityType)) {
      return false
    }
    if (filters.statuses.length > 0 && entityStatus && !filters.statuses.includes(entityStatus)) {
      return false
    }
    if (filters.teams.length > 0 && entityOwner && !filters.teams.includes(entityOwner)) {
      return false
    }
    if (filters.tags.length > 0 && entityTags.length > 0 && !filters.tags.some((tag) => entityTags.includes(tag))) {
      return false
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const nameMatch = entityName?.toLowerCase().includes(searchLower)
      const descMatch = entityDescription?.toLowerCase().includes(searchLower)
      const tagsMatch = Array.isArray(entityTags) && entityTags.some((tag) => tag.toLowerCase().includes(searchLower))
      return nameMatch || descMatch || tagsMatch
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Results Count */}
      <div className="bg-white rounded-lg border px-6 py-3">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredEntities.length}</span> of{' '}
          <span className="font-medium text-gray-900">{sourceEntities.length}</span> entities
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
