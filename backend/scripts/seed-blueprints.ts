import { blueprintService } from '../src/services/blueprint.service';
import { prisma } from '../src/config/db';
import fs from 'fs/promises';
import path from 'path';

// Filenames of the resources to seed
const BLUEPRINTS = ['user.json', 'team.json', 'service.json'];

async function seed() {
    try {
        console.log('Starting blueprint seeding for all tenants...');

        // 1. Load blueprint definitions
        const blueprintDefinitions = [];
        for (const file of BLUEPRINTS) {
            try {
                const content = await fs.readFile(path.join(process.cwd(), 'resources', file), 'utf-8');
                blueprintDefinitions.push(JSON.parse(content));
            } catch (err) {
                console.error(`Failed to read or parse ${file}:`, err);
            }
        }

        if (blueprintDefinitions.length === 0) {
            console.error('No valid blueprint definitions found. Aborting.');
            return;
        }

        // 2. Get all tenants with their organization IDs
        const tenants = await prisma.tenant.findMany({
            select: { id: true, name: true, organizationId: true }
        });

        console.log(`Found ${tenants.length} tenants.`);

        // 3. Upsert set of blueprints for each tenant
        for (const tenant of tenants) {
            console.log(`Processing tenant: ${tenant.name} (${tenant.id}, Org: ${tenant.organizationId})`);

            for (const def of blueprintDefinitions) {
                const { identifier } = def;

                // Using new service method getByIdentifier(identifier, orgId, tenantId)
                const existing = await blueprintService.getByIdentifier(identifier, tenant.organizationId, tenant.id);

                try {
                    if (existing) {
                        console.log(`  Updating existing blueprint '${identifier}'...`);
                        await blueprintService.update(identifier, tenant.organizationId, tenant.id, {
                            ...def,
                            updatedBy: 'system-seed'
                        });
                    } else {
                        console.log(`  Creating new blueprint '${identifier}'...`);
                        await blueprintService.create({
                            ...def,
                            organizationId: tenant.organizationId,
                            tenantId: tenant.id,
                            createdBy: 'system-seed'
                        });
                    }
                } catch (err: any) {
                    console.error(`  Failed to upsert blueprint '${identifier}' for tenant ${tenant.id}:`, err.message);
                }
            }
        }

        console.log('Seeding completed.');

    } catch (error) {
        console.error('Seeding process failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
