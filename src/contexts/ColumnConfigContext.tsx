import { createContext, useContext, ReactNode } from 'react'
import { useColumnConfig } from '@/hooks/useColumnConfig'
import { ColumnConfig, ColumnDefinition } from '@/types/catalog'
import { Blueprint } from '@/types/blueprint'

interface ColumnConfigContextType {
  columnConfig: ColumnConfig[]
  visibleColumns: ColumnDefinition[]
  allColumns: ColumnDefinition[]
  toggleColumn: (columnId: string) => void
  updateColumnWidth: (columnId: string, width: number) => void
  reorderColumns: (newOrder: ColumnConfig[]) => void
  resetToDefaults: () => void
}

const ColumnConfigContext = createContext<ColumnConfigContextType | undefined>(undefined)

interface ColumnConfigProviderProps {
  children: ReactNode
  blueprint?: Blueprint
  savedColumns?: string[]
}

export function ColumnConfigProvider({ children, blueprint, savedColumns }: ColumnConfigProviderProps) {
  const columnConfigValue = useColumnConfig(blueprint, savedColumns)

  return (
    <ColumnConfigContext.Provider value={columnConfigValue}>
      {children}
    </ColumnConfigContext.Provider>
  )
}

export function useColumnConfigContext() {
  const context = useContext(ColumnConfigContext)
  if (context === undefined) {
    throw new Error('useColumnConfigContext must be used within a ColumnConfigProvider')
  }
  return context
}
