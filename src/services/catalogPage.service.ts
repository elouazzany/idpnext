import { getAuthHeader } from '../utils/auth';
import {
    CreateFolderData,
    UpdateFolderData,
    CreatePageData,
    UpdatePageData,
    ReorderItem,
    FoldersResponse,
    FolderTreeResponse,
    FolderResponse,
    PagesResponse,
    PageResponse,
    MessageResponse
} from '../types/catalogPage';

const API_BASE = '/api';

/**
 * Catalog Page Service - manages catalog pages and folders
 */
class CatalogPageService {
    // ==================== FOLDER OPERATIONS ====================

    /**
     * Get all folders
     * GET /api/catalog/folders
     */
    async getAllFolders(): Promise<FoldersResponse> {
        const response = await fetch(`${API_BASE}/catalog/folders`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch folders');
        return response.json();
    }

    /**
     * Get folder tree structure
     * GET /api/catalog/folders/tree
     */
    async getFolderTree(): Promise<FolderTreeResponse> {
        const response = await fetch(`${API_BASE}/catalog/folders/tree`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch folder tree');
        return response.json();
    }

    /**
     * Get single folder by ID
     * GET /api/catalog/folders/:id
     */
    async getFolder(id: string): Promise<FolderResponse> {
        const response = await fetch(`${API_BASE}/catalog/folders/${id}`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch folder');
        return response.json();
    }

    /**
     * Create a folder
     * POST /api/catalog/folders
     */
    async createFolder(data: CreateFolderData): Promise<FolderResponse> {
        const response = await fetch(`${API_BASE}/catalog/folders`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create folder');
        return response.json();
    }

    /**
     * Update a folder
     * PATCH /api/catalog/folders/:id
     */
    async updateFolder(id: string, data: UpdateFolderData): Promise<FolderResponse> {
        const response = await fetch(`${API_BASE}/catalog/folders/${id}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update folder');
        return response.json();
    }

    /**
     * Delete a folder
     * DELETE /api/catalog/folders/:id
     */
    async deleteFolder(id: string, cascade: boolean = false): Promise<MessageResponse> {
        const response = await fetch(`${API_BASE}/catalog/folders/${id}?cascade=${cascade}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to delete folder');
        return response.json();
    }

    // ==================== PAGE OPERATIONS ====================

    /**
     * Get all pages (optionally filtered)
     * GET /api/catalog/pages
     */
    async getAllPages(filters?: {
        blueprintId?: string;
        folderId?: string;
    }): Promise<PagesResponse> {
        const params = new URLSearchParams();
        if (filters?.blueprintId) params.append('blueprintId', filters.blueprintId);
        if (filters?.folderId) params.append('folderId', filters.folderId);

        const queryString = params.toString();
        const url = `${API_BASE}/catalog/pages${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch pages');
        return response.json();
    }

    /**
     * Get pages by blueprint
     * GET /api/catalog/pages?blueprintId=:id
     */
    async getPagesByBlueprint(blueprintId: string): Promise<PagesResponse> {
        return this.getAllPages({ blueprintId });
    }

    /**
     * Get pages in folder
     * GET /api/catalog/pages?folderId=:id
     */
    async getPagesByFolder(folderId: string): Promise<PagesResponse> {
        return this.getAllPages({ folderId });
    }

    /**
     * Get single page by ID
     * GET /api/catalog/pages/:id
     */
    async getPage(id: string): Promise<PageResponse> {
        const response = await fetch(`${API_BASE}/catalog/pages/${id}`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to fetch page');
        return response.json();
    }

    /**
     * Create a page
     * POST /api/catalog/pages
     */
    async createPage(data: CreatePageData): Promise<PageResponse> {
        const response = await fetch(`${API_BASE}/catalog/pages`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create page');
        return response.json();
    }

    /**
     * Update a page
     * PATCH /api/catalog/pages/:id
     */
    async updatePage(id: string, data: UpdatePageData): Promise<PageResponse> {
        const response = await fetch(`${API_BASE}/catalog/pages/${id}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update page');
        return response.json();
    }

    /**
     * Delete a page
     * DELETE /api/catalog/pages/:id
     */
    async deletePage(id: string): Promise<MessageResponse> {
        const response = await fetch(`${API_BASE}/catalog/pages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Failed to delete page');
        return response.json();
    }

    // ==================== UTILITY OPERATIONS ====================

    /**
     * Reorder folders or pages
     * POST /api/catalog/reorder
     */
    async reorderItems(
        items: ReorderItem[],
        type: 'folder' | 'page'
    ): Promise<MessageResponse> {
        const response = await fetch(`${API_BASE}/catalog/reorder`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items, type })
        });
        if (!response.ok) throw new Error('Failed to reorder items');
        return response.json();
    }

    /**
     * Move a page to a different folder
     * PATCH /api/catalog/pages/:id
     */
    async movePageToFolder(pageId: string, folderId: string | null): Promise<PageResponse> {
        return this.updatePage(pageId, { folderId });
    }

    /**
     * Move a folder to a different parent
     * PATCH /api/catalog/folders/:id
     */
    async moveFolderToParent(folderId: string, parentId: string | null): Promise<FolderResponse> {
        return this.updateFolder(folderId, { parentId });
    }
}

export const catalogPageService = new CatalogPageService();
export default catalogPageService;
