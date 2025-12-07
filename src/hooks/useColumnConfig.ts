import { useState, useEffect, useMemo } from 'react'
import { ColumnConfig, ColumnDefinition } from '@/types/catalog'
import { Blueprint } from '@/types/blueprint'

const STORAGE_KEY = 'catalog-column-config'

// Helper function to generate columns from blueprint properties
function generateColumnsFromBlueprint(blueprint: Blueprint): ColumnDefinition[] {
  const columns: ColumnDefinition[] = []

  // Always add title/identifier column first
  columns.push({
    id: 'title',
    label: 'Title',
    type: 'text',
    accessor: 'title',
    defaultVisible: true,
    sortable: true,
    resizable: false,
    minWidth: 200,
    width: 250,
  })

  // Add columns for each blueprint property
  if (blueprint.schema?.properties) {
    Object.entries(blueprint.schema.properties).forEach(([key, prop]) => {
      // Determine column type based on property type
      let columnType: ColumnDefinition['type'] = 'text'

      if (prop.type === 'string' && prop.format === 'email') {
        columnType = 'email'
      } else if (prop.type === 'string' && prop.format === 'url') {
        columnType = 'link'
      } else if (prop.type === 'boolean') {
        columnType = 'status'
      } else if (prop.enum && prop.enum.length > 0) {
        columnType = 'badge'
      } else if (prop.type === 'array') {
        columnType = 'tags'
      }

      columns.push({
        id: key,
        label: prop.title || key,
        type: columnType,
        accessor: `properties.${key}`,
        defaultVisible: true,
        sortable: true,
        resizable: true,
        minWidth: 120,
        width: 150,
      })
    })
  }

  return columns
}

// Default column definitions matching Port.io design (fallback)
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

function getInitialConfig(columns: ColumnDefinition[], savedColumns?: string[]): ColumnConfig[] {
  // If there are saved columns, use them to set visibility
  if (savedColumns && savedColumns.length > 0) {
    return columns.map((col, index) => ({
      id: col.id,
      visible: savedColumns.includes(col.id),
      order: savedColumns.indexOf(col.id) >= 0 ? savedColumns.indexOf(col.id) : index,
      width: col.width,
    }))
  }

  // Try to load from localStorage as fallback
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load column config from localStorage:', error)
  }

  // Return default configuration
  return columns.map((col, index) => ({
    id: col.id,
    visible: col.defaultVisible,
    order: index,
    width: col.width,
  }))
}

export function useColumnConfig(blueprint?: Blueprint, savedColumns?: string[]) {
  // Generate columns from blueprint or use defaults
  const allColumnsDefinitions = useMemo(() => {
    if (blueprint) {
      return generateColumnsFromBlueprint(blueprint)
    }
    return defaultColumns
  }, [blueprint])

  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(() =>
    getInitialConfig(allColumnsDefinitions, savedColumns)
  )

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
    const defaultConfig = allColumnsDefinitions.map((col, index) => ({
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
      const definition = allColumnsDefinitions.find((col) => col.id === config.id)
      return definition ? { ...definition, width: config.width } : null
    })
    .filter(Boolean) as ColumnDefinition[]

  return {
    columnConfig,
    visibleColumns,
    allColumns: allColumnsDefinitions,
    toggleColumn,
    updateColumnWidth,
    reorderColumns,
    resetToDefaults,
  }
}
