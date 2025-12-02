export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    provider: string;
    providerId: string;
    createdAt: string;
    updatedAt: string;
    organizations: UserOrganization[];
    tenants: UserTenant[];
    accounts: Account[];
}

export interface Account {
    id: string;
    userId: string;
    provider: string;
    providerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    settings: any;
    createdAt: string;
    updatedAt: string;
    members?: OrganizationMember[];
    tenants?: Tenant[];
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    organizationId: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    organization?: Organization;
}

export interface UserOrganization {
    id: string;
    userId: string;
    organizationId: string;
    role: 'owner' | 'admin' | 'member';
    createdAt: string;
    updatedAt: string;
    organization: Organization;
}

export interface UserTenant {
    id: string;
    userId: string;
    tenantId: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    tenant: Tenant;
}

export interface OrganizationMember {
    id: string;
    userId: string;
    organizationId: string;
    role: 'owner' | 'admin' | 'member';
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
    };
}

export interface Invitation {
    id: string;
    email: string;
    organizationId: string;
    role: string;
    token: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    expiresAt: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    organization?: Organization;
    createdBy?: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
    };
}

export interface AuthState {
    user: User | null;
    currentOrganization: Organization | null;
    currentTenant: Tenant | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export type OAuthProvider = 'google' | 'github';
