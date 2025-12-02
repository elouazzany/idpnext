import { Router, Response } from 'express';
import { requireAuth, requireOrganization, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../config/db.js';

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

export default router;
