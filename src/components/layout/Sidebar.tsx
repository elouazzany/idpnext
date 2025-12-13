import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Search,
  PlusSquare,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Box,
  User,
  Users,
  LayoutTemplate,
  LayoutDashboard,
  FolderPlus,
  Sparkles,
  Folder,
  Edit,
  Settings,
  Lock,
  Trash2,
  GripVertical
} from 'lucide-react'
import { clsx } from 'clsx'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import catalogPageService from '../../services/catalogPage.service'
import { CatalogFolder, CatalogPage, ReorderItem } from '../../types/catalogPage'
import { ConfirmDeleteModal } from '../datamodel/ConfirmDeleteModal'
import { IconDisplay } from '../IconDisplay'
import { useAuth } from '../../contexts/AuthContext'

import FolderCreationModal from '../catalog/FolderCreationModal'
import PageCreationModal from '../catalog/PageCreationModal'
import PageEditModal from '../catalog/PageEditModal'

type NavItem = {
  name: string
  href?: string
  icon?: any
  children?: NavItem[]
  isHeader?: boolean
  iconColor?: string
  isOpen?: boolean
}

const topNavigation: NavItem[] = [
  // {
  //   name: 'Service Catalog',
  //   isHeader: false,
  //   href: '/catalog',
  //   icon: Box,
  //   iconColor: 'text-pink-500'
  // },
]

const bottomNavigation: NavItem[] = [
  // { name: 'Users', href: '/users', icon: User, iconColor: 'text-gray-700', isHeader: false },
  // { name: 'Teams', href: '/teams', icon: Users, iconColor: 'text-gray-700', isHeader: false },
]

interface SidebarProps {
  refreshCatalogRef?: React.MutableRefObject<(() => void) | null>
}

