import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization, Tenant } from '@/types/auth';
import { authStorage } from '@/utils/auth';
import { authApi, organizationsApi, tenantsApi } from '@/services/api';

interface AuthContextType {
    user: User | null;
    currentOrganization: Organization | null;
    currentTenant: Tenant | null;
    availableTenants: Tenant[];
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    switchOrganization: (organizationId: string) => Promise<void>;
    switchTenant: (tenantId: string) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from storage
    useEffect(() => {
        const initAuth = async () => {
            const token = authStorage.getToken();

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const userData = await authApi.getCurrentUser();
                setUser(userData);

                // Set current organization (from storage or first available)
                const storedOrgId = authStorage.getCurrentOrganization();
                const userOrg = userData.organizations.find(
                    (org) => org.organizationId === storedOrgId
                ) || userData.organizations[0];

                if (userOrg) {
                    await switchOrganization(userOrg.organizationId);
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                authStorage.clear();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (token: string) => {
        authStorage.setToken(token);

        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);

            // Set default organization
            if (userData.organizations.length > 0) {
                await switchOrganization(userData.organizations[0].organizationId);
            }
        } catch (error) {
            console.error('Login failed:', error);
            authStorage.clear();
            throw error;
        }
    };

    const logout = () => {
        authApi.logout().catch(console.error);
        authStorage.clear();
        setUser(null);
        setCurrentOrganization(null);
        setCurrentTenant(null);
        setAvailableTenants([]);
        window.location.href = '/login';
    };

    const switchOrganization = async (organizationId: string) => {
        try {
            const org = await organizationsApi.getOrganization(organizationId);
            setCurrentOrganization(org);
            authStorage.setCurrentOrganization(organizationId);

            // Load tenants for this organization
            const tenants = await tenantsApi.getTenants(organizationId);
            setAvailableTenants(tenants);

            // Set current tenant (from storage or default)
            const storedTenantId = authStorage.getCurrentTenant();
            const defaultTenant = tenants.find((t: Tenant) => t.isDefault) || tenants[0];

            // If stored tenant exists in the new list, use it. Otherwise use default.
            const tenantToSelect = tenants.find((t: Tenant) => t.id === storedTenantId) || defaultTenant;

            if (tenantToSelect) {
                setCurrentTenant(tenantToSelect);
                authStorage.setCurrentTenant(tenantToSelect.id);
            }
        } catch (error) {
            console.error('Failed to switch organization:', error);
        }
    };

    const switchTenant = (tenantId: string) => {
        const tenant = availableTenants.find((t) => t.id === tenantId);
        if (tenant) {
            setCurrentTenant(tenant);
            authStorage.setCurrentTenant(tenantId);
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);

            // Also refresh current organization if one is selected
            if (currentOrganization) {
                const orgData = await organizationsApi.getOrganization(currentOrganization.id);
                setCurrentOrganization(orgData);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value: AuthContextType = {
        user,
        currentOrganization,
        currentTenant,
        availableTenants,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchOrganization,
        switchTenant,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
