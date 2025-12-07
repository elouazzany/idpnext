import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

export interface JWTPayload {
    userId: string;
    email: string;
}

export class AuthService {
    // Generate JWT token
    static generateToken(userId: string, email: string): string {
        const payload: JWTPayload = { userId, email };
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    // Verify JWT token
    static verifyToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
        } catch (error) {
            return null;
        }
    }

    // Handle OAuth callback and setup
    static async handleOAuthCallback(user: any, invitationToken?: string) {
        let organization;
        let isNewUser = false;

        // Check if user has any organizations
        const existingMembership = await prisma.userOrganization.findFirst({
            where: { userId: user.id },
            include: { organization: true },
        });

        if (invitationToken) {
            // User has an invitation - add them to the invited organization
            const invitation = await prisma.invitation.findUnique({
                where: { token: invitationToken },
                include: { organization: true },
            });

            if (invitation && invitation.status === 'pending' && invitation.expiresAt > new Date()) {
                // Add user to organization
                await prisma.userOrganization.create({
                    data: {
                        userId: user.id,
                        organizationId: invitation.organizationId,
                        role: invitation.role,
                    },
                });

                // Mark invitation as accepted
                await prisma.invitation.update({
                    where: { id: invitation.id },
                    data: { status: 'accepted' },
                });

                organization = invitation.organization;

                // Grant access to all organization tenants with same role
                const tenants = await prisma.tenant.findMany({
                    where: { organizationId: invitation.organizationId },
                });

                for (const tenant of tenants) {
                    await prisma.userTenant.create({
                        data: {
                            userId: user.id,
                            tenantId: tenant.id,
                            role: invitation.role,
                        },
                    });
                }
            }
        } else if (!existingMembership) {
            // New user without invitation - mark as new user (org setup required)
            isNewUser = true;
            organization = null; // No organization yet
        } else {
            organization = existingMembership.organization;
        }

        // Get user with all relationships
        const userWithRelations = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                accounts: true,
                organizations: {
                    include: {
                        organization: {
                            include: {
                                tenants: true,
                            },
                        },
                    },
                },
                tenants: {
                    include: {
                        tenant: true,
                    },
                },
            },
        });

        // Generate JWT
        const token = this.generateToken(user.id, user.email);

        return {
            token,
            user: userWithRelations,
            organization,
            isNewUser,
        };
    }

    // Generate a unique slug from a string
    static generateSlug(text: string): string {
        const baseSlug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${baseSlug}-${randomSuffix}`;
    }

    // Get user profile with organizations and tenants
    static async getUserProfile(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: true,
                organizations: {
                    include: {
                        organization: {
                            include: {
                                tenants: true,
                            },
                        },
                    },
                },
                tenants: {
                    include: {
                        tenant: true,
                    },
                },
            },
        });
    }
}
