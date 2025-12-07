import { Router, Response } from 'express';
import { requireAuth, requireOrganization, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../config/db.js';
import { blueprintService } from '../services/blueprint.service.js';

const router = Router();

// List organization tenants
router.get(
    '/organization/:organizationId',
    requireAuth,
    requireOrganization,
    async (req: AuthRequest, res: Response) => {
        try {
            const tenants = await prisma.tenant.findMany({
                where: { organizationId: req.params.organizationId },
                include: {
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });

            res.json(tenants);
        } catch (error) {
            res.status(500).json({ error: 'Failed to list tenants' });
        }
    }
);

// Create tenant
router.post(
    '/organization/:organizationId',
    requireAuth,
    requireOrganization,
    async (req: AuthRequest, res: Response) => {
        try {
            const { name, slug, description } = req.body;

            if (!name || !slug) {
                return res.status(400).json({ error: 'Name and slug are required' });
            }

            const tenant = await prisma.tenant.create({
                data: {
                    name,
                    slug,
                    description,
                    organizationId: req.params.organizationId,
                },
            });

            // Grant creator access to the tenant
            await prisma.userTenant.create({
                data: {
                    userId: req.user.id,
                    tenantId: tenant.id,
                    role: 'owner',
                },
            });

            // Seed default blueprints for the new tenant
            console.log(`[TENANT ROUTES] Calling blueprint seeding for tenant ${tenant.id}, org ${tenant.organizationId}`);
            await blueprintService.seedDefaults(tenant.organizationId, tenant.id);
            console.log(`[TENANT ROUTES] Blueprint seeding completed`);

            res.status(201).json(tenant);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create tenant' });
        }
    }
);

// Get tenant details
router.get('/:tenantId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.params.tenantId },
            include: {
                organization: true,
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get tenant' });
    }
});

// Update tenant
router.patch('/:tenantId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { name, description } = req.body;

        const tenant = await prisma.tenant.update({
            where: { id: req.params.tenantId },
            data: { name, description },
        });

        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});

// Delete tenant
router.delete('/:tenantId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { tenantId } = req.params;

        // Check if tenant exists
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                users: true,
                blueprints: true,
            },
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Prevent deletion of default tenant
        if (tenant.isDefault) {
            return res.status(400).json({ error: 'Cannot delete the default tenant' });
        }

        // Delete all associated resources in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete entity history records for this tenant
            await tx.entityHistory.deleteMany({
                where: { tenantId },
            });

            // Delete entities for this tenant
            await tx.entity.deleteMany({
                where: { tenantId },
            });

            // Delete catalog pages for this tenant
            await tx.catalogPage.deleteMany({
                where: { tenantId },
            });

            // Delete catalog folders for this tenant
            await tx.catalogFolder.deleteMany({
                where: { tenantId },
            });

            // Delete the tenant (cascade will handle UserTenant and Blueprint records)
            await tx.tenant.delete({
                where: { id: tenantId },
            });
        });

        res.status(204).send();
    } catch (error) {
        console.error('Failed to delete tenant:', error);
        res.status(500).json({ error: 'Failed to delete tenant' });
    }
});

export default router;
