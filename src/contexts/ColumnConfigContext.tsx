import { createContext, useContext, ReactNode } from 'react'
import { useColumnConfig } from '@/hooks/useColumnConfig'
import { ColumnConfig, ColumnDefinition } from '@/types/catalog'

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

export function ColumnConfigProvider({ children }: { children: ReactNode }) {
  const columnConfigValue = useColumnConfig()

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
