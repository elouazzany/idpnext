export type EntityType = 'service' | 'library' | 'website' | 'database' | 'api'

export type EntityStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export interface Entity {
  id: string
  name: string
  type: EntityType
  description: string
  owner: string
  team: string
  status: EntityStatus
  tags: string[]
  relations: {
    dependsOn: string[]
    usedBy: string[]
  }
  metadata: {
    language?: string
    framework?: string
    repository?: string
    deployment?: string
    lastDeployed?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CatalogFilters {
  search: string
  types: EntityType[]
  teams: string[]
  statuses: EntityStatus[]
  tags: string[]
}
