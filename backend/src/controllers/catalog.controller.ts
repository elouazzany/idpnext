import { Request, Response } from 'express';
import { catalogService } from '../services/catalog.service.js';

export class CatalogController {
    // ==================== FOLDER OPERATIONS ====================

    /**
     * GET /api/catalog/folders
     * Get all folders
     */
    async getAllFolders(req: Request, res: Response) {
        try {
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;

            const folders = await catalogService.getAllFolders(organizationId, tenantId);

            res.json({
                ok: true,
                folders
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/catalog/folders/tree
     * Get folder tree structure
     */
    async getFolderTree(req: Request, res: Response) {
        try {
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;

            const tree = await catalogService.getFolderTree(organizationId, tenantId);

            res.json({
                ok: true,
                tree
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/catalog/folders/:id
     * Get single folder
     */
    async getFolder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;

            const folder = await catalogService.getFolderById(id, organizationId, tenantId);

            if (!folder) {
                return res.status(404).json({
                    ok: false,
                    error: 'Folder not found'
                });
            }

            res.json({
                ok: true,
                folder
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /api/catalog/folders
     * Create folder
     */
    async createFolder(req: Request, res: Response) {
        try {
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;
            const userId = (req as any).user?.id;

            const folder = await catalogService.createFolder({
                ...req.body,
                createdBy: userId,
                organizationId,
                tenantId
            });

            res.status(201).json({
                ok: true,
                folder
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * PATCH /api/catalog/folders/:id
     * Update folder
     */
    async updateFolder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;
            const userId = (req as any).user?.id;

            const folder = await catalogService.updateFolder(
                id,
                {
                    ...req.body,
                    updatedBy: userId
                },
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                folder
            });
        } catch (error: any) {
            if (error.message === 'Folder not found') {
                return res.status(404).json({
                    ok: false,
                    error: error.message
                });
            }
            res.status(400).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * DELETE /api/catalog/folders/:id
     * Delete folder
     */
    async deleteFolder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { cascade } = req.query;
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;

            await catalogService.deleteFolder(
                id,
                organizationId,
                tenantId,
                cascade === 'true'
            );

            res.json({
                ok: true,
                message: 'Folder deleted successfully'
            });
        } catch (error: any) {
            if (error.message === 'Folder not found') {
                return res.status(404).json({
                    ok: false,
                    error: error.message
                });
            }
            res.status(400).json({
                ok: false,
                error: error.message
            });
        }
    }

    // ==================== PAGE OPERATIONS ====================

    /**
     * GET /api/catalog/pages
     * Get all pages
     */
    async getAllPages(req: Request, res: Response) {
        try {
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;
            const { blueprintId, folderId } = req.query;

            let pages;
            if (blueprintId) {
                pages = await catalogService.getPagesByBlueprint(
                    blueprintId as string,
                    organizationId,
                    tenantId
                );
            } else if (folderId) {
                pages = await catalogService.getPagesByFolder(
                    folderId as string,
                    organizationId,
                    tenantId
                );
            } else {
                pages = await catalogService.getAllPages(organizationId, tenantId);
            }

            res.json({
                ok: true,
                pages
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/catalog/pages/:id
     * Get single page
     */
    async getPage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;

            const page = await catalogService.getPageById(id, organizationId, tenantId);

            if (!page) {
                return res.status(404).json({
                    ok: false,
                    error: 'Page not found'
                });
            }

            res.json({
                ok: true,
                page
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /api/catalog/pages
     * Create page
     */
    async createPage(req: Request, res: Response) {
        try {
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;
            const userId = (req as any).user?.id;

            const page = await catalogService.createPage({
                ...req.body,
                createdBy: userId,
                organizationId,
                tenantId
            });

            res.status(201).json({
                ok: true,
                page
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * PATCH /api/catalog/pages/:id
     * Update page
     */
    async updatePage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;
            const userId = (req as any).user?.id;

            const page = await catalogService.updatePage(
                id,
                {
                    ...req.body,
                    updatedBy: userId
                },
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                page
            });
        } catch (error: any) {
            if (error.message === 'Page not found') {
                return res.status(404).json({
                    ok: false,
                    error: error.message
                });
            }
            res.status(400).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * DELETE /api/catalog/pages/:id
     * Delete page
     */
    async deletePage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;

            await catalogService.deletePage(id, organizationId, tenantId);

            res.json({
                ok: true,
                message: 'Page deleted successfully'
            });
        } catch (error: any) {
            if (error.message === 'Page not found') {
                return res.status(404).json({
                    ok: false,
                    error: error.message
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /api/catalog/reorder
     * Reorder folders or pages
     */
    async reorderItems(req: Request, res: Response) {
        try {
            const { items, type } = req.body;
            const organizationId = req.headers['x-organization-id'] as string;
            const tenantId = req.headers['x-tenant-id'] as string;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({
                    ok: false,
                    error: 'Invalid items array'
                });
            }

            if (type !== 'folder' && type !== 'page') {
                return res.status(400).json({
                    ok: false,
                    error: 'Type must be "folder" or "page"'
                });
            }

            await catalogService.reorderItems(items, type, organizationId, tenantId);

            res.json({
                ok: true,
                message: 'Items reordered successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }
}

export const catalogController = new CatalogController();
