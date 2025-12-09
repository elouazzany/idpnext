import { CatalogFilters, Entity, ColumnDefinition } from '@/types/catalog'
import { Entity as ServiceEntity } from '@/types/entity'
import { formatDistanceToNow } from 'date-fns'
import { mockEntities } from '@/data/mockEntities'
import { useColumnConfigContext } from '@/contexts/ColumnConfigContext'
import { BadgeCell } from './cells/BadgeCell'
import { EmailCell } from './cells/EmailCell'
import { LinkCell } from './cells/LinkCell'
import { StatusCell } from './cells/StatusCell'
import { EntityActionsMenu } from './EntityActionsMenu'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { IconDisplay } from '@/components/IconDisplay'

interface EntityTableViewProps {
  filters: CatalogFilters
  onColumnConfig?: () => void
  entities?: Entity[]  // Optional: if provided, use these instead of mockEntities
  onDuplicateEntity?: (entity: Entity | ServiceEntity) => void
  onEditEntity?: (entity: Entity | ServiceEntity) => void
  onDeleteEntity?: (entity: Entity | ServiceEntity) => void
}

// Helper to get nested property value
function getNestedValue(obj: any, path: string): any {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj)
  // If value is not found and object has properties, try to get from properties
  if (value === undefined && obj.properties && path in obj.properties) {
    return obj.properties[path]
  }
  return value
}

