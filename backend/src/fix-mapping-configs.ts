import { prisma } from './config/db';

const fixedMapping = `resources:
  - kind: repository
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"service"'
          properties:
            url: .html_url
            language: .language
  - kind: pull-request
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .head.repo.name + (.id|tostring)
          title: .title
          blueprint: '"githubPullRequest"'
          properties:
            creator: .user.login
            assignees: '[ (.assignees // [])[].login ]'
            reviewers: '[ (.requested_reviewers // [])[].login ]'
            status: .status
            closedAt: .closed_at
            updatedAt: .updated_at
            mergedAt: .merged_at
            prNumber: .id
            link: .html_url
          relations:
            service: .head.repo.name`;

async function fixMappingConfigs() {
    console.log('🔧 Updating GitHub integration configs to remove invalid readme mapping...');

    const configs = await prisma.integrationConfig.findMany({
        where: {
            provider: 'github'
        }
    });

    console.log(`Found ${configs.length} GitHub integration config(s)`);

    for (const config of configs) {
        if (config.mappingYaml.includes('file://README.md')) {
            console.log(`Updating config ${config.id}...`);
            await prisma.integrationConfig.update({
                where: { id: config.id },
                data: { mappingYaml: fixedMapping }
            });
            console.log(`✅ Updated config ${config.id}`);
        } else {
            console.log(`⏭️  Config ${config.id} already has correct mapping`);
        }
    }

    console.log('✅ All configs updated!');
}

fixMappingConfigs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
