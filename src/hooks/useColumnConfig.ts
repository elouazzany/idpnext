import { useState, useEffect } from 'react'
import { ColumnConfig, ColumnDefinition } from '@/types/catalog'

const STORAGE_KEY = 'catalog-column-config'

// Default column definitions matching Port.io design
export const defaultColumns: ColumnDefinition[] = [
  {
    id: 'name',
    label: 'Title',
    type: 'text',
    accessor: 'name',
    defaultVisible: true,
    sortable: true,
    resizable: false,
    minWidth: 200,
    width: 250,
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'badge',
    accessor: 'tier',
    defaultVisible: true,
    sortable: true,
    resizable: true,
    minWidth: 120,
    width: 150,
  },
  {
    id: 'url',
    label: 'URL',
    type: 'link',
    accessor: 'url',
    defaultVisible: true,
    sortable: false,
    resizable: true,
    minWidth: 150,
    width: 200,
  },
  {
    id: 'onCall',
    label: 'On Call',
    type: 'email',
    accessor: 'onCall',
    defaultVisible: true,
    sortable: true,
    resizable: true,
    minWidth: 180,
    width: 220,
  },
  {
    id: 'lifecycle',
    label: 'Lifecycle',
    type: 'badge',
    accessor: 'lifecycle',
    defaultVisible: true,
    sortable: true,
    resizable: true,
    minWidth: 120,
    width: 140,
  },
  {
    id: 'language',
    label: 'Language',
    type: 'text',
    accessor: 'metadata.language',
    defaultVisible: true,
    sortable: true,
    resizable: true,
    minWidth: 100,
    width: 120,
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    type: 'status',
    accessor: 'monitoring',
    defaultVisible: true,
    sortable: true,
    resizable: true,
    minWidth: 100,
    width: 130,
  },
  // Additional columns (can be hidden)
  {
    id: 'type',
    label: 'Type',
    type: 'badge',
    accessor: 'type',
    defaultVisible: false,
    sortable: true,
    resizable: true,
    minWidth: 100,
    width: 120,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'status',
    accessor: 'status',
    defaultVisible: false,
    sortable: true,
    resizable: true,
    minWidth: 100,
    width: 120,
  },
  {
    id: 'owner',
    label: 'Owner',
    type: 'text',
    accessor: 'owner',
    defaultVisible: false,
    sortable: true,
    resizable: true,
    minWidth: 120,
    width: 150,
  },
  {
    id: 'tags',
    label: 'Tags',
    type: 'tags',
    accessor: 'tags',
    defaultVisible: false,
    sortable: false,
    resizable: true,
    minWidth: 150,
    width: 200,
  },
  {
    id: 'lastDeployed',
    label: 'Last Deployed',
    type: 'text',
    accessor: 'metadata.lastDeployed',
    defaultVisible: false,
    sortable: true,
    resizable: true,
    minWidth: 130,
    width: 150,
  },
]

function getInitialConfig(): ColumnConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load column config from localStorage:', error)
  }

  // Return default configuration
  return defaultColumns.map((col, index) => ({
    id: col.id,
    visible: col.defaultVisible,
    order: index,
    width: col.width,
  }))
}

export function useColumnConfig() {
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(getInitialConfig)

  // Save to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnConfig))
    } catch (error) {
      console.error('Failed to save column config to localStorage:', error)
    }
  }, [columnConfig])

  const toggleColumn = (columnId: string) => {
    setColumnConfig((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col))
    )
  }

  const updateColumnWidth = (columnId: string, width: number) => {
    setColumnConfig((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, width } : col))
    )
  }

  const reorderColumns = (newOrder: ColumnConfig[]) => {
    setColumnConfig(newOrder.map((col, index) => ({ ...col, order: index })))
  }

  const resetToDefaults = () => {
    const defaultConfig = defaultColumns.map((col, index) => ({
      id: col.id,
      visible: col.defaultVisible,
      order: index,
      width: col.width,
    }))
    setColumnConfig(defaultConfig)
  }

  // Get visible columns in correct order with their definitions
  const visibleColumns = columnConfig
    .filter((config) => config.visible)
    .sort((a, b) => a.order - b.order)
    .map((config) => {
      const definition = defaultColumns.find((col) => col.id === config.id)
      return definition ? { ...definition, width: config.width } : null
    })
    .filter(Boolean) as ColumnDefinition[]

  return {
    columnConfig,
    visibleColumns,
    allColumns: defaultColumns,
    toggleColumn,
    updateColumnWidth,
    reorderColumns,
    resetToDefaults,
  }
}
