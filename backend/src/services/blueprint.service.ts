import { prisma } from '../config/db.js';
import { Blueprint, BlueprintProperty } from '@prisma/client';

export class BlueprintService {
    async getAll() {
        return prisma.blueprint.findMany({
            include: {
                properties: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
    }

    async getById(id: string) {
        return prisma.blueprint.findUnique({
            where: { id },
            include: {
                properties: true
            }
        });
    }

    async create(data: { title: string; identifier: string; icon: string; description?: string }) {
        return prisma.blueprint.create({
            data,
            include: {
                properties: true
            }
        });
    }

    async update(id: string, data: Partial<Blueprint>) {
        return prisma.blueprint.update({
            where: { id },
            data,
            include: {
                properties: true
            }
        });
    }

    async delete(id: string) {
        return prisma.blueprint.delete({
            where: { id }
        });
    }

    async addProperty(blueprintId: string, data: Omit<BlueprintProperty, 'id' | 'blueprintId' | 'createdAt' | 'updatedAt'>) {
        return prisma.blueprintProperty.create({
            data: {
                ...data,
                blueprintId
            }
        });
    }

    async deleteProperty(propertyId: string) {
        return prisma.blueprintProperty.delete({
            where: { id: propertyId }
        });
    }
}

export const blueprintService = new BlueprintService();
