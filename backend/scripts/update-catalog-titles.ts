import { prisma } from '../src/config/db.js';

async function updateCatalogPages() {
  try {
    console.log('Updating catalog page titles...');

    // Get all catalog pages for default blueprints
    const pages = await prisma.catalogPage.findMany({
      where: {
        blueprintId: {
          in: ['_user', '_team', 'service']
        }
      }
    });

    console.log('Found catalog pages:', pages.map(p => ({ id: p.id, title: p.title, blueprintId: p.blueprintId })));

    // Update the titles
    for (const page of pages) {
      let newTitle;
      if (page.blueprintId === '_user') newTitle = 'Users';
      else if (page.blueprintId === '_team') newTitle = 'Teams';
      else if (page.blueprintId === 'service') newTitle = 'Service Catalog';

      if (newTitle && page.title !== newTitle) {
        console.log(`Updating page ${page.id}: '${page.title}' -> '${newTitle}'`);
        await prisma.catalogPage.update({
          where: { id: page.id },
          data: { title: newTitle }
        });
      }
    }

    console.log('Catalog pages updated successfully!');
  } catch (error) {
    console.error('Error updating catalog pages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCatalogPages();