export function Sidebar({ refreshCatalogRef }: SidebarProps = {}) {
  const { currentTenant } = useAuth()
  const tenantIdRef = useRef<string | null>(null)

  // State to track expanded items by their path string (e.g. "0-0")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '1': true // Developer section open by default (now at index 1)
  })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    type: 'page' | 'folder'
    id: string
    title: string
  }>({
    isOpen: false,
    type: 'page',
    id: '',
    title: ''
  })
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false)

  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showPageModal, setShowPageModal] = useState(false)
  const [pageToEdit, setPageToEdit] = useState<CatalogPage | null>(null)
  const [catalogFolders, setCatalogFolders] = useState<CatalogFolder[]>([])
  const [catalogPages, setCatalogPages] = useState<CatalogPage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState<{
    type: 'page' | 'folder'
    id: string
    x: number
    y: number
  } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'folder' | 'page' | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const id = active.id.toString()

    // Determine if dragging a folder or page
    const isFolder = catalogFolders.some(f => f.id === id)
    const isPage = catalogPages.some(p => p.id === id)

    setActiveId(id)
    setActiveType(isFolder ? 'folder' : isPage ? 'page' : null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      setActiveType(null)
      return
    }

    const activeId = active.id.toString()
    const overId = over.id.toString()

    // Handle folder reordering
    if (activeType === 'folder') {
      const oldIndex = catalogFolders.findIndex(f => f.id === activeId)
      const newIndex = catalogFolders.findIndex(f => f.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFolders = arrayMove(catalogFolders, oldIndex, newIndex)

        // Update order property on each folder to match new position
        const foldersWithUpdatedOrder = reorderedFolders.map((folder, index) => ({
          ...folder,
          order: index
        }))

        // Update UI optimistically with corrected order values
        setCatalogFolders(foldersWithUpdatedOrder)

        // Update order on server in background
        try {
          const reorderItems: ReorderItem[] = foldersWithUpdatedOrder.map((folder, index) => ({
            id: folder.id,
            order: index
          }))
          await catalogPageService.reorderItems(reorderItems, 'folder')
          // Don't refresh - let the optimistic update persist
        } catch (error) {
          console.error('Failed to reorder folders:', error)
          // Only reload on error to revert
          loadCatalogData()
        }
      }
    }

    // Handle page reordering (root pages only)
    if (activeType === 'page') {
      const rootPages = catalogPages.filter(p => !p.folderId)
      const oldIndex = rootPages.findIndex(p => p.id === activeId)
      const newIndex = rootPages.findIndex(p => p.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedPages = arrayMove(rootPages, oldIndex, newIndex)

        // Update order property on each page to match new position
        const pagesWithUpdatedOrder = reorderedPages.map((page, index) => ({
          ...page,
          order: index
        }))

        // Merge with non-root pages
        const nonRootPages = catalogPages.filter(p => p.folderId)
        const allPages = [...pagesWithUpdatedOrder, ...nonRootPages]

        // Update UI optimistically with corrected order values
        setCatalogPages(allPages)

        // Update order on server in background
        try {
          const reorderItems: ReorderItem[] = pagesWithUpdatedOrder.map((page, index) => ({
            id: page.id,
            order: index
          }))
          await catalogPageService.reorderItems(reorderItems, 'page')
          // Don't refresh - let the optimistic update persist
        } catch (error) {
          console.error('Failed to reorder pages:', error)
          // Only reload on error to revert
          loadCatalogData()
        }
      }
    }

    setActiveId(null)
    setActiveType(null)
  }

  // Expose loadCatalogData function through ref
  useEffect(() => {
    if (refreshCatalogRef) {
      refreshCatalogRef.current = loadCatalogData
    }
  }, [refreshCatalogRef])

  // Reload catalog data when tenant changes
  useEffect(() => {
    if (currentTenant?.id) {
      // Initialize tenant ref on first load
      if (tenantIdRef.current === null) {
        tenantIdRef.current = currentTenant.id
        loadCatalogData()
      } else if (tenantIdRef.current !== currentTenant.id) {
        // Tenant has changed - reload catalog data
        tenantIdRef.current = currentTenant.id
        loadCatalogData()
      }
    }
  }, [currentTenant])

  useEffect(() => {
    loadCatalogData()
  }, [])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu])

  const loadCatalogData = async () => {
    try {
      setLoading(true)
      const [foldersRes, pagesRes] = await Promise.all([
        catalogPageService.getFolderTree(),
        catalogPageService.getAllPages()
      ])

      if (foldersRes.ok) setCatalogFolders(foldersRes.tree)
      if (pagesRes.ok) setCatalogPages(pagesRes.pages)
    } catch (error) {
      console.error('Failed to load catalog data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = () => {
    setIsNewMenuOpen(false)
    setShowFolderModal(true)
  }

  const handleCreatePage = () => {
    setIsNewMenuOpen(false)
    setShowPageModal(true)
  }

  const handleFolderSuccess = () => {
    loadCatalogData()
    setShowFolderModal(false)
  }

  const handlePageSuccess = () => {
    loadCatalogData()
    setShowPageModal(false)
  }

  const handlePageEditSuccess = () => {
    loadCatalogData()
    setPageToEdit(null)
  }

  const handleDeleteClick = (type: 'page' | 'folder', id: string, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      title
    })
    setContextMenu(null)
  }

  const handleConfirmDelete = async () => {
    const { type, id } = deleteConfirmation

    try {
      if (type === 'page') {
        await catalogPageService.deletePage(id)
      } else {
        await catalogPageService.deleteFolder(id, true)
      }
      loadCatalogData()
      setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
      alert(`Failed to delete ${type}`)
    }
  }

  const showContextMenu = (e: React.MouseEvent, type: 'page' | 'folder', id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      type,
      id,
      x: e.clientX,
      y: e.clientY
    })
  }

  // ... existing renderItem and components

  const toggleItem = (pathKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [pathKey]: !prev[pathKey]
    }))
  }

  // Sortable Folder Wrapper
  const SortableFolderItem = ({ folder, level = 0 }: { folder: CatalogFolder; level?: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      setActivatorNodeRef
    } = useSortable({ id: folder.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div ref={setNodeRef} style={style}>
        <FolderItem
          folder={folder}
          level={level}
          dragHandleProps={{ ...attributes, ...listeners }}
          dragHandleRef={setActivatorNodeRef}
          isDragging={isDragging}
        />
      </div>
    )
  }

  // Folder Component
  const FolderItem = ({
    folder,
    level = 0,
    dragHandleProps,
    dragHandleRef,
    isDragging = false
  }: {
    folder: CatalogFolder;
    level?: number;
    dragHandleProps?: any;
    dragHandleRef?: (element: HTMLElement | null) => void;
    isDragging?: boolean;
  }) => {
    const folderKey = `catalog-folder-${folder.id}`
    const isOpen = expandedItems[folderKey]

    return (
      <div>
        <div
          className={clsx(
            "w-full flex items-center justify-between px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md group transition-colors",
            level > 0 && "ml-2",
            isDragging && "bg-blue-50"
          )}
          style={{ paddingLeft: `${level * 0.5 + 0.5}rem` }}
        >
          <div className="flex items-center gap-1.5 flex-1">
            {dragHandleProps && (
              <button
                ref={dragHandleRef}
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="h-3 w-3 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => toggleItem(folderKey)}
              className="flex items-center gap-1"
            >
              {isOpen ? (
                <ChevronDown className="h-3 w-3 text-gray-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-400" />
              )}
            </button>
            <span className="truncate flex-1 font-semibold">{folder.title}</span>
          </div>
          <button
            onClick={(e) => showContextMenu(e, 'folder', folder.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        {isOpen && (
          <div className="ml-2">
            {/* Render child folders first */}
            {folder.children && folder.children.length > 0 && (
              <>
                {folder.children
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map(childFolder => (
                    <FolderItem key={childFolder.id} folder={childFolder} level={level + 1} />
                  ))}
              </>
            )}

            {/* Render pages in this folder */}
            {folder.pages && folder.pages.length > 0 && (
              <>
                {folder.pages
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map(page => (
                    <PageItem key={page.id} page={page} level={level + 1} />
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // Sortable Page Wrapper
  const SortablePageItem = ({ page, level = 0 }: { page: CatalogPage; level?: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      setActivatorNodeRef
    } = useSortable({ id: page.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div ref={setNodeRef} style={style}>
        <PageItem
          page={page}
          level={level}
          dragHandleProps={{ ...attributes, ...listeners }}
          dragHandleRef={setActivatorNodeRef}
          isDragging={isDragging}
        />
      </div>
    )
  }

  // Page Component
  const PageItem = ({
    page,
    level = 0,
    dragHandleProps,
    dragHandleRef,
    isDragging = false
  }: {
    page: CatalogPage;
    level?: number;
    dragHandleProps?: any;
    dragHandleRef?: (element: HTMLElement | null) => void;
    isDragging?: boolean;
  }) => {
    return (
      <div className="group relative">
        <NavLink
          to={`/catalog/${page.id}`}
          className={({ isActive }) =>
            clsx(
              'flex items-center justify-between gap-2 py-2 rounded-md text-sm transition-colors pr-6',
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100',
              isDragging && 'bg-blue-50'
            )
          }
          style={{ paddingLeft: `${level * 0.5 + 0.5}rem` }}
        >
          <div className="flex items-center gap-2">
            {dragHandleProps && (
              <button
                ref={dragHandleRef}
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <GripVertical className="h-3 w-3 text-gray-400" />
              </button>
            )}
            {page.icon && <IconDisplay name={page.icon as string} className="w-4 h-4" />}
            <span className="truncate font-semibold">{page.title}</span>
          </div>
        </NavLink>
        <button
          onClick={(e) => showContextMenu(e, 'page', page.id)}
          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-3 w-3 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    )
  }

  const renderItem = (item: NavItem, path: number[], level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isHeader = item.isHeader
    const pathKey = path.join('-')
    const isOpen = expandedItems[pathKey]

    if (isHeader) {
      return (
        <div key={item.name} className="mb-4">
          {item.href ? (
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2 px-2 py-2.5 mb-1 rounded-md cursor-pointer transition-colors",
                  isActive
                    ? 'bg-gray-200'
                    : 'bg-gray-100/50 hover:bg-gray-200'
                )
              }
            >
              {item.icon && <item.icon className={clsx("h-4 w-4", item.iconColor)} />}
              <span className="text-sm font-semibold text-gray-700">{item.name}</span>
            </NavLink>
          ) : (
            <div className="flex items-center gap-2 px-2 py-2.5 mb-1 bg-gray-100/50 rounded-md">
              {item.icon && <item.icon className={clsx("h-4 w-4", item.iconColor)} />}
              <span className="text-sm font-semibold text-gray-700">{item.name}</span>
            </div>
          )}
          <div className="space-y-0.5">
            {item.children?.map((child, index) => renderItem(child, [...path, index], level + 1))}
          </div>
        </div>
      )
    }

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleItem(pathKey)}
            className={clsx(
              "w-full flex items-center justify-between px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md group transition-colors",
              level > 1 && "ml-2"
            )}
            style={{ paddingLeft: `${level * 0.5 + 0.5}rem` }}
          >
            <div className="flex items-center gap-1.5">
              {isOpen ? (
                <ChevronDown className="h-3 w-3 text-gray-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-400" />
              )}
              {item.icon && <item.icon className={clsx("h-4 w-4", item.iconColor)} />}
              <span className="font-semibold">{item.name}</span>
            </div>
            <MoreHorizontal className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />
          </button>
          {isOpen && (
            <div className="border-l border-gray-200 ml-3 mt-0.5 space-y-0.5">
              {item.children?.map((child, index) => renderItem(child, [...path, index], level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <NavLink
        key={item.name}
        to={item.href || '#'}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-2 py-2 rounded-md text-sm transition-colors',
            isActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'
          )
        }
        style={{ paddingLeft: `${level * 0.5 + 0.5}rem`, paddingRight: '0.5rem' }}
      >
        {item.icon && <item.icon className={clsx("h-4 w-4", item.iconColor)} />}
        <span className="truncate font-semibold">{item.name}</span>
      </NavLink>
    )
  }

  return (
    <aside className="w-48 border-r bg-gray-50/50 flex flex-col h-full">
      {/* Search and New Button */}
      <div className="p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <ChevronDown className="h-2 w-2 text-gray-400" />
            <ChevronDown className="h-2 w-2 text-gray-400 rotate-180" />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="flex items-center gap-2 px-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <PlusSquare className="h-3.5 w-3.5 fill-gray-800 text-white" />
            New
          </button>

          {isNewMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsNewMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleCreatePage}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <LayoutTemplate className="h-3.5 w-3.5 text-gray-400" />
                  New catalog page
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <LayoutDashboard className="h-3.5 w-3.5 text-gray-400" />
                  New dashboard
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-gray-400" />
                  New folder
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                  New experience
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {topNavigation.map((item, index) => renderItem(item, [index]))}

        {/* Catalog Folders and Pages Section */}
        {!loading && (catalogFolders.length > 0 || catalogPages.length > 0) && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Folders */}
            <SortableContext
              items={catalogFolders.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {catalogFolders
                .filter(folder => {
                  if (!searchQuery) return true
                  const matchesFolder = folder.title.toLowerCase().includes(searchQuery.toLowerCase())
                  const matchesPage = folder.pages?.some(p =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  return matchesFolder || matchesPage
                })
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map(folder => <SortableFolderItem key={folder.id} folder={folder} />)}
            </SortableContext>

            {/* Root Pages */}
            <SortableContext
              items={catalogPages.filter(p => !p.folderId).map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {catalogPages
                .filter(page => !page.folderId)
                .filter(page => !searchQuery || page.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map(page => <SortablePageItem key={page.id} page={page} />)}
            </SortableContext>

            <DragOverlay>
              {activeId && activeType === 'folder' && (
                <div className="bg-white shadow-lg rounded-md p-2 opacity-90">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold">
                      {catalogFolders.find(f => f.id === activeId)?.title}
                    </span>
                  </div>
                </div>
              )}
              {activeId && activeType === 'page' && (
                <div className="bg-white shadow-lg rounded-md p-2 opacity-90">
                  <div className="flex items-center gap-2">
                    {catalogPages.find(p => p.id === activeId)?.icon && (
                      <IconDisplay
                        name={catalogPages.find(p => p.id === activeId)?.icon as string}
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-sm font-semibold">
                      {catalogPages.find(p => p.id === activeId)?.title}
                    </span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {bottomNavigation.map((item, index) => renderItem(item, [index + topNavigation.length]))}
      </nav>

      {/* Modals */}
      {showFolderModal && (
        <FolderCreationModal
          onClose={() => setShowFolderModal(false)}
          onSuccess={handleFolderSuccess}
        />
      )}

      {showPageModal && (
        <PageCreationModal
          onClose={() => setShowPageModal(false)}
          onSuccess={handlePageSuccess}
        />
      )}

      {pageToEdit && (
        <PageEditModal
          page={pageToEdit}
          onClose={() => setPageToEdit(null)}
          onSuccess={handlePageEditSuccess}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        title={`Delete ${deleteConfirmation.type === 'page' ? 'Page' : 'Folder'}`}
        message={`Are you sure you want to delete "${deleteConfirmation.title}"? ${deleteConfirmation.type === 'folder'
          ? 'This will also delete all pages inside it.'
          : 'This action cannot be undone.'
          }`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <button
            onClick={() => {
              if (contextMenu.type === 'page') {
                const page = catalogPages.find(p => p.id === contextMenu.id) ||
                  catalogFolders.flatMap(f => f.pages || []).find(p => p.id === contextMenu.id)
                if (page) setPageToEdit(page)
              }
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-3.5 w-3.5 text-gray-500" />
            Edit {contextMenu.type}
          </button>
          {contextMenu.type === 'page' && (
            <button
              onClick={() => setContextMenu(null)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-gray-500" />
              Manage Blueprint
            </button>
          )}
          <button
            onClick={() => setContextMenu(null)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-gray-500" />
            Permissions
          </button>
          <button
            onClick={() => setContextMenu(null)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Lock className="h-3.5 w-3.5 text-gray-500" />
            Lock {contextMenu.type}
          </button>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => {
              const item = contextMenu.type === 'page'
                ? catalogPages.find(p => p.id === contextMenu.id)
                : catalogFolders.find(f => f.id === contextMenu.id)

              if (item) {
                handleDeleteClick(contextMenu.type, contextMenu.id, item.title)
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete {contextMenu.type}
          </button>
        </div>
      )}
    </aside>
  )
}
