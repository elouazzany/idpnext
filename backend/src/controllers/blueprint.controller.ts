import { Request, Response } from 'express';
import { blueprintService } from '../services/blueprint.service.js';
import { auditLogService } from '../services/audit-log.service.js';
import { validateBlueprintSchema } from '../services/blueprint-validation.js';

export const getBlueprints = async (req: Request, res: Response) => {
    try {
        const organizationId = req.headers['x-organization-id'] as string;
        const tenantId = req.headers['x-tenant-id'] as string;

        const blueprints = await blueprintService.getAll(organizationId, tenantId);
        res.json({
            ok: true,
            blueprints
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch blueprints'
        });
    }
};

export const getBlueprint = async (req: Request, res: Response) => {
    try {
        const organizationId = req.headers['x-organization-id'] as string;
        const tenantId = req.headers['x-tenant-id'] as string;

        // Try to find by identifier first as it covers _user, _team etc
        let blueprint = await blueprintService.getByIdentifier(req.params.id, organizationId, tenantId);

        // If not found, try by ID (UUID)
        if (!blueprint) {
            const byId = await blueprintService.getById(req.params.id);
            // Verify ownership
            if (byId && (byId.organizationId === organizationId && byId.tenantId === tenantId)) {
                blueprint = byId;
            }
        }
        if (!blueprint) {
            return res.status(404).json({
                ok: false,
                error: 'Blueprint not found'
            });
        }
        res.json({
            ok: true,
            blueprint
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch blueprint'
        });
    }
};

export const createBlueprint = async (req: Request, res: Response) => {
    try {
        const organizationId = req.headers['x-organization-id'] as string;
        const tenantId = req.headers['x-tenant-id'] as string;

        // Validate blueprint schema
        const validationResult = validateBlueprintSchema(req.body);
        if (!validationResult.success) {
            return res.status(422).json({
                ok: false,
                error: 'Blueprint validation failed',
                details: validationResult.errors
            });
        }

        const blueprintData = {
            ...validationResult.data,
            createdBy: (req as any).user?.id,
            organizationId,
            tenantId
        };

        const blueprint = await blueprintService.create(blueprintData);

        // Log audit
        await auditLogService.create({
            action: 'CREATE',
            resourceType: 'blueprint',
            status: 'SUCCESS',
            triggeredBy: { userId: (req as any).user?.id, orgId: organizationId },
            origin: 'UI',
            userId: (req as any).user?.id,
            organizationId,
            context: {
                blueprintIdentifier: blueprint.identifier,
                blueprintTitle: blueprint.title,
                blueprintIcon: blueprint.icon,
                tenantId
            }
        });

        res.status(201).json({
            ok: true,
            blueprint
        });
    } catch (error) {
        // Log failure
        await auditLogService.create({
            action: 'CREATE',
            resourceType: 'blueprint',
            status: 'FAILURE',
            message: error instanceof Error ? error.message : 'Unknown error',
            triggeredBy: { userId: (req as any).user?.id },
            origin: 'UI',
            userId: (req as any).user?.id
        });

        res.status(500).json({
            ok: false,
            error: 'Failed to create blueprint'
        });
    }
};

export const updateBlueprint = async (req: Request, res: Response) => {
    try {
        const organizationId = req.headers['x-organization-id'] as string;
        const tenantId = req.headers['x-tenant-id'] as string;

        // Get current state before update
        // Get current state before update
        // Try to find by identifier first
        let beforeState = await blueprintService.getByIdentifier(req.params.id, organizationId, tenantId);

        if (!beforeState) {
            const byId = await blueprintService.getById(req.params.id);
            if (byId && (byId.organizationId === organizationId && byId.tenantId === tenantId)) {
                beforeState = byId;
            }
        }

        if (!beforeState) {
            return res.status(404).json({
                ok: false,
                error: 'Blueprint not found'
            });
        }

        // Validate the update data (partial validation for updates)
        // Merge with existing data for validation
        const mergedData = {
            ...beforeState,
            ...req.body,
            identifier: req.params.id // Keep original identifier
        };

        const validationResult = validateBlueprintSchema(mergedData);
        if (!validationResult.success) {
            return res.status(422).json({
                ok: false,
                error: 'Blueprint validation failed',
                details: validationResult.errors
            });
        }

        const updateData = {
            ...req.body,
            updatedBy: (req as any).user?.id
        };

        const blueprint = await blueprintService.update(beforeState.identifier, organizationId, tenantId, updateData);

        // Log audit with diff
        await auditLogService.create({
            action: 'UPDATE',
            resourceType: 'blueprint',
            status: 'SUCCESS',
            triggeredBy: { userId: (req as any).user?.id, orgId: organizationId },
            origin: 'UI',
            userId: (req as any).user?.id,
            organizationId,
            context: {
                blueprintIdentifier: blueprint.identifier,
                blueprintTitle: blueprint.title,
                blueprintIcon: blueprint.icon,
                tenantId,
                changes: req.body
            },
            additionalData: {
                diff: {
                    before: beforeState,
                    after: blueprint
                }
            }
        });

        res.json({
            ok: true,
            blueprint
        });
    } catch (error) {
        await auditLogService.create({
            action: 'UPDATE',
            resourceType: 'blueprint',
            status: 'FAILURE',
            message: error instanceof Error ? error.message : 'Unknown error',
            triggeredBy: { userId: (req as any).user?.id },
            origin: 'UI',
            userId: (req as any).user?.id,
            context: { blueprintIdentifier: req.params.id }
        });

        res.status(500).json({
            ok: false,
            error: 'Failed to update blueprint'
        });
    }
};

export const deleteBlueprint = async (req: Request, res: Response) => {
    try {
        const organizationId = req.headers['x-organization-id'] as string;
        const tenantId = req.headers['x-tenant-id'] as string;

        console.log('Deleting blueprint with identifier:', req.params.id);

        // Get blueprint details before deletion
        // Get blueprint details before deletion
        // Try to find by identifier first
        let blueprint = await blueprintService.getByIdentifier(req.params.id, organizationId, tenantId);

        if (!blueprint) {
            const byId = await blueprintService.getById(req.params.id);
            if (byId && (byId.organizationId === organizationId && byId.tenantId === tenantId)) {
                blueprint = byId;
            }
        }

        if (!blueprint) {
            console.log('Blueprint not found for deletion:', req.params.id);
            return res.status(404).json({
                ok: false,
                error: 'Blueprint not found'
            });
        }

        await blueprintService.delete(blueprint.identifier, organizationId, tenantId);

        // Log audit
        await auditLogService.create({
            action: 'DELETE',
            resourceType: 'blueprint',
            status: 'SUCCESS',
            triggeredBy: { userId: (req as any).user?.id, orgId: organizationId },
            origin: 'UI',
            userId: (req as any).user?.id,
            organizationId,
            context: {
                blueprintIdentifier: blueprint.identifier,
                blueprintTitle: blueprint.title,
                blueprintIcon: blueprint.icon,
                tenantId
            }
        });

        res.status(204).send();
    } catch (error) {
        await auditLogService.create({
            action: 'DELETE',
            resourceType: 'blueprint',
            status: 'FAILURE',
            message: error instanceof Error ? error.message : 'Unknown error',
            triggeredBy: { userId: (req as any).user?.id },
            origin: 'UI',
            userId: (req as any).user?.id,
            context: { blueprintIdentifier: req.params.id }
        });

        res.status(500).json({
            ok: false,
            error: 'Failed to delete blueprint'
        });
    }
};
