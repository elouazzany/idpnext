import { prisma } from '../src/config/db.js';

async function updateBlueprintIcons() {
  try {
    console.log('Updating blueprint and catalog page icons...');

    // Icon mapping
    const iconMapping: Record<string, string> = {
      'service': 'Box',
      '_user': 'User',
      '_team': 'Users'
    };

    // Update blueprints
    for (const [identifier, icon] of Object.entries(iconMapping)) {
      console.log(`\nUpdating blueprint: ${identifier} with icon: ${icon}`);

      const blueprints = await prisma.blueprint.findMany({
        where: { identifier }
      });

      for (const blueprint of blueprints) {
        if (blueprint.icon !== icon) {
          console.log(`  Updating blueprint ${blueprint.id}: '${blueprint.icon}' -> '${icon}'`);
          await prisma.blueprint.update({
            where: { id: blueprint.id },
            data: { icon }
          });
        }
      }

      // Update catalog pages
      const catalogPages = await prisma.catalogPage.findMany({
        where: { blueprintId: identifier }
      });

      for (const page of catalogPages) {
        if (page.icon !== icon) {
          console.log(`  Updating catalog page ${page.id}: '${page.icon}' -> '${icon}'`);
          await prisma.catalogPage.update({
            where: { id: page.id },
            data: { icon }
          });
        } else {
          console.log(`  Catalog page ${page.id} already has correct icon: ${icon}`);
        }
      }
    }

    console.log('\n✅ Blueprint and catalog page icons updated successfully!');
  } catch (error) {
    console.error('Error updating icons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBlueprintIcons();
