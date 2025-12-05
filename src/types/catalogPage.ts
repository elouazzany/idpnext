// Catalog Page and Folder types

export interface CatalogFolder {
    id: string;
    title: string;
    description?: string;
    parentId?: string;
    parent?: CatalogFolder;
    children?: CatalogFolder[];
    pages?: CatalogPage[];
    order: number;
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    updatedBy?: string;
    organizationId: string;
    tenantId?: string;
}

export interface CatalogPage {
    id: string;
    title: string;
    icon?: string;
    description?: string;
    blueprintId: string;
    folderId?: string;
    folder?: CatalogFolder;
    layout: 'table' | 'grid' | 'list';
    filters: Record<string, any>;
    columns: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    order: number;
    isPublic: boolean;
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    updatedBy?: string;
    organizationId: string;
    tenantId?: string;
}

export interface CreateFolderData {
    title: string;
    description?: string;
    parentId?: string;
    order?: number;
}

export interface UpdateFolderData {
    title?: string;
    description?: string;
    parentId?: string;
    order?: number;
}

export interface CreatePageData {
    title: string;
    icon?: string;
    description?: string;
    blueprintId: string;
    folderId?: string;
    layout?: 'table' | 'grid' | 'list';
    filters?: Record<string, any>;
    columns?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    order?: number;
    isPublic?: boolean;
}

export interface UpdatePageData {
    title?: string;
    icon?: string;
    description?: string;
    blueprintId?: string;
    folderId?: string;
    layout?: 'table' | 'grid' | 'list';
    filters?: Record<string, any>;
    columns?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    order?: number;
    isPublic?: boolean;
}

export interface ReorderItem {
    id: string;
    order: number;
}

// API Response types
export interface FoldersResponse {
    ok: boolean;
    folders: CatalogFolder[];
}

export interface FolderTreeResponse {
    ok: boolean;
    tree: CatalogFolder[];
}

export interface FolderResponse {
    ok: boolean;
    folder: CatalogFolder;
}

export interface PagesResponse {
    ok: boolean;
    pages: CatalogPage[];
}

export interface PageResponse {
    ok: boolean;
    page: CatalogPage;
}

export interface MessageResponse {
    ok: boolean;
    message: string;
}
