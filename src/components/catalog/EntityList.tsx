import { CatalogFilters, Entity } from '@/types/catalog'
import { EntityCard } from './EntityCard'

interface EntityListProps {
  filters: CatalogFilters
}

// Mock data for demonstration
const mockEntities: Entity[] = [
  {
    id: '1',
    name: 'user-service',
    type: 'service',
    description: 'Core user authentication and management service',
    owner: 'Platform Team',
    team: 'platform',
    status: 'healthy',
    tags: ['production', 'critical', 'auth'],
    relations: {
      dependsOn: ['postgres-db', 'redis-cache'],
      usedBy: ['api-gateway', 'web-app'],
    },
    metadata: {
      language: 'Node.js',
      framework: 'Express',
      repository: 'github.com/org/user-service',
      deployment: 'kubernetes',
      lastDeployed: '2024-11-28T10:30:00Z',
    },
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-11-28T10:30:00Z',
  },
  {
    id: '2',
    name: 'payment-api',
    type: 'api',
    description: 'RESTful API for payment processing',
    owner: 'Payments Team',
    team: 'payments',
    status: 'healthy',
    tags: ['production', 'payment', 'pci-compliant'],
    relations: {
      dependsOn: ['payment-gateway', 'audit-log'],
      usedBy: ['checkout-service', 'mobile-app'],
    },
    metadata: {
      language: 'Python',
      framework: 'FastAPI',
      repository: 'github.com/org/payment-api',
      deployment: 'kubernetes',
      lastDeployed: '2024-11-27T15:20:00Z',
    },
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-11-27T15:20:00Z',
  },
  {
    id: '3',
    name: 'analytics-dashboard',
    type: 'website',
    description: 'Internal analytics and reporting dashboard',
    owner: 'Data Team',
    team: 'data',
    status: 'degraded',
    tags: ['internal', 'analytics'],
    relations: {
      dependsOn: ['analytics-api', 'data-warehouse'],
      usedBy: [],
    },
    metadata: {
      language: 'TypeScript',
      framework: 'React',
      repository: 'github.com/org/analytics-dashboard',
      deployment: 'vercel',
      lastDeployed: '2024-11-26T14:00:00Z',
    },
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-11-26T14:00:00Z',
  },
]

export function EntityList({ filters }: EntityListProps) {
  // Filter entities based on filters
  const filteredEntities = mockEntities.filter((entity) => {
    if (filters.types.length > 0 && !filters.types.includes(entity.type)) {
      return false
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(entity.status)) {
      return false
    }
    if (filters.search && !entity.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredEntities.length} of {mockEntities.length} entities
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredEntities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No entities found matching your filters</p>
        </div>
      )}
    </div>
  )
}
