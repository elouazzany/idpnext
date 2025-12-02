import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { InvitationService } from '../services/invitation.service.js';

const router = Router();

// Create invitation
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { email, organizationId, role = 'member' } = req.body;

        if (!email || !organizationId) {
            return res.status(400).json({ error: 'Email and organization ID are required' });
        }

        const invitation = await InvitationService.createInvitation(
            email,
            organizationId,
            role,
            req.user.id
        );

        res.status(201).json(invitation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get invitation by token (public)
router.get('/:token', async (req: AuthRequest, res: Response) => {
    try {
        const invitation = await InvitationService.getInvitationByToken(req.params.token);
        res.json(invitation);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

// List organization invitations
router.get(
    '/organization/:organizationId',
    requireAuth,
    async (req: AuthRequest, res: Response) => {
        try {
            const invitations = await InvitationService.listOrganizationInvitations(
                req.params.organizationId
            );

            res.json(invitations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to list invitations' });
        }
    }
);

// Revoke invitation
router.delete('/:invitationId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        await InvitationService.revokeInvitation(req.params.invitationId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke invitation' });
    }
});

export default router;
