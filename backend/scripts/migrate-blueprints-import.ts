import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function restoreBlueprints() {
    console.log('Starting blueprint data restoration...');

    try {
        // Read backup file
        const backupData = JSON.parse(
            fs.readFileSync('./blueprint_migration_backup.json', 'utf-8')
        );

        console.log(`Found ${backupData.length} blueprints to restore`);

        // Upsert blueprints with new structure
        for (const bp of backupData) {
            await prisma.blueprint.upsert({
                where: { id: bp.id },
                update: {
                    schema: bp.schema,
                    mirrorProperties: {},
                    calculationProperties: {},
                    aggregationProperties: {},
                    relations: bp.relations
                },
                create: {
                    id: bp.id,
                    identifier: bp.identifier,
                    title: bp.title,
                    icon: bp.icon,
                    description: bp.description,
                    schema: bp.schema,
                    mirrorProperties: {},
                    calculationProperties: {},
                    aggregationProperties: {},
                    relations: bp.relations,
                    createdAt: new Date(bp.createdAt),
                    updatedAt: new Date(bp.updatedAt)
                }
            });
            console.log(`Restored blueprint: ${bp.identifier}`);
        }

        console.log('Blueprint restoration complete!');

    } catch (error) {
        console.error('Restoration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

restoreBlueprints();
