import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, List, Plus, Download, Copy, Undo, Layers, Loader2, AlertCircle, Save, FileText, FileJson, X } from 'lucide-react'
import { EntityTableView } from '@/components/catalog/EntityTableView'
import catalogPageService from '../services/catalogPage.service'
import { entityService } from '../services/entity.service'
import { blueprintApi } from '../services/blueprint.service'
import { CatalogPage } from '../types/catalogPage'
import { Entity } from '../types/entity'
import { Blueprint } from '../types/blueprint'
import { CatalogFilters } from '../types/catalog'
import { FilterModal } from '../components/catalog/FilterModal'
import { ColumnManagerModal } from '../components/catalog/ColumnManagerModal'
import { ColumnConfigProvider, useColumnConfigContext } from '../contexts/ColumnConfigContext'
import { EntityCreationModal } from '../components/catalog/EntityCreationModal'
import { EntityEditModal } from '../components/catalog/EntityEditModal'
import { IconDisplay } from '../components/IconDisplay'
import { GroupByMenu } from '../components/catalog/GroupByMenu'
import { useAuth } from '../contexts/AuthContext'
import { useCatalog } from '../contexts/CatalogContext'

interface CatalogPageViewProps {
  blueprintIdentifier?: string;
  pageTitle?: string;
  pageIcon?: React.ReactNode;
  pageDescription?: string;
}

