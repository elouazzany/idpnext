import { createContext, useContext, ReactNode } from 'react'

interface CatalogContextType {
  refreshCatalog: () => void
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined)

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }
  return context
}

interface CatalogProviderProps {
  children: ReactNode
  refreshCatalog: () => void
}

export function CatalogProvider({ children, refreshCatalog }: CatalogProviderProps) {
  return (
    <CatalogContext.Provider value={{ refreshCatalog }}>
      {children}
    </CatalogContext.Provider>
  )
}
