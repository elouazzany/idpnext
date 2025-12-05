import { Router } from 'express';
import * as auditLogController from '../controllers/audit-log.controller.js';
import { requireAuth, requireOrganization, requireRole } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Organization-scoped audit logs
router.get(
    '/organizations/:organizationId/audit-logs',
    requireOrganization,
    requireRole(['owner', 'admin']),
    auditLogController.getAuditLogs
);

router.get(
    '/organizations/:organizationId/audit-logs/stats',
    requireOrganization,
    requireRole(['owner', 'admin']),
    auditLogController.getAuditStats
);

router.get(
    '/organizations/:organizationId/audit-logs/:id',
    requireOrganization,
    requireRole(['owner', 'admin']),
    auditLogController.getAuditLog
);

// Legacy v1 endpoint for compatibility with frontend
router.get(
    '/v1/audit-log',
    auditLogController.getAuditLogs
);

router.get(
    '/v1/audit-log/stats',
    auditLogController.getAuditStats
);

router.get(
    '/v1/audit-log/:identifier',
    auditLogController.getAuditLogByIdentifier
);

// Create audit log (for testing/manual entries)
router.post(
    '/organizations/:organizationId/audit-logs',
    requireOrganization,
    requireRole(['owner', 'admin']),
    auditLogController.createAuditLog
);

export default router;
