const TOKEN_KEY = 'idp_auth_token';
const CURRENT_ORG_KEY = 'idp_current_org';
const CURRENT_TENANT_KEY = 'idp_current_tenant';

export const authStorage = {
    // Token management
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    // Organization management
    setCurrentOrganization(orgId: string): void {
        localStorage.setItem(CURRENT_ORG_KEY, orgId);
    },

    getCurrentOrganization(): string | null {
        return localStorage.getItem(CURRENT_ORG_KEY);
    },

    removeCurrentOrganization(): void {
        localStorage.removeItem(CURRENT_ORG_KEY);
    },

    // Tenant management
    setCurrentTenant(tenantId: string): void {
        localStorage.setItem(CURRENT_TENANT_KEY, tenantId);
    },

    getCurrentTenant(): string | null {
        return localStorage.getItem(CURRENT_TENANT_KEY);
    },

    removeCurrentTenant(): void {
        localStorage.removeItem(CURRENT_TENANT_KEY);
    },

    // Clear all auth data
    clear(): void {
        this.removeToken();
        this.removeCurrentOrganization();
        this.removeCurrentTenant();
    },
};

// Get auth header for API requests
export const getAuthHeader = (): { Authorization: string } | {} => {
    const token = authStorage.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
