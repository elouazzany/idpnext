import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure tenant and organization context is present in request headers
 * This middleware validates that multi-tenancy context is provided for all tenant-scoped operations
 */
export const requireTenantContext = (options?: {
    requireOrganization?: boolean;
    requireTenant?: boolean;
}) => {
    const requireOrg = options?.requireOrganization !== false; // Default true
    const requireTen = options?.requireTenant ?? false; // Default false (tenant is optional)

    return (req: Request, res: Response, next: NextFunction) => {
        const organizationId = req.headers['x-organization-id'] as string;
        const tenantId = req.headers['x-tenant-id'] as string;

        // Check organization requirement
        if (requireOrg && !organizationId) {
            return res.status(400).json({
                ok: false,
                error: 'Missing required header: x-organization-id'
            });
        }

        // Check tenant requirement
        if (requireTen && !tenantId) {
            return res.status(400).json({
                ok: false,
                error: 'Missing required header: x-tenant-id'
            });
        }

        next();
    };
};

/**
 * Middleware to require both organization and tenant context
 */
export const requireFullTenantContext = requireTenantContext({
    requireOrganization: true,
    requireTenant: true
});

/**
 * Middleware to require only organization context (tenant optional)
 */
export const requireOrganizationContext = requireTenantContext({
    requireOrganization: true,
    requireTenant: false
});
