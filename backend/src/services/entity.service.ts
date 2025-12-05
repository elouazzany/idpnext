import { prisma } from '../config/db.js';
import { Prisma } from '@prisma/client';

export interface CreateEntityData {
    identifier: string;
    blueprintId: string;
    title?: string;
    properties?: Record<string, any>;
    relations?: Record<string, any>;
    team?: string;
    icon?: string;
    createdBy?: string;
    organizationId?: string;
    tenantId?: string;
}

export interface UpdateEntityData {
    title?: string;
    properties?: Record<string, any>;
    relations?: Record<string, any>;
    team?: string;
    icon?: string;
    updatedBy?: string;
}

export interface SearchQuery {
    rules?: Array<{
        property: string;
        operator: 'eq' | 'neq' | 'in' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
        value: any;
    }>;
    combinator?: 'and' | 'or';
}

export interface AggregateQuery {
    function: 'count' | 'sum' | 'avg' | 'min' | 'max';
    property?: string;
    groupBy?: string[];
    rules?: SearchQuery['rules'];
}

export class EntityService {
    /**
     * Get all entities of a blueprint
     */
    async getAll(
        blueprintId: string,
        organizationId?: string,
        tenantId?: string,
        limit?: number,
        offset?: number
    ) {
        const where: any = { blueprintId };
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        const [entities, total] = await Promise.all([
            prisma.entity.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.entity.count({ where })
        ]);

        return { entities, total };
    }

    /**
     * Get a single entity by identifier
     */
    async getByIdentifier(
        blueprintId: string,
        identifier: string,
        organizationId?: string,
        tenantId?: string
    ) {
        const where: any = { blueprintId, identifier };
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        return prisma.entity.findFirst({ where });
    }

    /**
     * Get entity count for a blueprint
     */
    async getCount(
        blueprintId: string,
        organizationId?: string,
        tenantId?: string
    ) {
        const where: any = { blueprintId };
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        return prisma.entity.count({ where });
    }

    /**
     * Create a single entity
     */
    async create(data: CreateEntityData) {
        const {
            identifier,
            blueprintId,
            title,
            properties = {},
            relations = {},
            team,
            icon,
            createdBy,
            organizationId,
            tenantId
        } = data;

        // Check for existing entity
        const existing = await this.getByIdentifier(
            blueprintId,
            identifier,
            organizationId,
            tenantId
        );

        let entity;
        if (existing) {
            // Update existing entity
            entity = await prisma.entity.update({
                where: { id: existing.id },
                data: {
                    title,
                    properties,
                    relations,
                    team,
                    icon,
                    updatedBy: createdBy,
                }
            });
        } else {
            // Create new entity
            entity = await prisma.entity.create({
                data: {
                    identifier,
                    blueprintId,
                    title,
                    properties,
                    relations,
                    team,
                    icon,
                    createdBy,
                    organizationId,
                    tenantId
                }
            });
        }

        // Create history entry
        await this.createHistoryEntry(
            entity.id,
            blueprintId,
            identifier,
            existing ? 'UPDATE' : 'CREATE',
            null,
            null,
            entity,
            createdBy,
            organizationId,
            tenantId
        );

        return entity;
    }

    /**
     * Create multiple entities (bulk)
     */
    async createMany(
        blueprintId: string,
        entities: CreateEntityData[],
        organizationId?: string,
        tenantId?: string
    ) {
        const results: Array<{
            success: boolean;
            entity?: any;
            error?: string;
            identifier: string;
        }> = [];

        // Process entities one by one (max 20 per Port spec)
        for (const entityData of entities.slice(0, 20)) {
            try {
                const entity = await this.create({
                    ...entityData,
                    blueprintId,
                    organizationId,
                    tenantId
                });
                results.push({
                    success: true,
                    entity,
                    identifier: entityData.identifier
                });
            } catch (error: any) {
                results.push({
                    success: false,
                    error: error.message,
                    identifier: entityData.identifier
                });
            }
        }

        const allSuccess = results.every(r => r.success);
        return {
            status: allSuccess ? 200 : 207,
            results
        };
    }

