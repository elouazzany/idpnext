# Catalog Page and Folder Implementation

## Overview
This document describes the complete implementation of the catalog management system, which allows users to organize their data model pages into hierarchical folders.

## Features Implemented

### 1. Hierarchical Folder Structure
- **Unlimited Nesting**: Folders can contain sub-folders with no depth limit
- **Parent-Child Relationships**: Each folder can have a parent folder
- **Circular Reference Prevention**: System prevents folders from being their own parent or descendant
- **Cascade Operations**: Option to cascade delete folders and their children

### 2. Catalog Pages
- **Blueprint Association**: Each page is attached to a specific blueprint
- **Folder Organization**: Pages can be placed in folders or at root level
- **Multiple Layouts**: Support for table, grid, and list views
- **Customizable Views**: Configurable filters, columns, and sorting
- **Public/Private**: Pages can be public or private

### 3. Database Schema

#### CatalogFolder Model
```prisma
model CatalogFolder {
  id             String   @id @default(cuid())
  title          String
  icon           String?
  description    String?
  parentId       String?
  parent         CatalogFolder?  @relation("FolderHierarchy")
  children       CatalogFolder[] @relation("FolderHierarchy")
  order          Int      @default(0)
  pages          CatalogPage[]
  createdAt      DateTime @default(now())
  createdBy      String?
  updatedAt      DateTime @updatedAt
  updatedBy      String?
  organizationId String
  tenantId       String?
}
```

#### CatalogPage Model
```prisma
model CatalogPage {
  id             String   @id @default(cuid())
  title          String
  icon           String?
  description    String?
  blueprintId    String
  folderId       String?
  folder         CatalogFolder?
  layout         String   @default("table") // "table", "grid", "list"
  filters        Json     @default("{}")
  columns        Json     @default("[]")
  sortBy         String?
  sortOrder      String?  // "asc" or "desc"
  order          Int      @default(0)
  isPublic       Boolean  @default(true)
  createdAt      DateTime @default(now())
  createdBy      String?
  updatedAt      DateTime @updatedAt
  updatedBy      String?
  organizationId String
  tenantId       String?
}
```

## API Endpoints

### Folder Operations

#### Get All Folders
```
GET /api/catalog/folders
```
Returns all folders with their children and pages.

#### Get Folder Tree
```
GET /api/catalog/folders/tree
```
Returns folders in a hierarchical tree structure (only root folders with nested children).

#### Get Single Folder
```
GET /api/catalog/folders/:id
```
Returns a specific folder with its parent, children, and pages.

#### Create Folder
```
POST /api/catalog/folders
Body: {
  title: string,
  icon?: string,
  description?: string,
  parentId?: string,
  order?: number
}
```

#### Update Folder
```
PATCH /api/catalog/folders/:id
Body: {
  title?: string,
  icon?: string,
  description?: string,
  parentId?: string,
  order?: number
}
```

#### Delete Folder
```
DELETE /api/catalog/folders/:id?cascade=true|false
```
- `cascade=false`: Fails if folder contains children or pages
- `cascade=true`: Moves children to parent, pages to root

### Page Operations

#### Get All Pages
```
GET /api/catalog/pages?blueprintId=xxx&folderId=xxx
```
Query parameters:
- `blueprintId`: Filter pages by blueprint
- `folderId`: Filter pages by folder

#### Get Single Page
```
GET /api/catalog/pages/:id
```

#### Create Page
```
POST /api/catalog/pages
Body: {
  title: string,
  icon?: string,
  description?: string,
  blueprintId: string,
  folderId?: string,
  layout?: "table" | "grid" | "list",
  filters?: object,
  columns?: string[],
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  order?: number,
  isPublic?: boolean
}
```

#### Update Page
```
PATCH /api/catalog/pages/:id
Body: {
  title?: string,
  icon?: string,
  description?: string,
  blueprintId?: string,
  folderId?: string,
  layout?: "table" | "grid" | "list",
  filters?: object,
  columns?: string[],
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  order?: number,
  isPublic?: boolean
}
```

#### Delete Page
```
DELETE /api/catalog/pages/:id
```

### Utility Operations

#### Reorder Items
```
POST /api/catalog/reorder
Body: {
  items: [{ id: string, order: number }],
  type: "folder" | "page"
}
```

## Frontend Components

### CatalogManagementPage
Main page for managing folders and pages.

**Features:**
- Tree view of folders and pages
- Create, edit, delete folders and pages
- Drag-and-drop reordering (UI prepared)
- Nested folder visualization with indentation
- Icon and description display

**Location:** `src/components/catalog/CatalogManagementPage.tsx`

### FolderCreationModal
Modal for creating new folders.

**Features:**
- Title, icon, description fields
- Parent folder selection
- Prevents circular references
- Real-time validation

**Location:** `src/components/catalog/FolderCreationModal.tsx`

### PageCreationModal
Modal for creating new pages.

**Features:**
- Title, icon, description fields
- Blueprint selection (required)
- Folder selection (optional)
- Layout selection (table, grid, list)
- Public/private toggle

**Location:** `src/components/catalog/PageCreationModal.tsx`

### FolderEditModal
Modal for editing existing folders.

**Features:**
- All creation features
- Pre-filled with current values
- Prevents moving folder to its own descendant

**Location:** `src/components/catalog/FolderEditModal.tsx`

### PageEditModal
Modal for editing existing pages.

**Features:**
- All creation features
- Pre-filled with current values
- Can change blueprint

**Location:** `src/components/catalog/PageEditModal.tsx`

## Frontend Services

### CatalogPageService
TypeScript service for all catalog operations.

