import { prisma } from '../config/db.js';

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
    organizationId?: string;
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
    organizationId?: string;
    tenantId?: string;
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

    async getById(identifier: string, organizationId?: string, tenantId?: string) {
        const where: any = { identifier };
        if (organizationId) where.organizationId = organizationId;
        if (tenantId) where.tenantId = tenantId;

        return prisma.blueprint.findFirst({
            where
        });
    }

    async getByIdentifier(identifier: string) {
        return prisma.blueprint.findUnique({
            where: { identifier }
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

        return prisma.blueprint.create({
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
    }

    async update(identifier: string, data: UpdateBlueprintData) {
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

        return prisma.blueprint.update({
            where: { identifier },
            data: updateData
        });
    }

    async delete(identifier: string) {
        return prisma.blueprint.delete({
            where: { identifier }
        });
    }
}

export const blueprintService = new BlueprintService();