export function EntityTableView({ filters, onColumnConfig, entities, groupBy = [], onDuplicateEntity, onEditEntity, onDeleteEntity }: EntityTableViewProps & { groupBy?: string[] }) {
  const { visibleColumns } = useColumnConfigContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Use provided entities or fallback to mockEntities
  const sourceEntities = entities || mockEntities

  // Grouping helper - creates a nested map structure
  // groupBy: ['team', 'status']
  // output: Map('Team A' -> Map('Active' -> [entities], 'Inactive' -> [entities]))
  // Flattened for easy rendering: List of items where item is { type: 'header', key, level, count } or { type: 'entity', entity }

  // Process entities (filter)
  const filteredEntities = sourceEntities.filter((entity) => {
    // ... same filtering logic ...
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

  // Pagination logic on filtered set (simplification: paginate then group visible)
  const totalItems = filteredEntities.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex)

  // Recursive grouping function
  // Returns [ [key, value], ... ] where value is Entity[] or recursively nested structure
  const groupEntities = (items: Entity[], groupKeys: string[], currentLevel: number = 0): any[] => {
    if (currentLevel >= groupKeys.length) return items;

    const key = groupKeys[currentLevel];
    const grouped = items.reduce((acc, entity) => {
      const value = getNestedValue(entity, key)
      const displayValue = String(value || 'Unassigned')
      if (!acc[displayValue]) acc[displayValue] = []
      acc[displayValue].push(entity)
      return acc
    }, {} as Record<string, Entity[]>)

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([groupValue, groupItems]) => ({
        key: groupValue,
        level: currentLevel,
        items: groupEntities(groupItems, groupKeys, currentLevel + 1),
        count: groupItems.length,
        // Unique ID for expansion state: level0Key>level1Key...
        id: groupValue // NOTE: This is simplistic, ideally pass parent ID path for uniqueness
      }))
  }

  // We need full path IDs for robust expansion toggle
  const generateGroupedData = (items: Entity[], keys: string[], parentPath: string = ''): any[] => {
    if (keys.length === 0) return items;

    const currentKey = keys[0];
    const remainingKeys = keys.slice(1);

    const grouped = items.reduce((acc, entity) => {
      const val = getNestedValue(entity, currentKey)
      const displayVal = String(val || 'Unassigned')
      if (!acc[displayVal]) acc[displayVal] = []
      acc[displayVal].push(entity)
      return acc
    }, {} as Record<string, Entity[]>)

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([groupValue, groupItems]) => {
        const uniqueId = parentPath ? `${parentPath}>${groupValue}` : groupValue;
        return {
          type: 'group',
          value: groupValue,
          uniqueId,
          level: keys.length, // inversed? or just use depth from original call
          count: groupItems.length, // total items in sub-tree
          children: generateGroupedData(groupItems, remainingKeys, uniqueId)
        }
      })
  }

  // Actually, paginatedEntities is what we want to display.
  // But if we group paginated items, the groups might be fragmented.
  // Let's stick to grouping the paginated slice.

  const groupedData = (groupBy && groupBy.length > 0)
    ? generateGroupedData(paginatedEntities, groupBy)
    : paginatedEntities; // if not grouped, just list of Entities

  // Initialize expansion - expand all by default?
  // Let's expand all by default for now or at least top level.
  // We can do this in useEffect whenever data changes.
  useEffect(() => {
    if (groupBy && groupBy.length > 0) {
      // Collect all group IDs to expand them by default
      const collectIds = (nodes: any[]): string[] => {
        return nodes.reduce((acc, node) => {
          if (node.type === 'group') {
            return [...acc, node.uniqueId, ...collectIds(node.children)]
          }
          return acc
        }, [] as string[])
      }
      setExpandedGroups(new Set(collectIds(groupedData as any[])))
    }
  }, [groupBy, startIndex, itemsPerPage]) // Dependencies when displayed set changes

  const toggleGroup = (id: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedGroups(newExpanded)
  }

  // Render function for recursive structure
  const renderGroupedRows = (nodes: any[], depth: number = 0): React.ReactNode => {
    return nodes.map((node: any) => {
      if (node.type === 'group') {
        const isExpanded = expandedGroups.has(node.uniqueId)
        return (
          <React.Fragment key={node.uniqueId}>
            <tr className="bg-gray-50/50 hover:bg-gray-100/50 border-b border-gray-100">
              <td colSpan={visibleColumns.length + 2} className="px-4 py-2 text-left">
                <button
                  onClick={() => toggleGroup(node.uniqueId)}
                  className="flex items-center gap-2 w-full text-left"
                  style={{ paddingLeft: `${depth * 20}px` }}
                >
                  <div className="p-0.5 hover:bg-gray-200 rounded">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                  </div>
                  <div className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    {node.value}
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-200 px-1.5 rounded-full min-w-[20px] text-center">
                    {node.count}
                  </span>
                </button>
              </td>
            </tr>
            {isExpanded && renderGroupedRows(node.children, depth + 1)}
          </React.Fragment>
        )
      } else {
        // It's an entity
        return renderRow(node)
      }
    })
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.types, filters.statuses, filters.teams, filters.tags, groupBy]) // Reset on groupBy change too

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Render cell based on column type
  const renderCell = (entity: Entity, column: ColumnDefinition) => {
    const value = getNestedValue(entity, column.accessor)

    switch (column.type) {
      case 'badge':
        if (column.id === 'lifecycle') {
          return <BadgeCell value={value} variant="lifecycle" />
        } else if (column.id === 'tier') {
          return <BadgeCell value={value} variant="tier" />
        } else if (column.id === 'type') {
          return <BadgeCell value={value} variant="type" />
        }
        return <BadgeCell value={value} />

      case 'email':
        return <EmailCell email={value} />

      case 'link':
        if (column.id === 'url') {
          return <LinkCell url={value} type="url" />
        }
        return <LinkCell url={value} />

      case 'status':
        if (column.id === 'monitoring') {
          return <StatusCell monitoring={value} type="monitoring" />
        } else if (column.id === 'status') {
          return <StatusCell status={value} type="health" />
        }
        return <span className="text-xs text-gray-700">{value || '-'}</span>

      case 'tags':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 3).map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
                  {tag}
                </span>
              ))}
              {value.length > 3 && (
                <span className="px-1.5 py-0.5 text-[10px] text-gray-500">+{value.length - 3}</span>
              )}
            </div>
          )
        }
        return <span className="text-xs text-gray-400">-</span>

      case 'text':
      default:
        if (column.id === 'lastDeployed' && value) {
          return (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(value), { addSuffix: true })}
            </span>
          )
        }
        return <span className="text-xs text-gray-700">{value || '-'}</span>
    }
  }

  // Render logic components
  const TableHeader = () => (
    <thead className="bg-gray-50 border-b">
      <tr>
        {/* Icon column */}
        <th className="px-4 py-2 w-10"></th>

        {/* Dynamic columns */}
        {visibleColumns.map((column) => (
          <th
            key={column.id}
            className="px-4 py-2 text-left"
            style={{ width: column.width }}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                {column.label}
              </span>
            </div>
          </th>
        ))}

        {/* Actions column */}
        <th className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider w-20">
          Actions
        </th>
      </tr>
    </thead>
  )

  const renderRow = (entity: Entity) => (
    <tr
      key={entity.id}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Icon column */}
      <td className="px-4 py-2.5">
        <div className="h-6 w-6 rounded flex items-center justify-center overflow-hidden">
          {entity.icon ? (
            <IconDisplay name={entity.icon} className="h-6 w-6 text-primary-700" />
          ) : (
            <div className="h-full w-full bg-primary-100 flex items-center justify-center rounded">
              <span className="text-xs font-medium text-primary-700">
                {entity.type === 'service' ? 'S' : entity.type === 'api' ? 'A' : (entity.type?.[0]?.toUpperCase() || entity.title?.[0]?.toUpperCase() || entity.identifier?.[0]?.toUpperCase() || '?')}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Dynamic columns */}
      {visibleColumns.map((column) => {
        const entityName = entity.name || entity.title || entity.identifier
        const entityDescription = entity.description || entity.properties?.description || ''
        const entityTags = entity.tags || entity.properties?.tags || []

        // Check if this is the title/name column
        const isTitleColumn = column.id === 'name' || column.id === 'title'

        return (
          <td key={column.id} className="px-4 py-2.5">
            {isTitleColumn ? (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-900">{entityName}</span>
                  {Array.isArray(entityTags) && entityTags.includes('critical') && (
                    <span className="px-1 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                      Critical
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                  {entityDescription}
                </p>
              </div>
            ) : (
              renderCell(entity, column)
            )}
          </td>
        )
      })}

      {/* Actions column */}
      <td className="px-4 py-2.5">
        <EntityActionsMenu
          entityId={entity.id}
          entityName={entity.name || entity.title || entity.identifier || 'Unknown'}
          onDuplicate={() => onDuplicateEntity?.(entity)}
          onEdit={() => onEditEntity?.(entity)}
          onDelete={() => onDeleteEntity?.(entity)}
        />
      </td>
    </tr>
  )

  return (
    <div className="bg-white rounded-lg border">
      {/* Table */}
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <TableHeader />

          <tbody className="divide-y divide-gray-200">
            {groupBy && groupBy.length > 0 ? (
              renderGroupedRows(groupedData as any[])
            ) : (
              paginatedEntities.map(entity => renderRow(entity))
            )}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredEntities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No entities found matching your filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-600">
              <span className="font-medium text-gray-900">{totalItems}</span> results
              {totalItems > 0 && (
                <span className="ml-2 text-gray-500">
                  (showing {startIndex + 1}-{Math.min(endIndex, totalItems)})
                </span>
              )}
            </p>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[28px] px-2 py-1 text-xs rounded border transition-colors ${currentPage === pageNum
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                            }`}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-600">Page 1 of 1</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
