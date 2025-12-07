import { prisma } from '../config/db.js';
import { randomBytes } from 'crypto';

export class InvitationService {
    // Create an invitation
    static async createInvitation(
        email: string,
        organizationId: string,
        role: string,
        createdById: string
    ) {
        // Check if user is already a member
        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: {
                organizations: {
                    where: { organizationId },
                },
            },
        });

        if (existingUser?.organizations && existingUser.organizations.length > 0) {
            throw new Error('User is already a member of this organization');
        }

        // Check for existing pending invitation
        const existingInvitation = await prisma.invitation.findFirst({
            where: {
                email,
                organizationId,
                status: 'pending',
                expiresAt: { gt: new Date() },
            },
        });

        if (existingInvitation) {
            return existingInvitation;
        }

        // Generate unique token
        const token = randomBytes(32).toString('hex');

        // Create invitation with 7-day expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await prisma.invitation.create({
            data: {
                email,
                organizationId,
                role,
                token,
                expiresAt,
                createdById,
            },
            include: {
                organization: true,
                createdBy: true,
            },
        });

        // TODO: Send email with invitation link
        // await this.sendInvitationEmail(invitation);

        return invitation;
    }

    // Get invitation by token
    static async getInvitationByToken(token: string) {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: {
                organization: true,
                createdBy: true,
            },
        });

        if (!invitation) {
            throw new Error('Invitation not found');
        }

        if (invitation.status !== 'pending') {
            throw new Error('Invitation has already been used');
        }

        if (invitation.expiresAt < new Date()) {
            await prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'expired' },
            });
            throw new Error('Invitation has expired');
        }

        return invitation;
    }

    // Accept invitation (called during OAuth flow)
    static async acceptInvitation(token: string, userId: string) {
        const invitation = await this.getInvitationByToken(token);

        // Add user to organization
        const membership = await prisma.userOrganization.create({
            data: {
                userId,
                organizationId: invitation.organizationId,
                role: invitation.role,
            },
        });

        // Grant access to all organization tenants
        const tenants = await prisma.tenant.findMany({
            where: { organizationId: invitation.organizationId },
        });

        for (const tenant of tenants) {
            await prisma.userTenant.create({
                data: {
                    userId,
                    tenantId: tenant.id,
                    role: invitation.role,
                },
            });
        }

        // Mark invitation as accepted
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'accepted' },
        });

        return membership;
    }

    // Revoke invitation
    static async revokeInvitation(invitationId: string) {
        return prisma.invitation.update({
            where: { id: invitationId },
            data: { status: 'revoked' },
        });
    }

    // List organization invitations
    static async listOrganizationInvitations(organizationId: string) {
        return prisma.invitation.findMany({
            where: { organizationId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // TODO: Send invitation email
    private static async sendInvitationEmail(invitation: any) {
        // Implement email sending logic here
        // Use nodemailer or similar service
        console.log(`Invitation email would be sent to ${invitation.email}`);
        console.log(`Invitation link: ${process.env.FRONTEND_URL}/invitations/${invitation.token}`);
    }
}
