import { Router, Response } from 'express';
import { requireAuth, requireOrganization, requireRole, AuthRequest } from '../middleware/auth.js';
import { OrganizationService } from '../services/organization.service.js';

const router = Router();

// Get organization
router.get(
    '/:organizationId',
    requireAuth,
    requireOrganization,
    async (req: AuthRequest, res: Response) => {
        try {
            const organization = await OrganizationService.getOrganization(req.params.organizationId);
            res.json(organization);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get organization' });
        }
    }
);

// Create organization
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { name, slug } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Organization name is required' });
        }

        const organization = await OrganizationService.createOrganization(
            name,
            req.user.id,
            slug
        );

        res.status(201).json(organization);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update organization
router.patch(
    '/:organizationId',
    requireAuth,
    requireOrganization,
    requireRole(['owner', 'admin']),
    async (req: AuthRequest, res: Response) => {
        try {
            const { name, logoUrl, settings } = req.body;

            const organization = await OrganizationService.updateOrganization(
                req.params.organizationId,
                { name, logoUrl, settings }
            );

            res.json(organization);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update organization' });
        }
    }
);

// List organization members
router.get(
    '/:organizationId/members',
    requireAuth,
    requireOrganization,
    async (req: AuthRequest, res: Response) => {
        try {
            const members = await OrganizationService.listMembers(req.params.organizationId);
            res.json(members);
        } catch (error) {
            res.status(500).json({ error: 'Failed to list members' });
        }
    }
);

// Update member role
router.patch(
    '/:organizationId/members/:userId',
    requireAuth,
    requireOrganization,
    requireRole(['owner', 'admin']),
    async (req: AuthRequest, res: Response) => {
        try {
            const { role } = req.body;

            if (!role) {
                return res.status(400).json({ error: 'Role is required' });
            }

            const membership = await OrganizationService.updateMemberRole(
                req.params.organizationId,
                req.params.userId,
                role
            );

            res.json(membership);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update member role' });
        }
    }
);

// Remove member from organization
router.delete(
    '/:organizationId/members/:userId',
    requireAuth,
    requireOrganization,
    requireRole(['owner', 'admin']),
    async (req: AuthRequest, res: Response) => {
        try {
            await OrganizationService.removeMember(
                req.params.organizationId,
                req.params.userId
            );

            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

export default router;
