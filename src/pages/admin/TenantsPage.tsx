import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tenantsApi } from '@/services/api';
import { Tenant } from '@/types/auth';
import { Plus, Search, Building2, MoreHorizontal, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import * as Dialog from '@radix-ui/react-dialog';

export function TenantsPage() {
    const { currentOrganization } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Create Tenant Form State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTenantName, setNewTenantName] = useState('');
    const [newTenantSlug, setNewTenantSlug] = useState('');
    const [newTenantDescription, setNewTenantDescription] = useState('');

    useEffect(() => {
        if (currentOrganization) {
            loadTenants();
        }
    }, [currentOrganization]);

    const loadTenants = async () => {
        if (!currentOrganization) return;
        try {
            setIsLoading(true);
            const data = await tenantsApi.getTenants(currentOrganization.id);
            setTenants(data);
        } catch (error) {
            console.error('Failed to load tenants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOrganization) return;

        try {
            setIsCreating(true);
            await tenantsApi.createTenant(currentOrganization.id, {
                name: newTenantName,
                slug: newTenantSlug,
                description: newTenantDescription
            });

            // Reset and reload
            setNewTenantName('');
            setNewTenantSlug('');
            setNewTenantDescription('');
            setIsCreateModalOpen(false);
            loadTenants();
        } catch (error) {
            console.error('Failed to create tenant:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const filteredTenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Tenants</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your organization's environments and workspaces.</p>
                    </div>
                    <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <Dialog.Trigger asChild>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                                <Plus className="h-4 w-4" />
                                Create Tenant
                            </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
                                <Dialog.Title className="text-lg font-semibold mb-4">Create New Tenant</Dialog.Title>
                                <form onSubmit={handleCreateTenant} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTenantName}
                                            onChange={(e) => {
                                                setNewTenantName(e.target.value);
                                                // Auto-generate slug
                                                if (!newTenantSlug) {
                                                    setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                                                }
                                            }}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="e.g. Production"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTenantSlug}
                                            onChange={(e) => setNewTenantSlug(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                            placeholder="e.g. production"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={newTenantDescription}
                                            onChange={(e) => setNewTenantDescription(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            rows={3}
                                            placeholder="Optional description"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Dialog.Close asChild>
                                            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                                                Cancel
                                            </button>
                                        </Dialog.Close>
                                        <button
                                            type="submit"
                                            disabled={isCreating}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Create Tenant
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-8 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                ) : filteredTenants.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No tenants found</h3>
                        <p className="text-gray-500 mt-1">Get started by creating your first tenant.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTenants.map((tenant) => (
                            <div key={tenant.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{tenant.name}</h3>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">{tenant.slug}</code>
                                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                                    {tenant.description || 'No description provided.'}
                                </p>
                                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                                    <span>{tenant.isDefault ? 'Default Tenant' : 'Standard Tenant'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
