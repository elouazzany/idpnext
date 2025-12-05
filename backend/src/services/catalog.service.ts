import { prisma } from '../config/db.js';

export interface CreateFolderData {
    title: string;
    description?: string;
    parentId?: string;
    order?: number;
    createdBy?: string;
    organizationId: string;
    tenantId?: string;
}

export interface UpdateFolderData {
    title?: string;
    description?: string;
    parentId?: string;
    order?: number;
    updatedBy?: string;
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
    createdBy?: string;
    organizationId: string;
    tenantId?: string;
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
    updatedBy?: string;
}

export class CatalogService {
    // ==================== FOLDER OPERATIONS ====================

    /**
     * Get all folders in organization/tenant
     */
    async getAllFolders(organizationId: string, tenantId?: string) {
        const where: any = { organizationId };
        if (tenantId) where.tenantId = tenantId;

        return prisma.catalogFolder.findMany({
            where,
            include: {
                parent: true,
                children: true,
                pages: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });
    }

    /**
     * Get folder tree structure
     */
    async getFolderTree(organizationId: string, tenantId?: string) {
        const where: any = { organizationId, parentId: null };
        if (tenantId) where.tenantId = tenantId;

        return prisma.catalogFolder.findMany({
            where,
            include: {
                children: {
                    include: {
                        children: {
                            include: {
                                children: true,
                                pages: { orderBy: { order: 'asc' } }
                            }
                        },
                        pages: { orderBy: { order: 'asc' } }
                    },
                    orderBy: { order: 'asc' }
                },
                pages: { orderBy: { order: 'asc' } }
            },
            orderBy: { order: 'asc' }
        });
    }

    /**
     * Get single folder by ID
     */
    async getFolderById(id: string, organizationId: string, tenantId?: string) {
        const where: any = { id, organizationId };
        if (tenantId) where.tenantId = tenantId;

        return prisma.catalogFolder.findFirst({
            where,
            include: {
                parent: true,
                children: {
                    orderBy: { order: 'asc' }
                },
                pages: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }

    /**
     * Create a folder
     */
    async createFolder(data: CreateFolderData) {
        const {
            title,
            description,
            parentId,
            order = 0,
            createdBy,
            organizationId,
            tenantId
        } = data;

        // Verify parent exists if parentId is provided
        if (parentId) {
            const parent = await this.getFolderById(parentId, organizationId, tenantId);
            if (!parent) {
                throw new Error('Parent folder not found');
            }
        }

        return prisma.catalogFolder.create({
            data: {
                title,
                description,
                parentId,
                order,
                createdBy,
                organizationId,
                tenantId
            },
            include: {
                parent: true,
                children: true,
                pages: true
            }
        });
    }

    /**
     * Update a folder
     */
    async updateFolder(
        id: string,
        data: UpdateFolderData,
        organizationId: string,
        tenantId?: string
    ) {
        const folder = await this.getFolderById(id, organizationId, tenantId);
        if (!folder) {
            throw new Error('Folder not found');
        }

        // Prevent circular references
        if (data.parentId) {
            if (data.parentId === id) {
                throw new Error('A folder cannot be its own parent');
            }

            // Check if new parent is a descendant
            const isDescendant = await this.isDescendant(id, data.parentId, organizationId, tenantId);
            if (isDescendant) {
                throw new Error('Cannot move folder to its own descendant');
            }
        }

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.parentId !== undefined) updateData.parentId = data.parentId;
        if (data.order !== undefined) updateData.order = data.order;
        if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

        return prisma.catalogFolder.update({
            where: { id },
            data: updateData,
            include: {
                parent: true,
                children: true,
                pages: true
            }
        });
    }

    /**
     * Delete a folder (and optionally its children)
     */
    async deleteFolder(
        id: string,
        organizationId: string,
        tenantId?: string,
        cascade: boolean = false
    ) {
        const folder = await this.getFolderById(id, organizationId, tenantId);
        if (!folder) {
            throw new Error('Folder not found');
        }

        if (!cascade && (folder.children.length > 0 || folder.pages.length > 0)) {
            throw new Error('Folder contains children or pages. Use cascade=true to delete.');
        }

        // If cascade, move children to parent or root
        if (cascade && folder.children.length > 0) {
            await prisma.catalogFolder.updateMany({
                where: { parentId: id },
                data: { parentId: folder.parentId }
            });
        }

        // If cascade, move pages to root (no folder)
        if (cascade && folder.pages.length > 0) {
            await prisma.catalogPage.updateMany({
                where: { folderId: id },
                data: { folderId: null }
            });
        }

        return prisma.catalogFolder.delete({
            where: { id }
        });
    }

    /**
     * Check if folderId is a descendant of ancestorId
     */
    private async isDescendant(
        ancestorId: string,
        folderId: string,
        organizationId: string,
        tenantId?: string
    ): Promise<boolean> {
        const folder = await this.getFolderById(folderId, organizationId, tenantId);
        if (!folder) return false;
        if (!folder.parentId) return false;
        if (folder.parentId === ancestorId) return true;
        return this.isDescendant(ancestorId, folder.parentId, organizationId, tenantId);
    }

    // ==================== PAGE OPERATIONS ====================

    /**
     * Get all pages in organization/tenant
     */
    async getAllPages(organizationId: string, tenantId?: string) {
        const where: any = { organizationId };
        if (tenantId) where.tenantId = tenantId;

        return prisma.catalogPage.findMany({
            where,
            include: {
                folder: true
            },
            orderBy: { order: 'asc' }
        });
    }

    /**
     * Get pages by blueprint
     */
    async getPagesByBlueprint(
        blueprintId: string,
        organizationId: string,
        tenantId?: string
    ) {
        const where: any = { blueprintId, organizationId };
        if (tenantId) where.tenantId = tenantId;

        return prisma.catalogPage.findMany({
            where,
            include: {
                folder: true
            },
            orderBy: { order: 'asc' }
        });
    }

    /**
     * Get pages in folder
     */
    async getPagesByFolder(
        folderId: string,
        organizationId: string,
        tenantId?: string
    ) {
        const where: any = { folderId, organizationId };
        if (tenantId) where.tenantId = tenantId;

        return prisma.catalogPage.findMany({
            where,
            include: {
                folder: true
            },
            orderBy: { order: 'asc' }
        });
    }

    /**
     * Get single page by ID
     */
    async getPageById(id: string, organizationId: string, tenantId?: string) {
        const where: any = { id, organizationId };
        if (tenantId) where.tenantId = tenantId;

        return prisma.catalogPage.findFirst({
            where,
            include: {
                folder: true
            }
        });
    }

    /**
     * Create a page
     */
    async createPage(data: CreatePageData) {
        const {
            title,
            icon,
            description,
            blueprintId,
            folderId,
            layout = 'table',
            filters = {},
            columns = [],
            sortBy,
            sortOrder,
            order = 0,
            isPublic = true,
            createdBy,
            organizationId,
            tenantId
        } = data;

        // Verify folder exists if folderId is provided
        if (folderId) {
            const folder = await this.getFolderById(folderId, organizationId, tenantId);
            if (!folder) {
                throw new Error('Folder not found');
            }
        }

        return prisma.catalogPage.create({
            data: {
                title,
                icon,
                description,
                blueprintId,
                folderId,
                layout,
                filters,
                columns,
                sortBy,
                sortOrder,
                order,
                isPublic,
                createdBy,
                organizationId,
                tenantId
            },
            include: {
                folder: true
            }
        });
    }

    /**
     * Update a page
     */
    async updatePage(
        id: string,
        data: UpdatePageData,
        organizationId: string,
        tenantId?: string
    ) {
        const page = await this.getPageById(id, organizationId, tenantId);
        if (!page) {
            throw new Error('Page not found');
        }

        // Verify folder exists if folderId is provided
        if (data.folderId) {
            const folder = await this.getFolderById(data.folderId, organizationId, tenantId);
            if (!folder) {
                throw new Error('Folder not found');
            }
        }

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.blueprintId !== undefined) updateData.blueprintId = data.blueprintId;
        if (data.folderId !== undefined) updateData.folderId = data.folderId;
        if (data.layout !== undefined) updateData.layout = data.layout;
        if (data.filters !== undefined) updateData.filters = data.filters;
        if (data.columns !== undefined) updateData.columns = data.columns;
        if (data.sortBy !== undefined) updateData.sortBy = data.sortBy;
        if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
        if (data.order !== undefined) updateData.order = data.order;
        if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
        if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

        return prisma.catalogPage.update({
            where: { id },
            data: updateData,
            include: {
                folder: true
            }
        });
    }

    /**
     * Delete a page
     */
    async deletePage(id: string, organizationId: string, tenantId?: string) {
        const page = await this.getPageById(id, organizationId, tenantId);
        if (!page) {
            throw new Error('Page not found');
        }

        return prisma.catalogPage.delete({
            where: { id }
        });
    }

    /**
     * Reorder items (folders or pages)
     */
    async reorderItems(
        items: Array<{ id: string; order: number }>,
        type: 'folder' | 'page',
        organizationId: string,
        tenantId?: string
    ) {
        const updates = items.map(item => {
            if (type === 'folder') {
                return prisma.catalogFolder.update({
                    where: { id: item.id },
                    data: { order: item.order }
                });
            } else {
                return prisma.catalogPage.update({
                    where: { id: item.id },
                    data: { order: item.order }
                });
            }
        });

        return prisma.$transaction(updates);
    }
}

export const catalogService = new CatalogService();
