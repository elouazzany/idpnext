import { Search, Plus, MoreHorizontal, RotateCcw } from 'lucide-react'
import { useColumnConfigContext } from '@/contexts/ColumnConfigContext'
import { useState, useEffect } from 'react'

interface ColumnManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ColumnManagerModal({ isOpen, onClose }: ColumnManagerModalProps) {
  const { columnConfig, allColumns, toggleColumn, resetToDefaults } = useColumnConfigContext()
  const [searchQuery, setSearchQuery] = useState('')

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Filter columns based on search
  const filteredColumns = allColumns.filter((column) =>
    column.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Separate visible and hidden columns
  const visibleColumns = filteredColumns.filter((column) => {
    const config = columnConfig.find((c) => c.id === column.id)
    return config?.visible ?? column.defaultVisible
  })

  const hiddenColumns = filteredColumns.filter((column) => {
    const config = columnConfig.find((c) => c.id === column.id)
    return !(config?.visible ?? column.defaultVisible)
  })

  const hideAll = () => {
    allColumns.forEach((column) => {
      const config = columnConfig.find((c) => c.id === column.id)
      const isVisible = config?.visible ?? column.defaultVisible
      if (isVisible) {
        toggleColumn(column.id)
      }
    })
  }

  const showAll = () => {
    allColumns.forEach((column) => {
      const config = columnConfig.find((c) => c.id === column.id)
      const isVisible = config?.visible ?? column.defaultVisible
      if (!isVisible) {
        toggleColumn(column.id)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-end z-50"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-xl w-full max-w-[320px] h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <h2 className="text-sm font-medium text-gray-900">Properties</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Reset all columns to default settings?')) {
                  resetToDefaults()
                }
              }}
              className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Count */}
        <div className="px-4 py-3">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500">
            {visibleColumns.length} of {allColumns.length} properties visible
          </p>
        </div>

        {/* Column List */}
        <div className="flex-1 overflow-y-auto">
          {/* Visible Columns Section */}
          {visibleColumns.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">Visible</span>
                <button
                  onClick={hideAll}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Hide all
                </button>
              </div>
              <div className="px-4 py-2">
                {visibleColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 -mx-2 rounded cursor-pointer group"
                  >
                    <span className="text-sm text-gray-700">{column.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Menu button clicked
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleColumn(column.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-green-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Section */}
          {hiddenColumns.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Hidden</span>
                <button
                  onClick={showAll}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Show all
                </button>
              </div>
              <div className="px-4 py-2">
                {hiddenColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 -mx-2 rounded cursor-pointer group"
                  >
                    <span className="text-sm text-gray-500">{column.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Menu button clicked
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleColumn(column.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus className="h-4 w-4" />
            Property
          </button>
        </div>
      </div>
    </div>
  )
}
