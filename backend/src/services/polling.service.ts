import { prisma } from '../config/db.js';
import { gitHubService } from './github.service.js';
import { mappingService } from './mapping.service.js';
import { entityService } from './entity.service.js';

export class PollingService {
    private static instance: PollingService;

    private constructor() { }

    public static getInstance(): PollingService {
        if (!PollingService.instance) {
            PollingService.instance = new PollingService();
        }
        return PollingService.instance;
    }

    public async syncAll() {
        console.log('🔄 Starting full sync...');
        const configs = await prisma.integrationConfig.findMany({
            where: { provider: 'github' }
        });

        for (const config of configs) {
            await this.syncInstallation(config);
        }
        console.log('✅ Full sync completed');
    }

    private async syncInstallation(config: any) { // Type as IntegrationConfig
        try {
            if (!config.installationId) {
                console.warn(`Skipping config ${config.id} without installationId`);
                return;
            }

            console.log(`Syncing installation ${config.installationId} for org ${config.organizationId}`);

            const octokit = await gitHubService.getInstallationClient(Number(config.installationId));

            // TODO: We need to know WHAT to fetch. 
            // The mapping YAML has 'kind: repository' etc. 
            // We should parse the YAML to find what resources to fetch.
            // For MVP, we'll assume we blindly fetch 'repositories' if the kind matches?
            // Or better: The mapping service should expose what kinds it handles.
            // But usually ingestion is: Fetch All Repos -> Map each.

            // For now, let's just fetch repositories.
            const repos = await octokit.paginate(octokit.rest.apps.listReposAccessibleToInstallation, {
                per_page: 100
            });

            console.log(`Fetched ${repos.length} repositories`);

            for (const repo of repos) {
                // We need to construct a payload that looks like the webhook payload for consistency?
                // Or MappingService should be able to handle just the resource object.
                // The webhook usually wraps it in { repository: ... }.
                // Let's wrap it to match the 'repository' selector query expectations if they rely on root fields.
                // But usually mappings like `.name` imply the root is the object itself?
                // In my webhook route, I passed `req.body` which is the whole webhook payload.
                // Webhook payload: { action: 'created', repository: {Name: ...}, sender: ... }
                // If I pass just `repo` object, selectors like `.repository.name` (if used) would fail.
                // But typically selectors are on the resource kind. 
                // Let's assume the mapping expects the resource itself or we wrap it in { repository: repo }.

                const payload = repo; // Simulate webhook structure for consistency if needed

                // Note: mappingService.transform iterates over 'resources' in YAML.
                // If YAML says:
                // resources:
                //   - kind: repository
                //     selector: query: 'true'
                //
                // It runs JQ on the payload.

                const entities = await mappingService.transform(payload, 'repository', config.mappingYaml, Number(config.installationId));

                // Save them
                for (const entity of entities) {
                    if (!entity.identifier || !entity.blueprint || !entity.title) {
                        console.warn('Skipping invalid entity:', entity);
                        continue;
                    }

                    await entityService.create({
                        identifier: entity.identifier,
                        blueprintId: entity.blueprint,
                        title: entity.title,
                        properties: entity.properties,
                        relations: entity.relations,
                        organizationId: config.organizationId,
                        tenantId: config.tenantId || undefined,
                        createdBy: 'system-sync',
                        icon: 'GitHub'
                    });
                }
            }
        } catch (err: any) {
            console.error(`Sync failed for config ${config.id}:`, err.message);
        }
    }
}

export const pollingService = PollingService.getInstance();
