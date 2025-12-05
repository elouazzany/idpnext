# Catalog Sidebar Implementation

## Overview
The sidebar has been enhanced to dynamically display catalog folders and pages, with functionality to create new folders and pages directly from the sidebar's "New" dropdown menu.

## Features Implemented

### 1. Dynamic Catalog Loading
- **Automatic Loading**: Folders and pages are loaded when the sidebar mounts
- **Tree Structure**: Folders display in a hierarchical tree with unlimited nesting
- **Real-time Updates**: Catalog refreshes after creating new folders or pages

### 2. "New" Button Functionality
The existing "New" dropdown menu now has functional buttons:

- **"New catalog page"**: Opens the PageCreationModal
  - Allows selection of blueprint
  - Optional folder assignment
  - Layout selection (table, grid, list)
  - Public/private toggle

- **"New folder"**: Opens the FolderCreationModal
  - Create folders with icons
  - Assign parent folder (supports nesting)
  - Add description

### 3. Search Functionality
- **Real-time Search**: Filter folders and pages as you type
- **Smart Matching**: Searches both folder titles and page titles
- **Hierarchical Search**: Shows folders if they contain matching pages

### 4. Catalog Display

#### Folder Display
- Collapsible/expandable with chevron icons
- Folder icon with optional custom emoji
- Nested indentation for visual hierarchy
- Displays contained pages when expanded

#### Page Display
- File icon with optional custom emoji
- Links to `/catalog/{pageId}` route
- Active state highlighting
- Nested under folders when assigned

### 5. Sidebar Organization

The sidebar now has three sections:
1. **Search & New Button** (top)
2. **Static Navigation** (main area)
   - Service Catalog
   - Developer
   - Team Lead
   - On-Call
   - Users
   - Teams
   - Data Model
3. **Catalog Section** (bottom, separated by border)
   - Dynamically loaded folders and pages
   - Only shows when data exists

## Code Changes

### Updated File
- `src/components/layout/Sidebar.tsx`

### New Imports
```typescript
import { useState, useEffect } from 'react'
import { Folder, FileText } from 'lucide-react'
import catalogPageService from '../../services/catalogPage.service'
import { CatalogFolder, CatalogPage } from '../../types/catalogPage'
import FolderCreationModal from '../catalog/FolderCreationModal'
import PageCreationModal from '../catalog/PageCreationModal'
```

### New State Variables
```typescript
const [showFolderModal, setShowFolderModal] = useState(false)
const [showPageModal, setShowPageModal] = useState(false)
const [catalogFolders, setCatalogFolders] = useState<CatalogFolder[]>([])
const [catalogPages, setCatalogPages] = useState<CatalogPage[]>([])
const [searchQuery, setSearchQuery] = useState('')
const [loading, setLoading] = useState(true)
```

### New Functions

#### loadCatalogData()
Fetches folders and pages from the API:
```typescript
const loadCatalogData = async () => {
  const [foldersRes, pagesRes] = await Promise.all([
    catalogPageService.getFolderTree(),
    catalogPageService.getAllPages()
  ])
  // Updates state with fetched data
}
```

#### renderCatalogFolder(folder, level)
Renders a folder with:
- Expand/collapse functionality
- Icon and title
- Nested children (folders and pages)
- Proper indentation based on level

#### renderCatalogPage(page, level)
Renders a page as a NavLink with:
- Icon and title
- Active state styling
- Proper indentation

## User Flow

### Creating a New Page
1. User clicks "New" button in sidebar
2. Dropdown menu opens
3. User clicks "New catalog page"
4. PageCreationModal opens
5. User fills in:
   - Title (required)
   - Icon (optional emoji)
   - Description (optional)
   - Blueprint (required - dropdown of existing blueprints)
   - Folder (optional - dropdown of existing folders)
   - Layout (table/grid/list)
   - Public/private toggle
6. User clicks "Create Page"
7. Page is created via API
8. Sidebar refreshes automatically
9. New page appears in sidebar

### Creating a New Folder
1. User clicks "New" button in sidebar
2. Dropdown menu opens
3. User clicks "New folder"
4. FolderCreationModal opens
5. User fills in:
   - Title (required)
   - Icon (optional emoji)
   - Description (optional)
   - Parent folder (optional - dropdown of existing folders)
