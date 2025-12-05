import { Request, Response } from 'express';
import { auditLogService, AuditLogFilters } from '../services/audit-log.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const {
            identifier,
            blueprint,
            entity,
            resources,
            action,
            actionType,
            status,
            userId,
            startDate,
            endDate,
            from,
            to,
            limit,
            offset
        } = req.query;

        // Use organizationId from auth context if available
        const organizationId = req.organizationId;

        // Parse resource types (can be comma-separated)
        let resourceType: string | string[] | undefined;
        if (resources) {
            resourceType = typeof resources === 'string'
                ? resources.split(',').map(r => r.trim())
                : resources as string[];
        }

        const filters: AuditLogFilters = {
            organizationId,
            userId: userId as string,
            identifier: identifier as string,
            blueprint: blueprint as string,
            entity: entity as string,
            resourceType,
            action: action as string | string[],
            actionType: actionType as string | string[],
            status: status as string | string[],
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            from: from ? new Date(from as string) : undefined,
            to: to ? new Date(to as string) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            offset: offset ? parseInt(offset as string, 10) : undefined
        };

        const result = await auditLogService.getAll(filters);
        res.json(result);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch audit logs'
        });
    }
};

export const getAuditLog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const auditLog = await auditLogService.getById(id);

        if (!auditLog) {
            return res.status(404).json({
                ok: false,
                error: 'Audit log not found'
            });
        }

        res.json({
            ok: true,
            audit: auditLog
        });
    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch audit log'
        });
    }
};

export const getAuditLogByIdentifier = async (req: Request, res: Response) => {
    try {
        const { identifier } = req.params;

        const auditLog = await auditLogService.getByIdentifier(identifier);

        if (!auditLog) {
            return res.status(404).json({
                ok: false,
                error: 'Audit log not found'
            });
        }

        res.json({
            ok: true,
            audit: auditLog
        });
    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch audit log'
        });
    }
};

export const getAuditStats = async (req: AuthRequest, res: Response) => {
    try {
        const organizationId = req.organizationId;

        const stats = await auditLogService.getStats(organizationId);

        res.json({
            ok: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch audit statistics'
        });
    }
};

export const createAuditLog = async (req: AuthRequest, res: Response) => {
    try {
        const auditLog = await auditLogService.create({
            ...req.body,
            organizationId: req.organizationId,
            userId: req.user?.id
        });

        res.status(201).json({
            ok: true,
            audit: auditLog
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to create audit log'
        });
    }
};
