import { prisma } from '../config/db.js';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

export interface AuditLogFilters {
    organizationId?: string;
    userId?: string;
    identifier?: string;
    blueprint?: string;
    entity?: string;
    resourceType?: string | string[];
    action?: string | string[];
    actionType?: string | string[];
    status?: string | string[];
    startDate?: Date;
    endDate?: Date;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
}

export interface CreateAuditLogData {
    action: string;
    resourceType: string;
    status: string;
    message?: string;
    triggeredBy: {
        appId?: string;
        userId?: string;
        orgId?: string;
    };
    origin: string;
    context?: Record<string, any>;
    additionalData?: Record<string, any>;
    organizationId?: string;
    userId?: string;
}

export class AuditLogService {
    /**
     * Create a new audit log entry
     */
    async create(data: CreateAuditLogData) {
        const identifier = `event_${randomUUID()}`;

        return prisma.auditLog.create({
            data: {
                identifier,
                action: data.action,
                resourceType: data.resourceType,
                status: data.status,
                message: data.message,
                triggeredBy: data.triggeredBy,
                origin: data.origin,
                context: data.context || {},
                additionalData: data.additionalData || {},
                organizationId: data.organizationId,
                userId: data.userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            }
        });
    }

    /**
     * Get audit logs with filtering and pagination
     */
    async getAll(filters: AuditLogFilters) {
        const {
            organizationId,
            userId,
            identifier,
            blueprint,
            entity,
            resourceType,
            action,
            actionType,
            status,
            startDate,
            endDate,
            from,
            to,
            limit = 1000,
            offset = 0
        } = filters;

        const where: Prisma.AuditLogWhereInput = {};

        if (organizationId) {
            where.organizationId = organizationId;
        }

        if (userId) {
            where.userId = userId;
        }

        if (identifier) {
            where.identifier = identifier;
        }

        // Filter by blueprint identifier
        if (blueprint) {
            where.context = {
                path: ['blueprintIdentifier'],
                equals: blueprint
            };
        }

        // Filter by entity/resource ID
        if (entity) {
            where.OR = [
                { context: { path: ['blueprintId'], equals: entity } },
                { context: { path: ['propertyId'], equals: entity } }
            ];
        }

        if (resourceType) {
            if (Array.isArray(resourceType)) {
                where.resourceType = { in: resourceType };
            } else {
                where.resourceType = resourceType;
            }
        }

        // Support both 'action' and 'actionType' for flexibility
        const actionFilter = actionType || action;
        if (actionFilter) {
            if (Array.isArray(actionFilter)) {
                where.action = { in: actionFilter };
            } else {
                where.action = actionFilter;
            }
        }

        if (status) {
            if (Array.isArray(status)) {
                where.status = { in: status };
            } else {
                where.status = status;
            }
        }

        // Support both startDate/endDate and from/to
        const fromDate = from || startDate;
        const toDate = to || endDate;

        if (fromDate || toDate) {
            where.triggeredAt = {};
            if (fromDate) {
                where.triggeredAt.gte = fromDate;
            }
            if (toDate) {
                where.triggeredAt.lte = toDate;
            }
        }

        const [audits, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            avatar: true,
                        }
                    },
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                },
                orderBy: {
                    triggeredAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.auditLog.count({ where })
        ]);

        // Transform response to match Port.io format
        const transformedAudits = audits.map(audit => ({
            identifier: audit.identifier,
            action: audit.action,
            resourceType: audit.resourceType,
            status: audit.status,
            message: audit.message,
            triggeredAt: audit.triggeredAt,
            triggeredBy: audit.triggeredBy,
            origin: audit.origin,
            context: audit.context,
            // Flatten diff from additionalData to top level
            diff: (audit.additionalData as any)?.diff || null,
            user: audit.user,
            organization: audit.organization
        }));

        return {
            ok: true,
            audits: transformedAudits,
            total,
            limit,
            offset
        };
    }

    /**
     * Get a single audit log by ID
     */
    async getById(id: string) {
        return prisma.auditLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            }
        });
    }

    /**
     * Get a single audit log by identifier
     */
    async getByIdentifier(identifier: string) {
        return prisma.auditLog.findUnique({
            where: { identifier },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            }
        });
    }

    /**
     * Get audit statistics
     */
    async getStats(organizationId?: string) {
        const where: Prisma.AuditLogWhereInput = organizationId
            ? { organizationId }
            : {};

        const [totalCount, successCount, failureCount, byResource, byAction] = await Promise.all([
            prisma.auditLog.count({ where }),
            prisma.auditLog.count({ where: { ...where, status: 'SUCCESS' } }),
            prisma.auditLog.count({ where: { ...where, status: 'FAILURE' } }),
            prisma.auditLog.groupBy({
                by: ['resourceType'],
                where,
                _count: true,
                orderBy: {
                    _count: {
                        resourceType: 'desc'
                    }
                }
            }),
            prisma.auditLog.groupBy({
                by: ['action'],
                where,
                _count: true,
                orderBy: {
                    _count: {
                        action: 'desc'
                    }
                }
            })
        ]);

        return {
            totalCount,
            successCount,
            failureCount,
            byResource: byResource.map(r => ({
                resourceType: r.resourceType,
                count: r._count
            })),
            byAction: byAction.map(a => ({
                action: a.action,
                count: a._count
            }))
        };
    }
}

export const auditLogService = new AuditLogService();
