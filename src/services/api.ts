import { User, Organization, Invitation } from '@/types/auth';
import { getAuthHeader } from '@/utils/auth';

const API_BASE = '/api';

export const authApi = {
    // Get current user
    async getCurrentUser(): Promise<User> {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get current user');
        }

        return response.json();
    },

    // Logout
    async logout(): Promise<void> {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: getAuthHeader(),
        });
    },

    // Initiate OAuth login (redirects to backend)
    initiateOAuth(provider: 'google' | 'github', invitationToken?: string): void {
        const url = new URL(`${window.location.origin}${API_BASE}/auth/${provider}`);
        if (invitationToken) {
            url.searchParams.set('invitation', invitationToken);
        }
        window.location.href = url.toString();
    },
};

export const organizationsApi = {
    // Get organization
    async getOrganization(organizationId: string): Promise<Organization> {
        const response = await fetch(`${API_BASE}/organizations/${organizationId}`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get organization');
        }

        return response.json();
    },

    // Create organization
    async createOrganization(data: { name: string; slug?: string }): Promise<Organization> {
        const response = await fetch(`${API_BASE}/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create organization');
        }

        return response.json();
    },

    // Update organization
    async updateOrganization(
        organizationId: string,
        data: { name?: string; logoUrl?: string; settings?: any }
    ): Promise<Organization> {
        const response = await fetch(`${API_BASE}/organizations/${organizationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update organization');
        }

        return response.json();
    },

    // Get organization members
    async getMembers(organizationId: string) {
        const response = await fetch(`${API_BASE}/organizations/${organizationId}/members`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get members');
        }

        return response.json();
    },

    // Remove member
    async removeMember(organizationId: string, userId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/organizations/${organizationId}/members/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to remove member');
        }
    },
};

export const invitationsApi = {
    // Create invitation
    async createInvitation(data: {
        email: string;
        organizationId: string;
        role?: string;
    }): Promise<Invitation> {
        const response = await fetch(`${API_BASE}/invitations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create invitation');
        }

        return response.json();
    },

    // Get invitation by token
    async getInvitation(token: string): Promise<Invitation> {
        const response = await fetch(`${API_BASE}/invitations/${token}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get invitation');
        }

        return response.json();
    },

    // List organization invitations
    async listInvitations(organizationId: string): Promise<Invitation[]> {
        const response = await fetch(`${API_BASE}/invitations/organization/${organizationId}`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to list invitations');
        }

        return response.json();
    },

    // Revoke invitation
    async revokeInvitation(invitationId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/invitations/${invitationId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to revoke invitation');
        }
    },
};

export const tenantsApi = {
    // Get organization tenants
    async getTenants(organizationId: string) {
        const response = await fetch(`${API_BASE}/tenants/organization/${organizationId}`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get tenants');
        }

        return response.json();
    },

    // Create tenant
    async createTenant(organizationId: string, data: { name: string; slug: string; description?: string }) {
        const response = await fetch(`${API_BASE}/tenants/organization/${organizationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create tenant');
        }

        return response.json();
    },

    // Delete tenant
    async deleteTenant(tenantId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/tenants/${tenantId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete tenant');
        }
    },
};

export interface AuditLog {
    id: string;
    identifier: string;
    action: string;
    resourceType: string;
    status: string;
    message?: string;
    triggeredAt: string;
    triggeredBy: {
        appId?: string;
        userId?: string;
        orgId?: string;
    };
    origin: string;
    context?: Record<string, any>;
    additionalData?: Record<string, any>;
    user?: {
        id: string;
        email: string;
        name?: string;
        avatar?: string;
    };
    organization?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface AuditLogFilters {
    resources?: string[];
    action?: string[];
    status?: string[];
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export interface AuditLogResponse {
    ok: boolean;
    audits: AuditLog[];
    total: number;
    limit: number;
    offset: number;
}

export const auditLogsApi = {
    // Get audit logs with filters
    async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogResponse> {
        const params = new URLSearchParams();

        if (filters?.resources) {
            params.set('resources', filters.resources.join(','));
        }
        if (filters?.action) {
            params.set('action', filters.action.join(','));
        }
        if (filters?.status) {
            params.set('status', filters.status.join(','));
        }
        if (filters?.userId) {
            params.set('userId', filters.userId);
        }
        if (filters?.startDate) {
            params.set('startDate', filters.startDate);
        }
        if (filters?.endDate) {
            params.set('endDate', filters.endDate);
        }
        if (filters?.limit) {
            params.set('limit', filters.limit.toString());
        }
        if (filters?.offset) {
            params.set('offset', filters.offset.toString());
        }

        // Add includes for all fields
        const includes = ['identifier', 'trigger', 'context', 'action', 'status', 'resourceType', 'additionalData', 'message'];
        includes.forEach(inc => params.append('includes', inc));

        const response = await fetch(`${API_BASE}/v1/audit-log?${params.toString()}`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get audit logs');
        }

        return response.json();
    },

    // Get single audit log by identifier
    async getAuditLog(identifier: string): Promise<{ ok: boolean; audit: AuditLog }> {
        const response = await fetch(`${API_BASE}/v1/audit-log/${identifier}`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get audit log');
        }

        return response.json();
    },

    // Get audit log with diff
    async getAuditLogWithDiff(identifier: string): Promise<{ ok: boolean; audit: AuditLog }> {
        const params = new URLSearchParams();
        params.append('includes', 'additionalData');
        params.append('includes', 'identifier');
        params.append('includes', 'trigger');
        params.append('includes', 'context');
        params.append('includes', 'action');
        params.append('includes', 'status');
        params.append('includes', 'resourceType');
        params.append('includes', 'message');

        const response = await fetch(`${API_BASE}/v1/audit-log/${identifier}?${params.toString()}`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get audit log with diff');
        }

        return response.json();
    },

    // Get audit statistics
    async getAuditStats(): Promise<any> {
        const response = await fetch(`${API_BASE}/v1/audit-log/stats`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Failed to get audit stats');
        }

        return response.json();
    },
};
