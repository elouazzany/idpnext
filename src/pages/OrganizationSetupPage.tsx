import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Sparkles } from 'lucide-react';

export const OrganizationSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshUser, switchOrganization } = useAuth();
    const [organizationName, setOrganizationName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!organizationName.trim()) {
            setError('Organization name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Create organization
            const newOrg = await organizationsApi.createOrganization({
                name: organizationName.trim(),
            });

            // Refresh user data to load the new organization
            await refreshUser();

            // Switch to the new organization
            await switchOrganization(newOrg.id);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create organization');
            setIsLoading(false);
        }
    };

    const suggestedNames = [
        'My Company',
        'Engineering Team',
        'Product Development',
        'DevOps Team',
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Organization</h1>
                    <p className="text-gray-600">
                        Let's get started by setting up your workspace
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        {/* Organization Name Input */}
                        <div className="mb-6">
                            <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                                Organization Name
                            </label>
                            <input
                                id="orgName"
                                type="text"
                                value={organizationName}
                                onChange={(e) => {
                                    setOrganizationName(e.target.value);
                                    setError(null);
                                }}
                                placeholder="e.g., Acme Corporation"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                disabled={isLoading}
                                autoFocus
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        {/* Suggested Names */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Quick suggestions</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestedNames.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setOrganizationName(name)}
                                        disabled={isLoading}
                                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>What's an organization?</strong><br />
                                Your organization is a workspace where you can manage services, invite team members, and collaborate on projects.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !organizationName.trim()}
                            className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Building2 className="w-5 h-5" />
                                    Create Organization
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    You can change this later in organization settings
                </p>
            </div>
        </div>
    );
};