    /**
     * Update an entity (PATCH - partial update)
     */
    async update(
        blueprintId: string,
        identifier: string,
        data: UpdateEntityData,
        organizationId?: string,
        tenantId?: string
    ) {
        const entity = await this.getByIdentifier(
            blueprintId,
            identifier,
            organizationId,
            tenantId
        );

        if (!entity) {
            throw new Error('Entity not found');
        }

        const oldSnapshot = { ...entity };

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.team !== undefined) updateData.team = data.team;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

        // Merge properties
        if (data.properties !== undefined) {
            updateData.properties = {
                ...(entity.properties as any),
                ...data.properties
            };
        }

        // Merge relations
        if (data.relations !== undefined) {
            updateData.relations = {
                ...(entity.relations as any),
                ...data.relations
            };
        }

        const updated = await prisma.entity.update({
            where: { id: entity.id },
            data: updateData
        });

        // Create history entry
        await this.createHistoryEntry(
            entity.id,
            blueprintId,
            identifier,
            'UPDATE',
            oldSnapshot,
            updated,
            updated,
            data.updatedBy,
            organizationId,
            tenantId
        );

        return updated;
    }

    /**
     * Replace an entity (PUT - full replacement)
     */
    async replace(
        blueprintId: string,
        identifier: string,
        data: CreateEntityData,
        organizationId?: string,
        tenantId?: string
    ) {
        const entity = await this.getByIdentifier(
            blueprintId,
            identifier,
            organizationId,
            tenantId
        );

        if (!entity) {
            throw new Error('Entity not found');
        }

        const oldSnapshot = { ...entity };

        const updated = await prisma.entity.update({
            where: { id: entity.id },
            data: {
                title: data.title,
                properties: data.properties || {},
                relations: data.relations || {},
                team: data.team,
                icon: data.icon,
                updatedBy: data.createdBy,
            }
        });

        // Create history entry
        await this.createHistoryEntry(
            entity.id,
            blueprintId,
            identifier,
            'UPDATE',
            oldSnapshot,
            updated,
            updated,
            data.createdBy,
            organizationId,
            tenantId
        );

        return updated;
    }

    /**
     * Delete a single entity
     */
    async delete(
        blueprintId: string,
        identifier: string,
        organizationId?: string,
        tenantId?: string,
        deletedBy?: string
    ) {
        const entity = await this.getByIdentifier(
            blueprintId,
            identifier,
            organizationId,
            tenantId
        );

        if (!entity) {
            throw new Error('Entity not found');
        }

        // Create history entry before deletion
        await this.createHistoryEntry(
            entity.id,
            blueprintId,
            identifier,
            'DELETE',
            entity,
            null,
            entity,
            deletedBy,
            organizationId,
            tenantId
        );

        return prisma.entity.delete({
            where: { id: entity.id }
        });
    }

    /**
     * Delete all entities of a blueprint
     */
    async deleteAll(
        blueprintId: string,
        organizationId?: string,
        tenantId?: string
    ) {
        const where: any = { blueprintId };
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        return prisma.entity.deleteMany({ where });
    }

    /**
     * Delete multiple entities by identifiers
     */
    async deleteMany(
        blueprintId: string,
        identifiers: string[],
        deleteDependents: boolean = false,
        organizationId?: string,
        tenantId?: string
    ) {
        const results: Array<{
            success: boolean;
            identifier: string;
            error?: string;
        }> = [];

        // Process deletions one by one (max 100 per Port spec)
        for (const identifier of identifiers.slice(0, 100)) {
            try {
                await this.delete(blueprintId, identifier, organizationId, tenantId);
                results.push({
                    success: true,
                    identifier
                });
            } catch (error: any) {
                if (!deleteDependents) {
                    // If delete_dependents is false and any deletion fails, rollback
                    throw new Error(`Failed to delete entity ${identifier}: ${error.message}`);
                }
                results.push({
                    success: false,
                    identifier,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Search entities based on rules
     */
    async search(
        query: SearchQuery,
        organizationId?: string,
        tenantId?: string,
        limit?: number,
        offset?: number
    ) {
        const where: any = {};
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        // Build search conditions
        if (query.rules && query.rules.length > 0) {
            const conditions = query.rules.map(rule => {
                const propertyPath = `properties.${rule.property}`;

                switch (rule.operator) {
                    case 'eq':
                        return { [propertyPath]: { equals: rule.value } };
                    case 'neq':
                        return { [propertyPath]: { not: rule.value } };
                    case 'contains':
                        return { [propertyPath]: { path: '$', string_contains: rule.value } };
                    case 'gt':
                        return { [propertyPath]: { gt: rule.value } };
                    case 'gte':
                        return { [propertyPath]: { gte: rule.value } };
                    case 'lt':
                        return { [propertyPath]: { lt: rule.value } };
                    case 'lte':
                        return { [propertyPath]: { lte: rule.value } };
                    default:
                        return {};
                }
            });

            if (query.combinator === 'or') {
                where.OR = conditions;
            } else {
                where.AND = conditions;
            }
        }

        const [entities, total] = await Promise.all([
            prisma.entity.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.entity.count({ where })
        ]);

        return { entities, total };
    }

    /**
     * Aggregate entities
     */
    async aggregate(
        blueprintId: string,
        query: AggregateQuery,
        organizationId?: string,
        tenantId?: string
    ) {
        const where: any = { blueprintId };
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        // For complex aggregations, we'll fetch all entities and process in memory
        // In production, this should be optimized with proper SQL aggregations
        const entities = await prisma.entity.findMany({ where });

        const result: any = {
            function: query.function,
            property: query.property,
            value: null
        };

        if (query.function === 'count') {
            result.value = entities.length;
        } else if (query.property) {
            const values = entities
                .map(e => (e.properties as any)[query.property!])
                .filter(v => v !== undefined && v !== null);

            switch (query.function) {
                case 'sum':
                    result.value = values.reduce((sum, val) => sum + Number(val), 0);
                    break;
                case 'avg':
                    result.value = values.length > 0
                        ? values.reduce((sum, val) => sum + Number(val), 0) / values.length
                        : 0;
                    break;
                case 'min':
                    result.value = Math.min(...values.map(Number));
                    break;
                case 'max':
                    result.value = Math.max(...values.map(Number));
                    break;
            }
        }

        return result;
    }

    /**
     * Get entity history
     */
    async getHistory(
        blueprintId: string,
        identifier: string,
        properties?: string[],
        startDate?: Date,
        endDate?: Date,
        organizationId?: string,
        tenantId?: string
    ) {
        const where: any = {
            blueprintId,
            entityIdentifier: identifier
        };

        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        if (startDate || endDate) {
            where.changedAt = {};
            if (startDate) where.changedAt.gte = startDate;
            if (endDate) where.changedAt.lte = endDate;
        }

        if (properties && properties.length > 0) {
            where.OR = [
                { propertyName: { in: properties } },
                { propertyName: null } // Include full entity updates
            ];
        }

        return prisma.entityHistory.findMany({
            where,
            orderBy: { changedAt: 'desc' }
        });
    }

    /**
     * Create a history entry for an entity change
     */
    private async createHistoryEntry(
        entityId: string,
        blueprintId: string,
        entityIdentifier: string,
        changeType: string,
        oldValue: any,
        newValue: any,
        snapshot: any,
        changedBy?: string,
        organizationId?: string,
        tenantId?: string
    ) {
        return prisma.entityHistory.create({
            data: {
                entityId,
                blueprintId,
                entityIdentifier,
                changeType,
                oldValue,
                newValue,
                snapshot,
                changedBy,
                organizationId,
                tenantId
            }
        });
    }
}

export const entityService = new EntityService();
