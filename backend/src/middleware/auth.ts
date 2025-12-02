import { Request, Response, NextFunction } from 'express';
import { passport } from '../config/passport.js';
import { prisma } from '../config/db.js';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
    user?: any;
    organizationId?: string;
    tenantId?: string;
}

// Middleware to require authentication
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
        if (err) {
            return res.status(500).json({ error: 'Authentication error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = user;
        next();
    })(req, res, next);
};

// Middleware to check organization membership
export const requireOrganization = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { organizationId } = req.params;
        const userId = req.user?.id;

        if (!userId || !organizationId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const membership = await prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (!membership) {
            return res.status(403).json({ error: 'Access denied to organization' });
        }

        req.organizationId = organizationId;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify organization access' });
    }
};

// Middleware to check tenant access
export const requireTenant = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { tenantId } = req.params;
        const userId = req.user?.id;

        if (!userId || !tenantId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const tenantAccess = await prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId,
                    tenantId,
                },
            },
        });

        if (!tenantAccess) {
            return res.status(403).json({ error: 'Access denied to tenant' });
        }

        req.tenantId = tenantId;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify tenant access' });
    }
};

// Middleware to check if user has a specific role in an organization
export const requireRole = (allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const organizationId = req.organizationId || req.params.organizationId;
            const userId = req.user?.id;

            if (!userId || !organizationId) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const membership = await prisma.userOrganization.findUnique({
                where: {
                    userId_organizationId: {
                        userId,
                        organizationId,
                    },
                },
            });

            if (!membership || !allowedRoles.includes(membership.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify role' });
        }
    };
};

// Optional auth - doesn't fail if user is not authenticated
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
        if (!err && user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};
