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

            console.log(`🔄 Syncing installation ${config.installationId} for org ${config.organizationId}`);

            const octokit = await gitHubService.getInstallationClient(Number(config.installationId));

            // Fetch all accessible repositories
            const repos = await octokit.paginate(octokit.rest.apps.listReposAccessibleToInstallation, {
                per_page: 100
            });

            console.log(`📦 Fetched ${repos.length} repositories`);

            for (const repo of repos) {
                const [owner, repoName] = repo.full_name.split('/');

                try {
                    // 1. Repository
                    await this.processResource(repo, 'repository', config);

                    // 2. Issues
                    try {
                        const issues = await octokit.rest.issues.listForRepo({
                            owner,
                            repo: repoName,
                            state: 'all',
                            per_page: 100
                        });
                        for (const issue of issues.data.filter(i => !i.pull_request)) { // Filter out PRs
                            await this.processResource(issue, 'issue', config);
                        }
                        console.log(`  📋 Synced ${issues.data.length} issues for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch issues for ${repo.full_name}:`, err.message);
                    }

                    // 3. Pull Requests
                    try {
                        const prs = await octokit.rest.pulls.list({
                            owner,
                            repo: repoName,
                            state: 'all',
                            per_page: 100
                        });
                        for (const pr of prs.data) {
                            await this.processResource(pr, 'pull-request', config);
                        }
                        console.log(`  🔀 Synced ${prs.data.length} pull requests for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch PRs for ${repo.full_name}:`, err.message);
                    }

                    // 4. Workflow Runs
                    try {
                        const workflowRuns = await octokit.rest.actions.listWorkflowRunsForRepo({
                            owner,
                            repo: repoName,
                            per_page: 100
                        });
                        for (const run of workflowRuns.data.workflow_runs) {
                            await this.processResource(run, 'workflow-run', config);
                        }
                        console.log(`  ⚙️ Synced ${workflowRuns.data.workflow_runs.length} workflow runs for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch workflow runs for ${repo.full_name}:`, err.message);
                    }

                    // 5. Branches
                    try {
                        const branches = await octokit.rest.repos.listBranches({
                            owner,
                            repo: repoName,
                            per_page: 100
                        });
                        for (const branch of branches.data) {
                            await this.processResource(branch, 'branches', config);
                        }
                        console.log(`  🌿 Synced ${branches.data.length} branches for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch branches for ${repo.full_name}:`, err.message);
                    }

                    // 6. Tags
                    try {
                        const tags = await octokit.rest.repos.listTags({
                            owner,
                            repo: repoName,
                            per_page: 100
                        });
                        for (const tag of tags.data) {
                            await this.processResource(tag, 'tags', config);
                        }
                        console.log(`  🏷️ Synced ${tags.data.length} tags for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch tags for ${repo.full_name}:`, err.message);
                    }

                    // 7. Releases
                    try {
                        const releases = await octokit.rest.repos.listReleases({
                            owner,
                            repo: repoName,
                            per_page: 100
                        });
                        for (const release of releases.data) {
                            await this.processResource(release, 'releases', config);
                        }
                        console.log(`  📦 Synced ${releases.data.length} releases for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch releases for ${repo.full_name}:`, err.message);
                    }

                    // 8. Deployments
                    try {
                        const deployments = await octokit.rest.repos.listDeployments({
                            owner,
                            repo: repoName,
                            per_page: 100
                        });
                        for (const deployment of deployments.data) {
                            await this.processResource(deployment, 'deployment', config);
                        }
                        console.log(`  🚀 Synced ${deployments.data.length} deployments for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch deployments for ${repo.full_name}:`, err.message);
                    }

                    // 9. Environments
                    try {
                        const environments = await octokit.rest.repos.getAllEnvironments({
                            owner,
                            repo: repoName
                        });
                        for (const env of environments.data.environments || []) {
                            await this.processResource(env, 'environment', config);
                        }
                        console.log(`  🌍 Synced ${environments.data.environments?.length || 0} environments for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch environments for ${repo.full_name}:`, err.message);
                    }

                    // 10. Dependabot Alerts
                    try {
                        const dependabotAlerts = await octokit.rest.dependabot.listAlertsForRepo({
                            owner,
                            repo: repoName,
                            per_page: 100
                        });
                        for (const alert of dependabotAlerts.data) {
                            await this.processResource(alert, 'dependabot-alert', config);
                        }
                        console.log(`  🔒 Synced ${dependabotAlerts.data.length} dependabot alerts for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch dependabot alerts for ${repo.full_name}:`, err.message);
                    }

                    // 11. Code Scanning Alerts
                    try {
                        const codeScanningAlerts = await octokit.rest.codeScanning.listAlertsForRepo({
                            owner,
                            repo: repoName,
                            per_page: 100
                        });
                        for (const alert of codeScanningAlerts.data) {
                            await this.processResource(alert, 'code-scanning', config);
                        }
                        console.log(`  🔍 Synced ${codeScanningAlerts.data.length} code scanning alerts for ${repo.full_name}`);
                    } catch (err: any) {
                        console.warn(`  ⚠️ Could not fetch code scanning alerts for ${repo.full_name}:`, err.message);
                    }

                } catch (repoErr: any) {
                    console.error(`  ❌ Failed to sync resources for ${repo.full_name}:`, repoErr.message);
                }
            }

            console.log(`✅ Sync completed for installation ${config.installationId}`);
        } catch (err: any) {
            console.error(`Sync failed for config ${config.id}:`, err.message);
        }
    }

    private async processResource(payload: any, kind: string, config: any) {
        try {
            const entities = await mappingService.transform(payload, kind, config.mappingYaml, Number(config.installationId));

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
        } catch (err: any) {
            console.error(`Failed to process ${kind} resource:`, err.message);
        }
    }
}

export const pollingService = PollingService.getInstance();