**Methods:**
- `getAllFolders()`: Get all folders
- `getFolderTree()`: Get folder tree structure
- `getFolder(id)`: Get single folder
- `createFolder(data)`: Create folder
- `updateFolder(id, data)`: Update folder
- `deleteFolder(id, cascade)`: Delete folder
- `getAllPages(filters)`: Get all pages
- `getPagesByBlueprint(blueprintId)`: Get pages by blueprint
- `getPagesByFolder(folderId)`: Get pages in folder
- `getPage(id)`: Get single page
- `createPage(data)`: Create page
- `updatePage(id, data)`: Update page
- `deletePage(id)`: Delete page
- `reorderItems(items, type)`: Reorder folders or pages

**Location:** `src/services/catalogPage.service.ts`

## Type Definitions

Complete TypeScript types for all catalog operations.

**Location:** `src/types/catalogPage.ts`

**Key Types:**
- `CatalogFolder`: Folder with nested structure
- `CatalogPage`: Page with configuration
- `CreateFolderData`: Folder creation data
- `UpdateFolderData`: Folder update data
- `CreatePageData`: Page creation data
- `UpdatePageData`: Page update data
- `ReorderItem`: Item reordering data

## Usage Examples

### Creating a Folder Structure
```typescript
import catalogPageService from './services/catalogPage.service';

// Create root folder
const rootFolder = await catalogPageService.createFolder({
  title: 'Services',
  icon: '🚀',
  description: 'All microservices'
});

// Create sub-folder
const subFolder = await catalogPageService.createFolder({
  title: 'Backend Services',
  icon: '⚙️',
  parentId: rootFolder.folder.id
});
```

### Creating a Page
```typescript
// Create a page in a folder
const page = await catalogPageService.createPage({
  title: 'Microservices Catalog',
  icon: '📦',
  description: 'All our microservices',
  blueprintId: 'microservice',
  folderId: subFolder.folder.id,
  layout: 'table',
  isPublic: true
});
```

### Getting Folder Tree
```typescript
// Get full folder tree with nested children
const tree = await catalogPageService.getFolderTree();

tree.tree.forEach(folder => {
  console.log(folder.title);
  folder.children?.forEach(child => {
    console.log(`  - ${child.title}`);
  });
});
```

### Filtering Pages
```typescript
// Get all pages for a blueprint
const pages = await catalogPageService.getPagesByBlueprint('microservice');

// Get all pages in a folder
const folderPages = await catalogPageService.getPagesByFolder(folderId);
```

## Multi-tenancy Support

All catalog operations respect multi-tenancy:
- Folders and pages are isolated by `organizationId` and `tenantId`
- Automatic filtering based on authenticated user's context
- Users can only see/modify their organization's catalog

## Security Features

1. **Authentication**: All routes protected by `requireAuth` middleware
2. **Multi-tenancy**: Automatic filtering prevents cross-tenant access
3. **Circular Reference Prevention**: Cannot create circular folder references
4. **Cascade Protection**: Must explicitly enable cascade delete

## UI/UX Features

1. **Visual Hierarchy**: Indented tree view with icons
2. **Inline Actions**: Edit and delete buttons on each item
3. **Modals**: Clean modal dialogs for all operations
4. **Loading States**: Loading indicators during async operations
5. **Error Handling**: User-friendly error messages
6. **Empty States**: Helpful empty states with call-to-action

## Future Enhancements

Potential improvements:
1. **Drag-and-Drop**: Reorder folders and pages with drag-and-drop
2. **Bulk Operations**: Select and operate on multiple items
3. **Search**: Search folders and pages by name
4. **Favorites**: Pin important pages to quick access
5. **Permissions**: Fine-grained permissions per folder/page
6. **Templates**: Page templates for common layouts
7. **Export/Import**: Export catalog structure as JSON
8. **History**: Track changes to folder/page structure
9. **Breadcrumbs**: Navigation breadcrumbs for deep folders
10. **Icons Library**: Built-in icon picker with categories

## Files Created/Modified

### Backend
- `backend/prisma/schema.prisma` - Added CatalogFolder and CatalogPage models
- `backend/src/services/catalog.service.ts` - Catalog business logic
- `backend/src/controllers/catalog.controller.ts` - HTTP controllers
- `backend/src/routes/catalog.routes.ts` - API routes
- `backend/src/server.ts` - Registered catalog routes

### Frontend
- `src/types/catalogPage.ts` - TypeScript type definitions
- `src/services/catalogPage.service.ts` - Frontend API service
- `src/components/catalog/CatalogManagementPage.tsx` - Main management page
- `src/components/catalog/FolderCreationModal.tsx` - Folder creation modal
- `src/components/catalog/PageCreationModal.tsx` - Page creation modal
- `src/components/catalog/FolderEditModal.tsx` - Folder edit modal
- `src/components/catalog/PageEditModal.tsx` - Page edit modal

### Database
- Migration: `20251203204701_add_catalog_pages_and_folders`

## Integration with Existing System

The catalog system integrates seamlessly with:
1. **Blueprint System**: Pages are attached to blueprints
2. **Entity System**: Pages display entities from their blueprint
3. **Multi-tenancy**: Respects organization and tenant boundaries
4. **Authentication**: Protected by existing auth middleware
5. **Audit System**: Can be extended to log catalog changes

## Testing

To test the catalog system:

1. Navigate to the catalog management page
2. Create a root folder
3. Create sub-folders within the root folder
4. Create pages attached to blueprints
5. Move pages between folders
6. Edit folder and page properties
7. Delete folders (with and without cascade)
8. Verify multi-tenancy isolation

## Next Steps

1. Add routing to access the CatalogManagementPage component
2. Implement the actual entity display on catalog pages
3. Add drag-and-drop reordering functionality
4. Implement page view rendering (table, grid, list layouts)
5. Add search and filtering capabilities
6. Implement permissions system
7. Add audit logging for catalog changes
