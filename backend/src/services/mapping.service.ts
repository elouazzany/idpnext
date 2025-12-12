import jq from 'node-jq';
import yaml from 'js-yaml';

interface ValidatedEntity {
    identifier: string;
    title: string;
    blueprint: string;
    properties: Record<string, any>;
    relations?: Record<string, any>;
}

export class MappingService {
    private static instance: MappingService;

    private constructor() { }

    public static getInstance(): MappingService {
        if (!MappingService.instance) {
            MappingService.instance = new MappingService();
        }
        return MappingService.instance;
    }

    /**
     * Transforms a raw JSON payload using a YAML mapping configuration.
     * @param payload The raw JSON object from GitHub (as received).
     * @param kind The kind of GitHub resource (e.g., 'repository', 'pull-request').
     * @param mappingYaml The mapping configuration in YAML format.
     * @param installationId Optional GitHub App installation ID for fetching file content.
     * @returns Array of transformed entities.
     */
    public async transform(payload: any, kind: string, mappingYaml: string, installationId?: number): Promise<ValidatedEntity[]> {
        const config = yaml.load(mappingYaml) as any;
        const results: ValidatedEntity[] = [];

        if (!config || !config.resources || !Array.isArray(config.resources)) {
            throw new Error('Invalid mapping configuration: missing resources array');
        }


        for (const resource of config.resources) {
            // Filter: only process resources matching the provided kind
            if (resource.kind !== kind) {
                continue;
            }

            // 1. Selector check
            // 1. Selector check
            const selectorQuery = resource.selector?.query;
            let shouldProcess = true;

            if (selectorQuery) {
                // Optimization: if query is exactly "true", skip JQ execution
                if (selectorQuery === 'true') {
                    shouldProcess = true;
                } else {
                    try {
                        const selectorResult = await jq.run(selectorQuery, payload, { input: 'json', output: 'json' });
                        shouldProcess = !!selectorResult;
                    } catch (e) {
                        console.warn(`Selector query failed for kind ${resource.kind}:`, e);
                        shouldProcess = false;
                    }
                }
            } else {
                // If no selector provided, assume true? Or strict requirement?
                // Based on "The selector and the query keys let you filter...", implies it's optional but usage defines filtering.
                // Assuming default to true if selector is missing to be permissive, or false to be strict.
                // Given standard k8s/etc patterns, missing selector often means "select all" or "select none".
                // Defaulting to match-all (true) is usually safer for usability unless documentation says otherwise.
                shouldProcess = true;
            }

            if (!shouldProcess) continue;

            // 2. Map fields
            const mappings = resource.port?.entity?.mappings;
            if (!mappings) continue;

            try {
                const entity: ValidatedEntity = {
                    identifier: '',
                    title: '',
                    blueprint: mappings.blueprint ? (await this.runJq(mappings.blueprint, payload)) : resource.kind,
                    properties: {},
                    relations: {}
                };

                // Required fields
                if (mappings.identifier) {
                    entity.identifier = await this.runJq(mappings.identifier, payload);
                }
                if (mappings.title) {
                    entity.title = await this.runJq(mappings.title, payload);
                }

                // Properties
                if (mappings.properties) {
                    for (const [key, value] of Object.entries(mappings.properties)) {
                        if (typeof value === 'string' && value.startsWith('file://')) {
                            // Extract file path and fetch content from GitHub
                            const filePath = value.substring(7); // Remove 'file://' prefix
                            entity.properties[key] = await this.fetchFileContent(filePath, payload, installationId);
                        } else {
                            // Standard JQ processing
                            entity.properties[key] = await this.runJq(value as string, payload);
                        }
                    }
                }

                // Relations
                if (mappings.relations) {
                    for (const [key, jqQuery] of Object.entries(mappings.relations)) {
                        entity.relations![key] = await this.runJq(jqQuery as string, payload);
                    }
                }

                results.push(entity);
            } catch (e) {
                console.error(`Mapping failed for kind ${resource.kind}:`, e);
            }
        }

        return results;
    }

    /**
     * Fetches file content from GitHub repository
     * @param filePath Path to the file in the repository
     * @param payload The GitHub payload containing repository information
     * @param installationId GitHub App installation ID
     * @returns File content as string, or null if not available
     */
    private async fetchFileContent(filePath: string, payload: any, installationId?: number): Promise<string | null> {
        if (!installationId) {
            console.warn('⚠️ Cannot fetch file content: installationId not provided');
            return null;
        }

        try {
            // Extract repository context from payload
            const repository = payload.repository || payload.head?.repo || payload;

            if (!repository || !repository.full_name) {
                console.warn('⚠️ Cannot fetch file: repository information missing from payload');
                return null;
            }

            // Parse owner and repo from full_name (format: "owner/repo")
            const [owner, repo] = repository.full_name.split('/');

            if (!owner || !repo) {
                console.warn(`⚠️ Invalid repository full_name: ${repository.full_name}`);
                return null;
            }

            // Determine the ref (branch/commit) to fetch from
            const ref = repository.default_branch || payload.ref || undefined;

            // Import GitHubService dynamically to avoid circular dependencies
            const { gitHubService } = await import('./github.service.js');

            // Fetch file content
            return await gitHubService.getFileContent(installationId, owner, repo, filePath, ref);
        } catch (error: any) {
            console.error(`❌ Error in fetchFileContent for ${filePath}:`, error.message);
            return null;
        }
    }

    private async runJq(query: string, input: any): Promise<any> {
        // If query is a raw string literal in quotes (e.g. '"service"'), jq returns the string without quotes
        // If it's a field accessor (e.g. .name), it returns the value
        try {
            // jq.run returns a string representation of the output (unless output: 'json' is specified, which parses it back)
            // We use output: 'json' to get proper types (int, boolean, etc)
            return await jq.run(query, input, { input: 'json', output: 'json' });
        } catch (e) {
            // Fallback: if query is simple string not needing jq processing?
            // Actually, for user convenience, if it fails maybe return raw string?
            // But strict JQ is better.
            throw e;
        }
    }
}

export const mappingService = MappingService.getInstance();
