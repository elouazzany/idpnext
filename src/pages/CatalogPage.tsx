import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, LayoutGrid, List, Plus, Download, Copy, Undo, Layers } from 'lucide-react'
import { EntityTableView } from '@/components/catalog/EntityTableView'
import { EntityGridView } from '@/components/catalog/EntityGridView'
import { CatalogFilters } from '@/types/catalog'
import { FilterModal } from '@/components/catalog/FilterModal'
import { ColumnManagerModal } from '@/components/catalog/ColumnManagerModal'
import { ColumnConfigProvider } from '@/contexts/ColumnConfigContext'

type ViewMode = 'table' | 'grid'

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const pageName = searchParams.get('name') || 'Service Catalog'

  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    types: [],
    teams: [],
    statuses: [],
    tags: [],
  })

  return (
    <ColumnConfigProvider>
      <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        {/* Title and Search Row */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-semibold text-gray-900">{pageName}</h1>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search columns"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs"
              />
            </div>

            {/* Action buttons */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Group"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowColumnConfig(true)}
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Sort"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Undo"
            >
              <Undo className="h-3.5 w-3.5" />
            </button>

            {/* Add Service button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700">
              <Plus className="h-3.5 w-3.5" />
              Service
            </button>

            {/* Add Property button */}
            <button
              onClick={() => setShowColumnConfig(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Property
            </button>
          </div>
        </div>

        {/* Description Row */}
        <div className="px-1">
          <p className="text-xs text-gray-500">
            This is a software catalog. Drill down into a service to see context and dependencies, resources, CI/CD and more, as well as scorecards associated with it.
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {viewMode === 'table' ? (
            <EntityTableView filters={filters} />
          ) : (
            <EntityGridView filters={filters} />
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(conditions) => {
          // Convert filter conditions to catalog filters
          const newFilters: CatalogFilters = {
            search: filters.search,
            types: [],
            teams: [],
            statuses: [],
            tags: [],
          }

          conditions.forEach((condition) => {
            const value = condition.value

            // Skip empty values
            if (!value || (Array.isArray(value) && value.length === 0)) {
              return
            }

            switch (condition.field) {
              case 'type':
                if (typeof value === 'string' && value) {
                  newFilters.types = [value as any]
                }
                break
              case 'status':
                if (typeof value === 'string' && value) {
                  newFilters.statuses = [value as any]
                }
                break
              case 'team':
                if (typeof value === 'string' && value) {
                  newFilters.teams = [value]
                }
                break
              case 'tags':
                if (Array.isArray(value)) {
                  newFilters.tags = value
                }
                break
              case 'name':
                if (typeof value === 'string' && value) {
                  newFilters.search = value
                }
                break
            }
          })

          setFilters(newFilters)
        }}
      />

      {/* Column Manager Modal */}
      <ColumnManagerModal
        isOpen={showColumnConfig}
        onClose={() => setShowColumnConfig(false)}
      />
    </div>
    </ColumnConfigProvider>
  )
}
