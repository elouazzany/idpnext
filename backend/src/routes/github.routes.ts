import express from 'express';
import { gitHubService } from '../services/github.service.js';
import { createNodeMiddleware } from "@octokit/webhooks";
import { prisma as db } from '../config/db.js';
import { mappingService } from '../services/mapping.service.js';
import { entityService } from '../services/entity.service.js';
import { pollingService } from '../services/polling.service.js';
import fs from 'fs';
import path from 'path';
const router = express.Router();

// Webhook handler
router.post('/webhook', async (req, res) => {
    try {
        if (!gitHubService.isInitialized()) {
            console.warn('⚠️ GitHub Service not initialized, ignoring webhook');
            return res.status(503).json({ error: 'GitHub Integration not configured' });
        }

        const app = gitHubService.getApp();

        // Verify and receive the webhook
        // Note: Express body parser might interfere if it parses JSON before signature verification.
        // Usually creationNodeMiddleware handles this, but since we are using a custom route,
        // we might need to be careful with body parsing.
        // For simplicity, we'll try to use the verifyAndReceive directly or use the middleware if possible.

        // However, since we already have body parsed by express.json() in server.ts,
        // verification might fail if we don't have the raw body.
        // See: https://github.com/octokit/webhooks.js/#middleware

        // Let's implement a simple handler for now that assumes signature is valid 
        // OR checks it if rawBody is available.
        // A better approach for Express is using `createNodeMiddleware` mounted on the path BEFORE body parser,
        // but here we are mounting router under `/api`.

        // Let's trust verifyAndReceive if we can pass the payload.

        await app.webhooks.verifyAndReceive({
            id: req.headers["x-github-delivery"] as string,
            name: req.headers["x-github-event"] as any,
            signature: req.headers["x-hub-signature-256"] as string,
            payload: req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body),
        }).catch((err) => {
            console.error('❌ Webhook verification failed:', err.message);
            // Don't fail the request to GitHub to avoid retries on bad signature? 
            // Actually we should fail.
            throw err;
        });

        if (req.headers["x-github-event"] === 'ping') {
            console.log('Received ping event');
            return res.status(200).send('pong');
        }

        const payload = req.body;
        const installationId = payload.installation?.id;

        if (!installationId) {
            console.warn('⚠️ Webhook payload missing installation.id');
            return res.status(200).send('ignored');
        }

        // Find configuration for this installation
        const config = await db.integrationConfig.findFirst({
            where: {
                installationId: String(installationId),
                provider: 'github'
            }
        });

        if (!config) {
            console.warn(`⚠️ No integration config found for installation ID: ${installationId}`);
            return res.status(200).send('not configured');
        }

        console.log(`Processing event for organization ${config.organizationId}`);

        // Determine kind from event type
        const eventType = req.headers["x-github-event"] as string;
        const kind = mapEventTypeToKind(eventType);

        if (!kind) {
            console.warn(`Unsupported event type: ${eventType}`);
            return res.status(200).send('event type not supported');
        }

        // Transform data
        let eventPayload = payload;
        if ('repository' in payload) {
            eventPayload = payload.repository;
        } else if (eventType == "pull_request") {
            eventPayload = payload;
        }
        const entities = await mappingService.transform(
            eventPayload,
            kind,
            config.mappingYaml,
            config.installationId ? parseInt(config.installationId) : undefined
        );
        console.log(`Mapped ${entities.length} entities from payload`);

        // Save entities
        const results = [];

        for (const entity of entities) {
            try {
                // Ensure required fields
                if (!entity.identifier || !entity.blueprint || !entity.title) {
                    console.warn('Skipping invalid entity:', entity);
                    continue;
                }

                const result = await entityService.create({
                    identifier: entity.identifier,
                    blueprintId: entity.blueprint,
                    title: entity.title,
                    properties: entity.properties,
                    relations: entity.relations,
                    organizationId: config.organizationId,
                    tenantId: config.tenantId || undefined,
                    createdBy: 'github-integration', // System user
                    icon: 'GitHub'
                });
                results.push(result);
            } catch (err: any) {
                console.error(`Failed to save entity ${entity.identifier}:`, err.message);
            }
        }

        console.log(`Successfully saved ${results.length} entities`);
        res.status(200).json({ processed: results.length });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Helper function to map GitHub event types to resource kinds
function mapEventTypeToKind(eventType: string): string | null {
    const mapping: Record<string, string> = {
        // Repositories
        'push': 'repository',
        'repository': 'repository',
        'create': 'repository', // Can also be branches/tags, handled by payload

        // Pull Requests
        'pull_request': 'pull-request',
        'pull_request_review': 'pull-request',
        'pull_request_review_comment': 'pull-request',

        // Issues
        'issues': 'issue',
        'issue_comment': 'issue',

        // Workflows
        'workflow_run': 'workflow-run',
        'workflow_job': 'workflow-job',
        'workflow_dispatch': 'workflow',

        // Deployments & Environments
        'deployment': 'deployment',
        'deployment_status': 'deployment',

        // Security
        'dependabot_alert': 'dependabot-alert',
        'code_scanning_alert': 'code-scanning',
        'secret_scanning_alert': 'code-scanning',

        // Teams & Users
        'team': 'team',
        'team_add': 'team',
        'member': 'user',
        'membership': 'team',

        // Releases
        'release': 'releases',

        // Branch protection
        'branch_protection_rule': 'branches',
    };

    return mapping[eventType] || null;
}

// Sync endpoint (Manual trigger)
router.post('/sync', async (req, res) => {
    try {
        // Run async (don't wait)
        pollingService.syncAll().catch(err => console.error('Sync failed:', err));
        res.json({ message: 'Sync started' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Post-installation setup redirect
router.get('/setup', async (req, res) => {
    try {
        const { installation_id, setup_action } = req.query;

        console.log(`🚀 GitHub setup redirect received for installation_id: ${installation_id}, action: ${setup_action}`);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Redirect to frontend setup page with query params
        res.redirect(`${frontendUrl}/github/setup?installation_id=${installation_id}&setup_action=${setup_action}`);
    } catch (error: any) {
        console.error('Setup redirect error:', error);
        res.status(500).send('Setup failed');
    }
});

// Endpoint to finalize setup (called by Frontend)
router.post('/setup', async (req, res) => {
    try {
        const { installationId, organizationId, tenantId } = req.body;

        if (!installationId || !organizationId) {
            return res.status(400).json({ error: 'Missing installationId or organizationId' });
        }

        const org = await db.organization.findUnique({ where: { id: organizationId } });
        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        if (tenantId) {
            const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
            if (tenant.organizationId !== organizationId) return res.status(400).json({ error: 'Tenant does not belong to organization' });
        }

        // Load default mapping from file
        const mappingPath = path.join(process.cwd(), 'resources', 'mapping.yaml');
        const defaultMapping = fs.readFileSync(mappingPath, 'utf-8');

        const config = await db.integrationConfig.upsert({
            where: {
                organizationId_provider_tenantId: {
                    organizationId,
                    provider: 'github',
                    tenantId: tenantId || null // Using null if tenantId is missing, matching schema if we allowed it?
                    // Wait, undefined vs null. Prisma needs exact match.
                    // If my schema has optional String?, I can pass null.
                    // BUT database constraint uses distinct nulls.
                    // If the unique index is on (org, provider, tenant), and tenant is null,
                    // we can have multiple rows with null tenant?
                    // No, Prisma @unique usually handles this in generated client to find ONE.
                    // But if underlying DB allows multiple, upsert/findUnique might fail if multiple exist.
                    // Assuming we keep just one "org-wide" config if tenantId is missing.
                }
            },
            update: {
                installationId: String(installationId),
                mappingYaml: defaultMapping
            },
            create: {
                provider: 'github',
                installationId: String(installationId),
                organizationId,
                tenantId: tenantId || null,
                mappingYaml: defaultMapping
            }
        });

        // Trigger initial sync
        pollingService.syncAll().catch(err => console.error('Initial sync failed:', err));

        res.json({ success: true, configId: config.id });
    } catch (error: any) {
        console.error('Setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update configuration
router.put('/config', async (req, res) => {
    try {
        const { organizationId, tenantId, mappingYaml } = req.body;

        if (!organizationId) {
            return res.status(400).json({ error: 'Missing organizationId' });
        }

        const where: any = {
            organizationId: String(organizationId),
            provider: 'github'
        };

        if (tenantId) {
            where.tenantId = String(tenantId);
        } else {
            where.tenantId = null;
        }

        const config = await db.integrationConfig.updateMany({
            where,
            data: {
                mappingYaml
            }
        });

        if (config.count === 0) {
            return res.status(404).json({ error: 'Configuration not found' });
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Config update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get configuration status
router.get('/config', async (req, res) => {
    try {
        const { organizationId, tenantId } = req.query;

        if (!organizationId) {
            return res.status(400).json({ error: 'Missing organizationId' });
        }

        const where: any = {
            organizationId: String(organizationId),
            provider: 'github'
        };

        if (tenantId) {
            where.tenantId = String(tenantId);
        } else {
            // If explicit query for no tenant? Or should we show organization-wide if tenantId is omitted?
            // The requirement says "with user orga/tenant".
            // If the user selects a tenant in the UI, we probably want to see config for that tenant OR org-wide config?
            // Usually, org-wide config applies to all tenants unless overridden?
            // Or maybe strict scoping?
            // For now, let's look for exact match if tenantId provided, or org-wide if not.
            // BUT, if I am in a tenant, I might want to see if there is an integration.
            // Let's stick to simple: query params define the scope.

            // If tenantId is NOT provided in query, we might explicitly look for where tenantId is null?
            // Yes, "Organization Wide" config has tenantId: null.
            where.tenantId = null;
        }

        const config = await db.integrationConfig.findFirst({
            where
        });

        if (!config) {
            return res.status(404).json({ installed: false });
        }

        res.json({ installed: true, config });
    } catch (error: any) {
        console.error('Config fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
