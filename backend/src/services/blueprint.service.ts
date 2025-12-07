import { prisma } from '../config/db.js';
import { catalogService } from './catalog.service.js';
import fs from 'fs/promises';
import path from 'path';

export interface CreateBlueprintData {
    title: string;
    identifier: string;
    icon: string;
    description?: string;
    schema?: any;
    mirrorProperties?: any;
    calculationProperties?: any;
    aggregationProperties?: any;
    relations?: any;
    changelogDestination?: any;
    createdBy?: string;
    organizationId: string; // Made required for multi-tenancy
    tenantId?: string;
}

export interface UpdateBlueprintData {
    title?: string;
    identifier?: string;
    icon?: string;
    description?: string;
    schema?: any;
    mirrorProperties?: any;
    calculationProperties?: any;
    aggregationProperties?: any;
    relations?: any;
    changelogDestination?: any;
    updatedBy?: string;
}

export class BlueprintService {
    async getAll(organizationId?: string, tenantId?: string) {
        const where: any = {};
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        return prisma.blueprint.findMany({
            where,
            orderBy: {
                updatedAt: 'desc'
            }
        });
    }

    async getById(id: string) {
        return prisma.blueprint.findUnique({
            where: { id }
        });
    }

    async getByIdentifier(identifier: string, organizationId: string, tenantId: string | null = null) {
        // Prisma unique where clause for composite key
        // If tenantId is null (rare in this request context but possible in schema), we need to handle it.
        // However, Prisma treats NULL in unique constraints as distinct usually, but explicit lookup with NULL might be tricky depending on DB.
        // For Postgres, NULL != NULL. So unique index with NULLs means we can have multiple.
        // But for our seeding purpose, we will assume we always have context.

        // Using findFirst to be safe if unique constraint doesn't work as expected with NULLs
        // OR if we want to support finding by just identifier if unique in context
        return prisma.blueprint.findFirst({
            where: {
                identifier,
                organizationId,
                tenantId
            }
        });
    }

    async create(data: CreateBlueprintData) {
        const {
            title,
            identifier,
            icon,
            description,
            schema = { properties: {}, required: [] },
            mirrorProperties = {},
            calculationProperties = {},
            aggregationProperties = {},
            relations = {},
            changelogDestination,
            createdBy,
            organizationId,
            tenantId
        } = data;

        const blueprint = await prisma.blueprint.create({
            data: {
                title,
                identifier,
                icon,
                description,
                schema,
                mirrorProperties,
                calculationProperties,
                aggregationProperties,
                relations,
                changelogDestination,
                createdBy,
                organizationId,
                tenantId
            }
        });

        // Automatically create a catalog page for the new blueprint
        if (blueprint && organizationId) {
            try {
                await catalogService.createPage({
                    title: identifier,
                    blueprintId: blueprint.identifier,
                    organizationId,
                    tenantId,
                    createdBy,
                    layout: 'table'
                });
            } catch (error) {
                console.error('Failed to create catalog page for blueprint:', error);
                // We don't fail the blueprint creation if catalog page creation fails
            }
        }

        return blueprint;
    }

