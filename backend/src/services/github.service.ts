import { App } from 'octokit';
import { env } from '../config/env.js';

export class GitHubService {
    private app: App | null = null;
    private static instance: GitHubService;

    private constructor() {
        if (env.GITHUB_APP_ID && env.GITHUB_APP_PRIVATE_KEY && env.GITHUB_WEBHOOK_SECRET) {
            this.app = new App({
                appId: env.GITHUB_APP_ID,
                privateKey: env.GITHUB_APP_PRIVATE_KEY,
                webhooks: {
                    secret: env.GITHUB_WEBHOOK_SECRET,
                },
            });
            console.log('✅ GitHub App initialized');
        } else {
            console.warn('⚠️ GitHub App credentials missing, skipping initialization');
        }
    }

    public static getInstance(): GitHubService {
        if (!GitHubService.instance) {
            GitHubService.instance = new GitHubService();
        }
        return GitHubService.instance;
    }

    public isInitialized(): boolean {
        return this.app !== null;
    }

    public getApp(): App {
        if (!this.app) {
            throw new Error('GitHub App not initialized');
        }
        return this.app;
    }

    /**
     * Get an authenticated Octokit instance for a specific installation
     * @param installationId The installation ID from the webhook or config
     */
    public async getInstallationClient(installationId: number) {
        if (!this.app) {
            throw new Error('GitHub App not initialized');
        }
        return await this.app.getInstallationOctokit(installationId);
    }

    /**
     * Fetch file content from a GitHub repository
     * @param installationId GitHub App installation ID
     * @param owner Repository owner
     * @param repo Repository name
     * @param path File path within the repository
     * @param ref Optional branch/commit reference (defaults to default branch)
     * @returns File content as string, or null if file doesn't exist
     */
    public async getFileContent(
        installationId: number,
        owner: string,
        repo: string,
        path: string,
        ref?: string
    ): Promise<string | null> {
        try {
            const octokit = await this.getInstallationClient(installationId);

            console.log(`📄 Fetching file: ${owner}/${repo}/${path}${ref ? ` (ref: ${ref})` : ''}`);

            const response = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                ...(ref && { ref })
            });

            // Check if response is a file (not a directory or symlink)
            if ('content' in response.data && response.data.type === 'file') {
                // Decode base64 content
                const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
                console.log(`✅ File fetched successfully: ${path} (${content.length} bytes)`);
                return content;
            } else {
                console.warn(`⚠️ Path is not a file: ${path}`);
                return null;
            }
        } catch (error: any) {
            if (error.status === 404) {
                console.warn(`⚠️ File not found: ${owner}/${repo}/${path}`);
                return null;
            }
            console.error(`❌ Error fetching file ${path}:`, error.message);
            return null;
        }
    }
}

export const gitHubService = GitHubService.getInstance();
