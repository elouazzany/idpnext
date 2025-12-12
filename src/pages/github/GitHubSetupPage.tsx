import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { tenantsApi } from '@/services/api';
import { Building2, Github, CheckCircle, AlertCircle, Layers } from 'lucide-react';
import { getAuthHeader } from '@/utils/auth';
import { Tenant } from '@/types/auth';

export const GitHubSetupPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingTenants, setFetchingTenants] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const installationId = searchParams.get('installation_id');
    // const setupAction = searchParams.get('setup_action'); // Unused for now

    useEffect(() => {
        if (user && user.organizations.length > 0 && !selectedOrgId) {
            setSelectedOrgId(user.organizations[0].organizationId);
        }
    }, [user, selectedOrgId]);

    useEffect(() => {
        const fetchTenants = async () => {
            if (!selectedOrgId) {
                setTenants([]);
                setSelectedTenantId('');
                return;
            }

            setFetchingTenants(true);
            try {
                const fetchedTenants = await tenantsApi.getTenants(selectedOrgId);
                setTenants(fetchedTenants);

                // Select default tenant if available, or the first one
                const defaultTenant = fetchedTenants.find((t: Tenant) => t.isDefault);
                if (defaultTenant) {
                    setSelectedTenantId(defaultTenant.id);
                } else if (fetchedTenants.length > 0) {
                    setSelectedTenantId(fetchedTenants[0].id);
                } else {
                    setSelectedTenantId('');
                }
            } catch (err) {
                console.error('Failed to fetch tenants:', err);
                // Don't block setup if tenants fail? Or show error?
                // Probably show error or empty list.
                setTenants([]);
                setSelectedTenantId('');
            } finally {
                setFetchingTenants(false);
            }
        };

        fetchTenants();
    }, [selectedOrgId]);

    const handleSetup = async () => {
        if (!installationId || !selectedOrgId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/github/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader(),
                },
                body: JSON.stringify({
                    installationId,
                    organizationId: selectedOrgId,
                    tenantId: selectedTenantId || undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to complete setup');
            }

            // Success! Redirect to data sources
            // Maybe add specific handling for tenant-context redirection?
            navigate('/admin/data-sources');
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (!installationId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900">Invalid Setup Link</h1>
                    <p className="text-gray-600 mt-2">Missing installation ID.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4 shadow-lg">
                        <Github className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect GitHub</h1>
                    <p className="text-gray-600">
                        Link your GitHub App installation to an organization and tenant.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Organization Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Organization
                        </label>
                        {user?.organizations.length === 0 ? (
                            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                                No organizations found. Please create one first.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {user?.organizations.map((org) => (
                                    <label
                                        key={org.organizationId}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${selectedOrgId === org.organizationId
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="organization"
                                            value={org.organizationId}
                                            checked={selectedOrgId === org.organizationId}
                                            onChange={(e) => setSelectedOrgId(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {org.organization.name}
                                            </span>
                                        </div>
                                        {selectedOrgId === org.organizationId && (
                                            <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tenant Selection */}
                    {selectedOrgId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Tenant (Optional)
                            </label>
                            {fetchingTenants ? (
                                <div className="text-sm text-gray-500 p-2">Loading tenants...</div>
                            ) : tenants.length === 0 ? (
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                                    No tenants found. Setup will be applied organization-wide (default).
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${!selectedTenantId
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="tenant"
                                            value=""
                                            checked={!selectedTenantId}
                                            onChange={() => setSelectedTenantId('')}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Layers className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">Organization Wide</span>
                                                <span className="text-xs text-gray-500">Apply to all tenants</span>
                                            </div>
                                        </div>
                                        {!selectedTenantId && (
                                            <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                                        )}
                                    </label>

                                    {tenants.map((tenant) => (
                                        <label
                                            key={tenant.id}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${selectedTenantId === tenant.id
                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="tenant"
                                                value={tenant.id}
                                                checked={selectedTenantId === tenant.id}
                                                onChange={(e) => setSelectedTenantId(e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Layers className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {tenant.name}
                                                    </span>
                                                    {tenant.isDefault && <span className="text-xs text-purple-600 font-medium">Default</span>}
                                                </div>
                                            </div>
                                            {selectedTenantId === tenant.id && (
                                                <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleSetup}
                        disabled={isLoading || !selectedOrgId}
                        className="w-full px-6 py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Connecting...
                            </>
                        ) : (
                            <>
                                Complete Setup
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/admin/data-sources')}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
