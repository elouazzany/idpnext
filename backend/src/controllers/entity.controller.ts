import { Request, Response } from 'express';
import { entityService } from '../services/entity.service.js';

export class EntityController {
    /**
     * GET /v1/blueprints/:blueprint_identifier/entities
     * Get all entities of a blueprint
     */
    async getAll(req: Request, res: Response) {
        try {
            const { blueprint_identifier } = req.params;
            const { limit, offset } = req.query;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            const result = await entityService.getAll(
                blueprint_identifier,
                organizationId,
                tenantId,
                limit ? parseInt(limit as string) : undefined,
                offset ? parseInt(offset as string) : undefined
            );

            res.json({
                ok: true,
                entities: result.entities,
                total: result.total
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * GET /v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     * Get a single entity
     */
    async getOne(req: Request, res: Response) {
        try {
            const { blueprint_identifier, entity_identifier } = req.params;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            const entity = await entityService.getByIdentifier(
                blueprint_identifier,
                entity_identifier,
                organizationId,
                tenantId
            );

            if (!entity) {
                return res.status(404).json({
                    ok: false,
                    error: 'A resource with the provided identifier was not found'
                });
            }

            res.json({
                ok: true,
                entity
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * GET /v1/blueprints/:blueprint_identifier/entities-count
     * Get entity count for a blueprint
     */
    async getCount(req: Request, res: Response) {
        try {
            const { blueprint_identifier } = req.params;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            const count = await entityService.getCount(
                blueprint_identifier,
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                count
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /v1/blueprints/:blueprint_identifier/entities
     * Create an entity
     */
    async create(req: Request, res: Response) {
        try {
            const { blueprint_identifier } = req.params;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;
            const userId = (req as any).user?.id;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            const entity = await entityService.create({
                ...req.body,
                blueprintId: blueprint_identifier,
                createdBy: userId,
                organizationId,
                tenantId
            });

            res.status(201).json({
                ok: true,
                entity
            });
        } catch (error: any) {
            if (error.message.includes('schema')) {
                return res.status(422).json({
                    ok: false,
                    error: 'JSON does not match the route\'s schema'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /v1/blueprints/:blueprint_identifier/entities/bulk
     * Create multiple entities
     */
    async createMany(req: Request, res: Response) {
        try {
            const { blueprint_identifier } = req.params;
            const { entities } = req.body;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;
            const userId = (req as any).user?.id;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            if (!entities || !Array.isArray(entities)) {
                return res.status(422).json({
                    ok: false,
                    error: 'Request must include an "entities" array'
                });
            }

            if (entities.length > 20) {
                return res.status(422).json({
                    ok: false,
                    error: 'No more than 20 entities per request'
                });
            }

            const entitiesWithUser = entities.map(e => ({
                ...e,
                createdBy: userId
            }));

            const result = await entityService.createMany(
                blueprint_identifier,
                entitiesWithUser,
                organizationId,
                tenantId
            );

            res.status(result.status).json({
                ok: result.status === 200,
                results: result.results
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * PATCH /v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     * Update an entity (partial)
     */
    async update(req: Request, res: Response) {
        try {
            const { blueprint_identifier, entity_identifier } = req.params;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;
            const userId = (req as any).user?.id;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            const entity = await entityService.update(
                blueprint_identifier,
                entity_identifier,
                {
                    ...req.body,
                    updatedBy: userId
                },
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                entity
            });
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({
                    ok: false,
                    error: 'A resource with the provided identifier was not found'
                });
            }
            if (error.message.includes('schema')) {
                return res.status(422).json({
                    ok: false,
                    error: 'JSON does not match the route\'s schema'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * PUT /v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     * Replace an entity (full)
     */
    async replace(req: Request, res: Response) {
        try {
            const { blueprint_identifier, entity_identifier } = req.params;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;
            const userId = (req as any).user?.id;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            const entity = await entityService.replace(
                blueprint_identifier,
                entity_identifier,
                {
                    ...req.body,
                    identifier: entity_identifier,
                    blueprintId: blueprint_identifier,
                    createdBy: userId
                },
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                entity
            });
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({
                    ok: false,
                    error: 'A resource with the provided identifier was not found'
                });
            }
            if (error.message.includes('schema')) {
                return res.status(422).json({
                    ok: false,
                    error: 'JSON does not match the route\'s schema'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * DELETE /v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     * Delete an entity
     */
    async delete(req: Request, res: Response) {
        try {
            const { blueprint_identifier, entity_identifier } = req.params;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;
            const userId = (req as any).user?.id;

            await entityService.delete(
                blueprint_identifier,
                entity_identifier,
                organizationId,
                tenantId,
                userId
            );

            res.json({
                ok: true,
                message: 'Entities deleted successfully'
            });
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({
                    ok: false,
                    error: 'A resource with the provided identifier was not found'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * DELETE /v1/blueprints/:blueprint_identifier/all-entities
     * Delete all entities of a blueprint
     */
    async deleteAll(req: Request, res: Response) {
        try {
            const { blueprint_identifier } = req.params;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            await entityService.deleteAll(
                blueprint_identifier,
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                message: 'Entities deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /v1/blueprints/:blueprint_identifier/bulk/entities/delete
     * Delete multiple entities
     */
    async deleteMany(req: Request, res: Response) {
        try {
            const { blueprint_identifier } = req.params;
            const { identifiers, delete_dependents = false } = req.body;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            if (!identifiers || !Array.isArray(identifiers)) {
                return res.status(422).json({
                    ok: false,
                    error: 'Request must include an "identifiers" array'
                });
            }

            if (identifiers.length > 100) {
                return res.status(422).json({
                    ok: false,
                    error: 'Up to 100 entities per request'
                });
            }

            const results = await entityService.deleteMany(
                blueprint_identifier,
                identifiers,
                delete_dependents,
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                message: 'Entities deleted successfully',
                results
            });
        } catch (error: any) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /v1/entities/search
     * Search entities
     */
    async search(req: Request, res: Response) {
        try {
            const { rules, combinator, limit, offset } = req.body;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            const result = await entityService.search(
                { rules, combinator },
                organizationId,
                tenantId,
                limit,
                offset
            );

            res.json({
                ok: true,
                entities: result.entities,
                total: result.total
            });
        } catch (error: any) {
            if (error.message.includes('schema')) {
                return res.status(422).json({
                    ok: false,
                    error: 'JSON does not match the route\'s schema'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /v1/entities/aggregate
     * Aggregate entities
     */
    async aggregate(req: Request, res: Response) {
        try {
            const { blueprintId, function: aggFunction, property, groupBy, rules } = req.body;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            if (!blueprintId || !aggFunction) {
                return res.status(422).json({
                    ok: false,
                    error: 'blueprintId and function are required'
                });
            }

            const result = await entityService.aggregate(
                blueprintId,
                { function: aggFunction, property, groupBy, rules },
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                result
            });
        } catch (error: any) {
            if (error.message.includes('schema')) {
                return res.status(422).json({
                    ok: false,
                    error: 'JSON does not match the route\'s schema'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /v1/entities/properties-history
     * Get entity property history
     */
    async getHistory(req: Request, res: Response) {
        try {
            const { blueprintId, identifier, properties, startDate, endDate } = req.body;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            if (!blueprintId || !identifier) {
                return res.status(422).json({
                    ok: false,
                    error: 'blueprintId and identifier are required'
                });
            }

            const history = await entityService.getHistory(
                blueprintId,
                identifier,
                properties,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined,
                organizationId,
                tenantId
            );

            res.json({
                ok: true,
                history
            });
        } catch (error: any) {
            if (error.message.includes('schema')) {
                return res.status(422).json({
                    ok: false,
                    error: 'JSON does not match the route\'s schema'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    /**
     * POST /v1/blueprints/:blueprint_identifier/entities/search
     * Search entities within a specific blueprint
     */
    async searchInBlueprint(req: Request, res: Response) {
        try {
            const { blueprint_identifier } = req.params;
            const { rules, combinator, limit, offset } = req.body;
            const organizationId = (req as any).user?.organizationId;
            const tenantId = (req as any).user?.tenantId;

            // Check request size
            const requestSize = JSON.stringify(req.body).length;
            if (requestSize > 1024 * 1024) { // 1 MiB
                return res.status(413).json({
                    ok: false,
                    error: 'Request body is too large (limit is 1MiB)'
                });
            }

            // Add blueprint filter to rules
            const blueprintRules = [
                ...(rules || []),
                { property: 'blueprintId', operator: 'eq', value: blueprint_identifier }
            ];

            const result = await entityService.search(
                { rules: blueprintRules, combinator: 'and' },
                organizationId,
                tenantId,
                limit,
                offset
            );

            res.json({
                ok: true,
                entities: result.entities,
                total: result.total
            });
        } catch (error: any) {
            if (error.message.includes('schema')) {
                return res.status(422).json({
                    ok: false,
                    error: 'JSON does not match the route\'s schema'
                });
            }
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }
}

export const entityController = new EntityController();