6. User clicks "Create Folder"
7. Folder is created via API
8. Sidebar refreshes automatically
9. New folder appears in sidebar

### Searching
1. User types in "Search pages" input at top of sidebar
2. Catalog section filters in real-time
3. Shows folders and pages matching the search query
4. Folders are shown if their title matches OR if they contain matching pages

## Visual Hierarchy

```
Sidebar
├── Search Input
├── New Button (with dropdown)
│   ├── New catalog page ← functional
│   ├── New dashboard
│   ├── New folder ← functional
│   └── New experience
├── Static Navigation
│   ├── Service Catalog
│   ├── Developer
│   │   ├── Plan My Day
│   │   ├── My Services
│   │   └── ...
│   └── ...
└── CATALOG (separator)
    ├── 📁 Services (folder)
    │   ├── 📁 Backend (sub-folder)
    │   │   └── 📄 Microservices (page)
    │   └── 📄 Frontend Services (page)
    └── 📄 All Services (root page)
```

## Styling Details

### Folder Styling
- Gray folder icon
- Hover: light gray background
- Chevron for expand/collapse state
- Text: gray-600
- Padding increases with nesting level

### Page Styling
- Gray file icon
- Hover: light gray background
- Active: blue-50 background, blue-600 text
- Custom emoji displayed before title
- Padding increases with nesting level

### Modals
- Full-screen overlay with centered modal
- White background with shadow
- Form inputs with validation
- Cancel and Create/Save buttons
- Error messages displayed inline

## Integration Points

### API Services
Uses `catalogPageService` for:
- `getFolderTree()` - Get folder hierarchy
- `getAllPages()` - Get all pages
- `createFolder(data)` - Create new folder
- `createPage(data)` - Create new page

### Routing
Pages link to: `/catalog/{pageId}`
- This route needs to be created to display the page and its entities

### Authentication
- All API calls use authenticated endpoints
- User context automatically applied (organizationId, tenantId)

## Future Enhancements

1. **Right-click Context Menu**: Edit/delete folders and pages
2. **Drag-and-Drop**: Reorder and move items
3. **Page Icons by Blueprint**: Auto-select icon based on blueprint
4. **Folder Badges**: Show count of pages in folder
5. **Recent Pages**: Quick access to recently viewed pages
6. **Favorites/Pinned**: Pin important pages to top
7. **Keyboard Navigation**: Arrow keys to navigate tree
8. **Bulk Operations**: Select multiple items for actions
9. **Import/Export**: Save and restore catalog structure

## Testing

To test the implementation:

1. **Open the application** - The sidebar should load with search and New button
2. **Click "New" → "New folder"** - Modal should open
3. **Create a folder** with title "Services" and icon "📁"
4. **Click "New" → "New catalog page"** - Modal should open
5. **Create a page** attached to a blueprint, optionally in a folder
6. **Check sidebar** - New items should appear in CATALOG section
7. **Click folder** - Should expand/collapse
8. **Click page** - Should navigate to `/catalog/{pageId}`
9. **Type in search** - Should filter folders and pages
10. **Create nested folders** - Should show proper indentation

## Notes

- The sidebar automatically expands newly created folders
- Search is case-insensitive
- Empty states are handled gracefully (no CATALOG section if no data)
- Loading state prevents flickering on initial load
- Modals close automatically on successful creation
- API errors are caught and logged to console

## Dependencies

Required components (already implemented):
- `FolderCreationModal` from `src/components/catalog/`
- `PageCreationModal` from `src/components/catalog/`
- `catalogPageService` from `src/services/`
- `CatalogFolder` and `CatalogPage` types from `src/types/catalogPage`

## Routes to Add

To complete the integration, add this route:
```typescript
<Route path="/catalog/:pageId" element={<CatalogPageView />} />
```

The `CatalogPageView` component should:
- Load the page details by ID
- Load entities for the page's blueprint
- Display entities in the configured layout (table/grid/list)
- Apply any saved filters, columns, and sorting