    // Update requires full context now to find the right blueprint
    async update(identifier: string, organizationId: string, tenantId: string | null, data: UpdateBlueprintData) {
        // First find the blueprint to get its ID or confirm existence
        const existing = await this.getByIdentifier(identifier, organizationId, tenantId);
        if (!existing) {
            throw new Error(`Blueprint ${identifier} not found in org ${organizationId} tenant ${tenantId}`);
        }

        const updateData: any = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.identifier !== undefined) updateData.identifier = data.identifier;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.schema !== undefined) updateData.schema = data.schema;
        if (data.mirrorProperties !== undefined) updateData.mirrorProperties = data.mirrorProperties;
        if (data.calculationProperties !== undefined) updateData.calculationProperties = data.calculationProperties;
        if (data.aggregationProperties !== undefined) updateData.aggregationProperties = data.aggregationProperties;
        if (data.relations !== undefined) updateData.relations = data.relations;
        if (data.changelogDestination !== undefined) updateData.changelogDestination = data.changelogDestination;
        if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

        const updatedBlueprint = await prisma.blueprint.update({
            where: { id: existing.id },
            data: updateData
        });

        // If identifier changed, create a new catalog page with the new identifier
        if (data.identifier && data.identifier !== identifier && updatedBlueprint.organizationId) {
            try {
                await catalogService.createPage({
                    title: data.identifier,
                    blueprintId: updatedBlueprint.identifier,
                    organizationId: updatedBlueprint.organizationId,
                    tenantId: updatedBlueprint.tenantId || undefined,
                    createdBy: data.updatedBy, // Use updatedBy as creator of new page
                    layout: 'table'
                });
            } catch (error) {
                console.error('Failed to create catalog page for updated blueprint:', error);
            }
        }

        return updatedBlueprint;
    }

    async seedDefaults(organizationId: string, tenantId: string) {
        const BLUEPRINTS = ['user.json', 'team.json', 'service.json'];
        const resourcesPath = path.join(process.cwd(), 'resources');

        // Map blueprint identifiers to proper catalog page titles
        const catalogTitles: Record<string, string> = {
            'service': 'Service Catalog',
            '_user': 'Users',
            '_team': 'Teams'
        };

        console.log(`[SEEDING] Starting blueprint seeding for org ${organizationId}, tenant ${tenantId}`);
        console.log(`[SEEDING] Resources path: ${resourcesPath}`);
        console.log(`[SEEDING] Working directory: ${process.cwd()}`);

        for (const file of BLUEPRINTS) {
            try {
                const filePath = path.join(resourcesPath, file);
                console.log(`[SEEDING] Reading blueprint file: ${filePath}`);

                const content = await fs.readFile(filePath, 'utf-8');
                const def = JSON.parse(content);

                const { identifier } = def;
                console.log(`[SEEDING] Processing blueprint: ${identifier}`);

                // Check if blueprint exists
                const existing = await this.getByIdentifier(identifier, organizationId, tenantId);

                let blueprint;
                if (existing) {
                    console.log(`[SEEDING] Blueprint ${identifier} exists, updating...`);
                    blueprint = await this.update(identifier, organizationId, tenantId, {
                        ...def,
                        updatedBy: 'system-seed'
                    });
                    console.log(`[SEEDING] Successfully updated blueprint ${identifier}`);
                } else {
                    console.log(`[SEEDING] Blueprint ${identifier} does not exist, creating...`);

                    // Create blueprint WITHOUT auto-creating catalog page
                    blueprint = await prisma.blueprint.create({
                        data: {
                            title: def.title,
                            identifier: def.identifier,
                            icon: def.icon,
                            description: def.description,
                            schema: def.schema || { properties: {}, required: [] },
                            mirrorProperties: def.mirrorProperties || {},
                            calculationProperties: def.calculationProperties || {},
                            aggregationProperties: def.aggregationProperties || {},
                            relations: def.relations || {},
                            changelogDestination: def.changelogDestination,
                            createdBy: 'system-seed',
                            organizationId,
                            tenantId
                        }
                    });

                    console.log(`[SEEDING] Successfully created blueprint ${identifier}`);

                    // Create catalog page with proper title and icon
                    const catalogTitle = catalogTitles[identifier] || def.title;
                    console.log(`[SEEDING] Creating catalog page "${catalogTitle}" for blueprint ${identifier}`);

                    try {
                        await catalogService.createPage({
                            title: catalogTitle,
                            icon: def.icon, // Use the blueprint's icon
                            blueprintId: blueprint.identifier,
                            organizationId,
                            tenantId,
                            createdBy: 'system-seed',
                            layout: 'table'
                        });
                        console.log(`[SEEDING] Successfully created catalog page "${catalogTitle}" with icon ${def.icon}`);
                    } catch (catalogErr) {
                        console.error(`[SEEDING ERROR] Failed to create catalog page for ${identifier}:`, catalogErr);
                    }
                }

            } catch (err) {
                console.error(`[SEEDING ERROR] Failed to seed default blueprint ${file} for tenant ${tenantId}:`, err);
                if (err instanceof Error) {
                    console.error(`[SEEDING ERROR] Stack trace:`, err.stack);
                }
            }
        }

        console.log(`[SEEDING] Completed blueprint seeding for tenant ${tenantId}`);
    }

    async delete(identifier: string, organizationId: string, tenantId: string | null) {
        const existing = await this.getByIdentifier(identifier, organizationId, tenantId);
        if (!existing) {
            throw new Error(`Blueprint ${identifier} not found`);
        }
        return prisma.blueprint.delete({
            where: { id: existing.id }
        });
    }
}

export const blueprintService = new BlueprintService();
