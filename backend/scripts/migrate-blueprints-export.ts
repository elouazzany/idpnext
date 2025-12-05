import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateBlueprints() {
    console.log('Starting blueprint data migration...');

    try {
        // Get all blueprints with their properties
        const blueprints = await prisma.$queryRaw<any[]>`
            SELECT 
                b.id,
                b.title,
                b.identifier,
                b.icon,
                b.description,
                b."createdAt",
                b."updatedAt",
                json_agg(
                    json_build_object(
                        'identifier', bp.identifier,
                        'title', bp.title,
                        'type', bp.type,
                        'description', bp.description,
                        'icon', bp.icon,
                        'defaultValue', bp."defaultValue",
                        'required', bp.required
                    )
                ) FILTER (WHERE bp.id IS NOT NULL) as properties
            FROM "Blueprint" b
            LEFT JOIN "BlueprintProperty" bp ON b.id = bp."blueprintId"
            GROUP BY b.id
        `;

        console.log(`Found ${blueprints.length} blueprints to migrate`);

        // Store migration data
        const migrationData = blueprints.map(bp => {
            const schema: any = {
                properties: {},
                required: []
            };
            const relations: any = {};

            // Process properties
            if (bp.properties && bp.properties.length > 0) {
                bp.properties.forEach((prop: any) => {
                    if (prop.type === 'relation') {
                        // This is a relation, add to relations object
                        relations[prop.identifier] = {
                            title: prop.title,
                            target: prop.defaultValue || '', // defaultValue stores target blueprint ID
                            required: prop.required,
                            many: prop.identifier.endsWith('s') // Simple heuristic
                        };
                    } else {
                        // Regular property
                        schema.properties[prop.identifier] = {
                            type: prop.type,
                            title: prop.title,
                            description: prop.description,
                            icon: prop.icon,
                            default: prop.defaultValue
                        };

                        if (prop.required) {
                            schema.required.push(prop.identifier);
                        }
                    }
                });
            }

            return {
                id: bp.id,
                identifier: bp.identifier,
                title: bp.title,
                icon: bp.icon,
                description: bp.description,
                schema,
                relations,
                createdAt: bp.createdAt,
                updatedAt: bp.updatedAt
            };
        });

        // Save to file for backup
        const fs = await import('fs');
        fs.writeFileSync(
            './blueprint_migration_backup.json',
            JSON.stringify(migrationData, null, 2)
        );

        console.log('Migration data saved to blueprint_migration_backup.json');
        console.log('You can now apply the schema changes with: npx prisma db push --accept-data-loss');
        console.log('After that, run the restore script to import the data back.');

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateBlueprints();
