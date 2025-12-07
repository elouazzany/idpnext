import { prisma } from '../config/db.js';
import { blueprintService } from './blueprint.service.js';

export class OrganizationService {
    // Get organization by ID
    static async getOrganization(organizationId: string) {
        return prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                tenants: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // Create organization
    static async createOrganization(name: string, ownerId: string, slug?: string) {
        // Generate slug if not provided
        const orgSlug = slug || this.generateSlug(name);

        // Check if slug is already taken
        const existing = await prisma.organization.findUnique({
            where: { slug: orgSlug },
        });

        if (existing) {
            throw new Error('Organization slug already exists');
        }

        const organization = await prisma.organization.create({
            data: {
                name,
                slug: orgSlug,
                members: {
                    create: {
                        userId: ownerId,
                        role: 'owner',
                    },
                },
                tenants: {
                    create: {
                        name: 'Default',
                        slug: 'default',
                        description: 'Default tenant',
                        isDefault: true,
                    },
                },
            },
            include: {
                tenants: true,
                members: true,
            },
        });

        // Grant owner access to the default tenant
        if (organization.tenants[0]) {
            await prisma.userTenant.create({
                data: {
                    userId: ownerId,
                    tenantId: organization.tenants[0].id,
                    role: 'owner',
                },
            });

            // Seed default blueprints for the new tenant
            console.log(`[ORG SERVICE] Calling blueprint seeding for organization ${organization.id}, tenant ${organization.tenants[0].id}`);
            await blueprintService.seedDefaults(organization.id, organization.tenants[0].id);
            console.log(`[ORG SERVICE] Blueprint seeding completed`);
        }

        return organization;
    }

    // Update organization
    static async updateOrganization(
        organizationId: string,
        data: { name?: string; logoUrl?: string; settings?: any }
    ) {
        return prisma.organization.update({
            where: { id: organizationId },
            data,
        });
    }

    // Add member to organization
    static async addMember(organizationId: string, userId: string, role: string = 'member') {
        // Check if already a member
        const existing = await prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (existing) {
            throw new Error('User is already a member');
        }

        // Add to organization
        const membership = await prisma.userOrganization.create({
            data: {
                userId,
                organizationId,
                role,
            },
        });

        // Grant access to all tenants
        const tenants = await prisma.tenant.findMany({
            where: { organizationId },
        });

        for (const tenant of tenants) {
            await prisma.userTenant.create({
                data: {
                    userId,
                    tenantId: tenant.id,
                    role,
                },
            });
        }

        return membership;
    }

    // Remove member from organization
    static async removeMember(organizationId: string, userId: string) {
        // Don't allow removing the only owner
        const owners = await prisma.userOrganization.count({
            where: { organizationId, role: 'owner' },
        });

        const userMembership = await prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (userMembership?.role === 'owner' && owners === 1) {
            throw new Error('Cannot remove the only owner from the organization');
        }

        // Remove tenant access
        const tenants = await prisma.tenant.findMany({
            where: { organizationId },
            select: { id: true },
        });

        for (const tenant of tenants) {
            await prisma.userTenant.deleteMany({
                where: {
                    userId,
                    tenantId: tenant.id,
                },
            });
        }

        // Remove from organization
        return prisma.userOrganization.delete({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });
    }

    // Update member role
    static async updateMemberRole(organizationId: string, userId: string, role: string) {
        return prisma.userOrganization.update({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
            data: { role },
        });
    }

    // List organization members
    static async listMembers(organizationId: string) {
        const members = await prisma.userOrganization.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return members;
    }

    // Generate slug from name
    private static generateSlug(name: string): string {
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${baseSlug}-${randomSuffix}`;
    }
}
