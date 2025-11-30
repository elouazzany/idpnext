export type EntityType = 'service' | 'library' | 'website' | 'database' | 'api'

export type EntityStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export type EntityLifecycle = 'Production' | 'Experimental' | 'Deprecated' | 'Sunset'

export type EntityTier = 'Customer Facing' | 'Mission Critical' | 'Internal' | 'Foundation'

export interface Entity {
  id: string
  name: string
  type: EntityType
  description: string
  owner: string
  team: string
  status: EntityStatus
  tags: string[]
  // New fields for Port.io-style catalog
  tier?: EntityTier
  lifecycle?: EntityLifecycle
  onCall?: string  // Email address
  url?: string     // Service URL
  monitoring?: boolean
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

export type ColumnType = 'text' | 'badge' | 'link' | 'email' | 'status' | 'icon' | 'tags'

export interface ColumnDefinition {
  id: string
  label: string
  type: ColumnType
  accessor: keyof Entity | string  // Key to access data in Entity
  defaultVisible: boolean
  sortable: boolean
  resizable: boolean
  minWidth?: number
  width?: number
}

export interface ColumnConfig {
  id: string
  visible: boolean
  order: number
  width?: number
}