// Inner component to access column config context
function CatalogPageContent({
  page,
  blueprint,
  entities,
  total,
  filters,
  setFilters,
  onSave,
  onEntityCreated,
  initialFilters,
  initialColumns
}: {
  page: CatalogPage
  blueprint: Blueprint
  entities: Entity[]
  total: number
  filters: CatalogFilters
  setFilters: (filters: CatalogFilters) => void
  onSave: (columns: string[], filters: CatalogFilters) => Promise<void>
  onEntityCreated: () => void
  initialFilters: CatalogFilters
  initialColumns: string[]
}) {
  const { visibleColumns, columnConfig, toggleColumn, allColumns } = useColumnConfigContext()
  const { refreshCatalog } = useCatalog()
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [showEntityModal, setShowEntityModal] = useState(false)
  const [entityToDuplicate, setEntityToDuplicate] = useState<Entity | null>(null)
  const [entityToEdit, setEntityToEdit] = useState<Entity | null>(null)
  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const [showSaveAsNewModal, setShowSaveAsNewModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const saveMenuRef = useRef<HTMLDivElement>(null)
  const exportButtonRef = useRef<HTMLButtonElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // Check column changes
    const currentColumnIds = visibleColumns.map(col => col.id).sort().join(',')
    const savedColumnIds = initialColumns.sort().join(',')
    const columnsChanged = currentColumnIds !== savedColumnIds

    // Check filter changes
    const filtersChanged =
      filters.search !== initialFilters.search ||
      JSON.stringify(filters.types.sort()) !== JSON.stringify(initialFilters.types.sort()) ||
      JSON.stringify(filters.teams.sort()) !== JSON.stringify(initialFilters.teams.sort()) ||
      JSON.stringify(filters.statuses.sort()) !== JSON.stringify(initialFilters.statuses.sort()) ||
      JSON.stringify(filters.tags.sort()) !== JSON.stringify(initialFilters.tags.sort())

    return columnsChanged || filtersChanged
  }, [visibleColumns, initialColumns, filters, initialFilters])

  // Close save menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node) &&
        saveButtonRef.current && !saveButtonRef.current.contains(event.target as Node)) {
        setShowSaveMenu(false)
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node) &&
        exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUndo = () => {
    // Reset filters to initial state
    setFilters(initialFilters)

    // Reset columns to initial state
    // First, hide all columns that are currently visible but not in initial columns
    const currentVisibleIds = visibleColumns.map(col => col.id)
    const columnsToHide = currentVisibleIds.filter(id => !initialColumns.includes(id))
    columnsToHide.forEach(id => toggleColumn(id))

    // Then, show all columns that should be visible but are currently hidden
    const currentlyHidden = allColumns.filter(col => !currentVisibleIds.includes(col.id)).map(col => col.id)
    const columnsToShow = initialColumns.filter(id => currentlyHidden.includes(id))
    columnsToShow.forEach(id => toggleColumn(id))
  }

  const handleSave = async () => {
    setShowSaveMenu(false)
    setIsSaving(true)
    try {
      const columnIds = visibleColumns.map(col => col.id)
      await onSave(columnIds, filters)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportCSV = () => {
    setShowExportMenu(false)
    try {
      // Prepare CSV headers from visible columns
      const headers = visibleColumns.map(col => col.label).join(',')

      // Prepare CSV rows from entities
      const rows = entities.map(entity => {
        return visibleColumns.map(col => {
          // Access nested properties using the accessor
          const accessor = col.accessor
          let value: any

          if (accessor.includes('.')) {
            // Handle nested properties like 'metadata.language'
            const parts = accessor.split('.')
            value = parts.reduce((obj, key) => obj?.[key], entity as any)
          } else {
            value = (entity as any)[accessor]
          }

          // Handle different value types
          if (Array.isArray(value)) {
            return `"${value.join(', ')}"`
          } else if (value === null || value === undefined) {
            return ''
          } else if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`
          }

          return value
        }).join(',')
      }).join('\n')

      // Combine headers and rows
      const csv = `${headers}\n${rows}`

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `${page.title.replace(/\s+/g, '_')}_export.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log(`Exported ${entities.length} entities to CSV`)
    } catch (error) {
      console.error('Failed to export entities:', error)
    }
  }

  const handleExportJSON = () => {
    setShowExportMenu(false)
    try {
      // Prepare JSON data with only visible columns
      const exportData = entities.map(entity => {
        const row: Record<string, any> = {}

        visibleColumns.forEach(col => {
          const accessor = col.accessor
          let value: any

          if (accessor.includes('.')) {
            // Handle nested properties
            const parts = accessor.split('.')
            value = parts.reduce((obj, key) => obj?.[key], entity as any)
          } else {
            value = (entity as any)[accessor]
          }

          row[col.label] = value
        })

        return row
      })

      // Convert to JSON string with pretty printing
      const json = JSON.stringify(exportData, null, 2)

      // Create blob and download
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `${page.title.replace(/\s+/g, '_')}_export.json`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log(`Exported ${entities.length} entities to JSON`)
    } catch (error) {
      console.error('Failed to export entities:', error)
    }
  }

  const handleClone = () => {
    // Clone creates a copy with current unsaved changes
    setNewPageName(`${page.title} (Copy)`)
    setShowSaveAsNewModal(true)
  }

  const handleSaveAsNew = () => {
    setShowSaveMenu(false)
    setNewPageName(`${page.title} (Copy)`)
    setShowSaveAsNewModal(true)
  }

  const handleConfirmSaveAsNew = async () => {
    if (!newPageName.trim()) return

    setIsSaving(true)
    try {
      const columnIds = visibleColumns.map(col => col.id)

      // Convert current filters to the format expected by the API
      const filterData: Record<string, any> = {}
      if (filters.search) filterData.search = filters.search
      if (filters.types.length > 0) filterData.types = filters.types
      if (filters.teams.length > 0) filterData.teams = filters.teams
      if (filters.statuses.length > 0) filterData.statuses = filters.statuses
      if (filters.tags.length > 0) filterData.tags = filters.tags

      // Create new page with current configuration
      await catalogPageService.createPage({
        title: newPageName.trim(),
        description: page.description,
        icon: page.icon as string,
        blueprintId: blueprint.identifier,
        layout: 'table',
        filters: filterData,
        columns: columnIds,
        isPublic: false,
      })

      setShowSaveAsNewModal(false)
      setNewPageName('')
      console.log('New page created successfully')

      // Refresh the sidebar to show the new page
      refreshCatalog()
    } catch (err) {
      console.error('Failed to create new page:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicateEntity = (entity: Entity | any) => {
    setEntityToDuplicate(entity)
  }

  const handleEditEntity = (entity: Entity | any) => {
    setEntityToEdit(entity)
  }

  const handleDeleteEntity = (entity: Entity | any) => {
    setEntityToDelete(entity)
  }

  const confirmDeleteEntity = async () => {
    if (!entityToDelete || !blueprint) return

    setIsDeleting(true)
    try {
      await entityService.delete(blueprint.identifier, entityToDelete.identifier)
      setEntityToDelete(null)
      onEntityCreated() // Refresh the entity list
      console.log('Entity deleted successfully')
    } catch (err: any) {
      console.error('Failed to delete entity:', err)
      alert('Failed to delete entity: ' + (err.message || 'Unknown error'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        {/* Title and Search Row */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-shrink-0 flex items-center gap-2">
            {page.icon && <IconDisplay name={page.icon as string} className="w-6 h-6 text-gray-700" />}
            <h1 className="text-lg font-semibold text-gray-900">{page.title}</h1>
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

            <GroupByMenu
              columns={visibleColumns}
              selectedGroupBy={groupBy}
              onGroupByChange={setGroupBy}
            />

            <button
              onClick={() => setShowColumnConfig(true)}
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Sort"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleClone}
              className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Clone this page"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <button
                ref={exportButtonRef}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Export"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              {/* Export dropdown menu */}
              {showExportMenu && (
                <div
                  ref={exportMenuRef}
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    Export as CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FileJson className="h-4 w-4 text-gray-600" />
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            {/* Undo button - only show when there are changes */}
            {hasUnsavedChanges && (
              <button
                onClick={handleUndo}
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Undo changes"
              >
                <Undo className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Save button with dropdown - only show when there are changes */}
            {hasUnsavedChanges && (
              <div className="relative">
                <button
                  ref={saveButtonRef}
                  onClick={() => setShowSaveMenu(!showSaveMenu)}
                  disabled={isSaving}
                  className="p-1.5 border rounded-md bg-orange-500 text-white border-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Save changes"
                >
                  <Save className="h-3.5 w-3.5" />
                </button>

                {/* Save dropdown menu */}
                {showSaveMenu && (
                  <div
                    ref={saveMenuRef}
                    className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 text-gray-600" />
                      Save this view
                    </button>
                    <button
                      onClick={handleSaveAsNew}
                      disabled={isSaving}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                      Save as a new page
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Add Entity button */}
            <button
              onClick={() => setShowEntityModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {blueprint.title}
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
            {page.description || `Showing ${total} ${total === 1 ? 'entity' : 'entities'} from ${blueprint.title} blueprint`}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <EntityTableView
            filters={filters}
            entities={entities as any}
            groupBy={groupBy}
            onDuplicateEntity={handleDuplicateEntity}
            onEditEntity={handleEditEntity}
            onDeleteEntity={handleDeleteEntity}
          />
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        blueprint={blueprint}
        onApply={(conditions) => {
          const newFilters: CatalogFilters = {
            search: filters.search,
            types: [],
            teams: [],
            statuses: [],
            tags: [],
          }

          conditions.forEach((condition) => {
            const value = condition.value
            if (!value || (Array.isArray(value) && value.length === 0)) return

            switch (condition.field) {
              case 'type':
                if (typeof value === 'string' && value) newFilters.types = [value as any]
                break
              case 'status':
                if (typeof value === 'string' && value) newFilters.statuses = [value as any]
                break
              case 'team':
                if (typeof value === 'string' && value) newFilters.teams = [value]
                break
              case 'tags':
                if (Array.isArray(value)) newFilters.tags = value
                break
              case 'title':
              case 'name':
                if (typeof value === 'string' && value) newFilters.search = value
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

      {/* Entity Creation Modal */}
      {showEntityModal && blueprint && (
        <EntityCreationModal
          blueprint={blueprint}
          onClose={() => setShowEntityModal(false)}
          onSuccess={() => {
            setShowEntityModal(false)
            onEntityCreated()
          }}
        />
      )}

      {/* Entity Duplicate Modal */}
      {entityToDuplicate && blueprint && (
        <EntityCreationModal
          blueprint={blueprint}
          initialEntity={entityToDuplicate as any}
          isDuplicate={true}
          onClose={() => setEntityToDuplicate(null)}
          onSuccess={() => {
            setEntityToDuplicate(null)
            onEntityCreated()
          }}
        />
      )}

      {/* Entity Edit Modal */}
      {entityToEdit && blueprint && (
        <EntityEditModal
          blueprint={blueprint}
          entity={entityToEdit as any}
          onClose={() => setEntityToEdit(null)}
          onSuccess={() => {
            setEntityToEdit(null)
            onEntityCreated()
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {entityToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗑️</span>
                <h2 className="text-base font-semibold text-gray-900">
                  Delete {blueprint?.title}?
                </h2>
              </div>
              <button
                onClick={() => setEntityToDelete(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Entity Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <IconDisplay
                  name={entityToDelete.icon || blueprint?.icon || '📦'}
                  className="w-5 h-5 text-blue-600"
                />
                <span>{entityToDelete.title || entityToDelete.identifier}</span>
              </div>

              {/* Related Entities Info */}
              {entityToDelete.relations && (
                <div className="text-sm text-gray-700">
                  This entity has the following{' '}
                  <button className="text-blue-600 hover:underline">related entities</button>.
                </div>
              )}

              {/* Warning */}
              <div className="flex gap-3 p-3 bg-red-50 rounded-md border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  You will not be able to recover the data
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setEntityToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEntity}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save as New Page Modal */}
      {showSaveAsNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Save as a new page</h2>
              <p className="text-sm text-gray-500 mt-1">Create a new catalog page with current configuration</p>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Name
              </label>
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Enter page name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPageName.trim()) {
                    handleConfirmSaveAsNew()
                  }
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-end gap-2 bg-gray-50">
              <button
                onClick={() => {
                  setShowSaveAsNewModal(false)
                  setNewPageName('')
                }}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-white transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveAsNew}
                disabled={isSaving || !newPageName.trim()}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Creating...' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function CatalogPageView({
  blueprintIdentifier: propBlueprintId,
  pageTitle,
  pageIcon,
  pageDescription
}: CatalogPageViewProps = {}) {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useAuth();
  const tenantIdRef = useRef<string | null>(null);

  const [page, setPage] = useState<CatalogPage | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    types: [],
    teams: [],
    statuses: [],
    tags: [],
  });

  // Track initial state for change detection
  const [initialFilters, setInitialFilters] = useState<CatalogFilters>({
    search: '',
    types: [],
    teams: [],
    statuses: [],
    tags: [],
  });
  const [initialColumns, setInitialColumns] = useState<string[]>([]);

  // Redirect to dashboard when tenant changes
  useEffect(() => {
    if (currentTenant?.id) {
      // Initialize tenant ref on first load
      if (tenantIdRef.current === null) {
        tenantIdRef.current = currentTenant.id;
      } else if (tenantIdRef.current !== currentTenant.id) {
        // Tenant has changed - redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [currentTenant, navigate]);

  useEffect(() => {
    if (pageId || propBlueprintId) {
      loadPageData();
    }
  }, [pageId, propBlueprintId]);

  // Reload entities when filters change
  useEffect(() => {
    if (blueprint) {
      loadEntities(blueprint.identifier, filters);
    }
  }, [filters, blueprint]);

  // Convert CatalogFilters to SearchQuery format
  const buildSearchQuery = (currentFilters: CatalogFilters) => {
    const rules: any[] = [];

    // Add search query as a rule for the 'title' field
    if (currentFilters.search) {
      rules.push({
        property: '$title',
        operator: 'contains',
        value: currentFilters.search
      });
    }

    // Add type filters
    if (currentFilters.types.length > 0) {
      rules.push({
        property: '$blueprint',
        operator: 'in',
        value: currentFilters.types
      });
    }

    // Add team filters
    if (currentFilters.teams.length > 0) {
      rules.push({
        property: '$team',
        operator: 'in',
        value: currentFilters.teams
      });
    }

    // Add status filters
    if (currentFilters.statuses.length > 0) {
      rules.push({
        property: 'status',
        operator: 'in',
        value: currentFilters.statuses
      });
    }

    // Add tag filters
    if (currentFilters.tags.length > 0) {
      rules.push({
        property: 'tags',
        operator: 'contains',
        value: currentFilters.tags
      });
    }

    return {
      rules: rules.length > 0 ? rules : undefined,
      combinator: 'and' as const
    };
  };

  const loadEntities = async (blueprintId: string, currentFilters: CatalogFilters) => {
    try {
      const searchQuery = buildSearchQuery(currentFilters);

      // Use search if there are filters, otherwise use getAll
      if (searchQuery.rules && searchQuery.rules.length > 0) {
        const searchRes = await entityService.searchInBlueprint(blueprintId, searchQuery);
        if (searchRes.ok) {
          setEntities(searchRes.entities);
          setTotal(searchRes.total);
        }
      } else {
        const entitiesRes = await entityService.getAll(blueprintId);
        if (entitiesRes.ok) {
          setEntities(entitiesRes.entities);
          setTotal(entitiesRes.total);
        }
      }
    } catch (err) {
      console.error('Failed to load entities:', err);
    }
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError('');

      let targetBlueprintId = propBlueprintId;
      let targetPage = page;

      // If no prop blueprint ID, load page configuration from URL param
      if (!propBlueprintId) {
        if (!pageId) throw new Error('No page ID provided');
        const pageRes = await catalogPageService.getPage(pageId);
        if (!pageRes.ok) {
          throw new Error('Failed to load page');
        }
        targetPage = pageRes.page;
        targetBlueprintId = pageRes.page.blueprintId;
        setPage(targetPage);

        // Load saved filters if available
        if (targetPage.filters) {
          const savedFilters = targetPage.filters as any
          const loadedFilters = {
            search: savedFilters.search || '',
            types: savedFilters.types || [],
            teams: savedFilters.teams || [],
            statuses: savedFilters.statuses || [],
            tags: savedFilters.tags || [],
          }
          setFilters(loadedFilters)
          setInitialFilters(loadedFilters)
        }

        // Load saved columns
        if (targetPage.columns && Array.isArray(targetPage.columns)) {
          setInitialColumns(targetPage.columns)
        }
      } else {
        // Construct a pseudo-page object from props
        setPage({
          id: 'custom',
          title: pageTitle || 'Catalog',
          description: pageDescription,
          icon: pageIcon as any,
          blueprintId: propBlueprintId,
          layout: 'table', // Default layout
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          filters: {},
          columns: [],
          order: 0,
          isPublic: false,
          organizationId: 'default'
        });
        targetBlueprintId = propBlueprintId;
      }

      if (!targetBlueprintId) {
        throw new Error('No blueprint identifier found');
      }

      // Load blueprint details
      const blueprintRes = await blueprintApi.getById(targetBlueprintId);
      setBlueprint(blueprintRes);

      // Load entities for the blueprint with current filters
      // Note: loadEntities will be called by the useEffect when blueprint changes
      // But we need initial load here before blueprint state is set
      const searchQuery = buildSearchQuery(filters);
      if (searchQuery.rules && searchQuery.rules.length > 0) {
        const searchRes = await entityService.searchInBlueprint(targetBlueprintId, searchQuery);
        if (searchRes.ok) {
          setEntities(searchRes.entities);
          setTotal(searchRes.total);
        }
      } else {
        const entitiesRes = await entityService.getAll(targetBlueprintId);
        if (entitiesRes.ok) {
          setEntities(entitiesRes.entities);
          setTotal(entitiesRes.total);
        }
      }
    } catch (err: any) {
      console.error('Failed to load catalog page:', err);
      setError(err.message || 'Failed to load catalog page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!page || !blueprint) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Catalog page not found</p>
        </div>
      </div>
    );
  }

  const handleSaveView = async (columns: string[], currentFilters: CatalogFilters) => {
    if (!pageId) return

    try {
      // Convert current filters to the format expected by the API
      const filterData: Record<string, any> = {}
      if (currentFilters.search) filterData.search = currentFilters.search
      if (currentFilters.types.length > 0) filterData.types = currentFilters.types
      if (currentFilters.teams.length > 0) filterData.teams = currentFilters.teams
      if (currentFilters.statuses.length > 0) filterData.statuses = currentFilters.statuses
      if (currentFilters.tags.length > 0) filterData.tags = currentFilters.tags

      await catalogPageService.updatePage(pageId, {
        filters: filterData,
        columns: columns
      })

      // Update initial state after successful save
      setInitialFilters(currentFilters)
      setInitialColumns(columns)

      console.log('View saved successfully')
    } catch (err) {
      console.error('Failed to save view:', err)
    }
  }

  return (
    <ColumnConfigProvider blueprint={blueprint} savedColumns={page.columns}>
      <div className="h-full flex flex-col -m-6">
        <CatalogPageContent
          page={page}
          blueprint={blueprint}
          entities={entities}
          total={total}
          filters={filters}
          setFilters={setFilters}
          onSave={handleSaveView}
          onEntityCreated={loadPageData}
          initialFilters={initialFilters}
          initialColumns={initialColumns}
        />
      </div>
    </ColumnConfigProvider>
  )
}
