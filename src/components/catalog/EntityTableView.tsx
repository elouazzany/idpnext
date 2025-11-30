import { CatalogFilters, Entity, ColumnDefinition } from '@/types/catalog'
import { formatDistanceToNow } from 'date-fns'
import { mockEntities } from '@/data/mockEntities'
import { useColumnConfigContext } from '@/contexts/ColumnConfigContext'
import { BadgeCell } from './cells/BadgeCell'
import { EmailCell } from './cells/EmailCell'
import { LinkCell } from './cells/LinkCell'
import { StatusCell } from './cells/StatusCell'
import { EntityActionsMenu } from './EntityActionsMenu'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EntityTableViewProps {
  filters: CatalogFilters
  onColumnConfig?: () => void
}

// Helper to get nested property value
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

export function EntityTableView({ filters, onColumnConfig }: EntityTableViewProps) {
  const { visibleColumns } = useColumnConfigContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  // Pagination calculations
  const totalItems = filteredEntities.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.types, filters.statuses, filters.teams, filters.tags])

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

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
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

          <tbody className="divide-y divide-gray-200">
            {paginatedEntities.map((entity) => (
              <tr
                key={entity.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Icon column */}
                <td className="px-4 py-2.5">
                  <div className="h-6 w-6 rounded bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">
                      {entity.type === 'service' ? 'S' : entity.type === 'api' ? 'A' : entity.type[0].toUpperCase()}
                    </span>
                  </div>
                </td>

                {/* Dynamic columns */}
                {visibleColumns.map((column) => (
                  <td key={column.id} className="px-4 py-2.5">
                    {column.id === 'name' ? (
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
                    ) : (
                      renderCell(entity, column)
                    )}
                  </td>
                ))}

                {/* Actions column */}
                <td className="px-4 py-2.5">
                  <EntityActionsMenu entityId={entity.id} entityName={entity.name} />
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
                          className={`min-w-[28px] px-2 py-1 text-xs rounded border transition-colors ${
                            currentPage === pageNum
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
