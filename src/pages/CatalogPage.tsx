import { useState } from 'react'
import { Search, SlidersHorizontal, LayoutGrid, List, Plus, Download } from 'lucide-react'
import { EntityTableView } from '@/components/catalog/EntityTableView'
import { EntityGridView } from '@/components/catalog/EntityGridView'
import { CatalogFilters } from '@/types/catalog'
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar'
import { FilterModal } from '@/components/catalog/FilterModal'

type ViewMode = 'table' | 'grid'

export function CatalogPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showFilters, setShowFilters] = useState(true)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    types: [],
    teams: [],
    statuses: [],
    tags: [],
  })

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Service Catalog</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage and explore all your software components
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700">
              <Plus className="h-3.5 w-3.5" />
              New Entity
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entities by name, description, or tags..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 ${
                viewMode === 'table'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 border-l ${
                viewMode === 'grid'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        {showFilters && (
          <CatalogSidebar filters={filters} onChange={setFilters} />
        )}

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
          console.log('Applied filter conditions:', conditions)
          // You can process conditions here to update the filters state
          // For now, we'll just log them
        }}
      />
    </div>
  )
}
