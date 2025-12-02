import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Building2, Settings, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
    const navigate = useNavigate();
    const { user, currentOrganization, currentTenant, availableTenants, logout, switchTenant } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showTenantSelector, setShowTenantSelector] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowTenantSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleTenantSwitch = (tenantId: string) => {
        switchTenant(tenantId);
        setShowTenantSelector(false);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* User Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name || 'User'}
                            className="w-8 h-8 rounded-full border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="hidden md:block text-left">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'User'}</div>
                        <div className="text-xs text-gray-500">{currentOrganization?.name}</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name || 'User'}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div
                                className="flex-1 min-w-0 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/profile');
                                }}
                            >
                                <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                                <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Organization Info */}
                    {currentOrganization && (
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                                <Building2 className="w-3.5 h-3.5" />
                                Organization
                            </div>
                            <div className="text-sm font-medium text-gray-900">{currentOrganization.name}</div>
                        </div>
                    )}

                    {/* Tenant Selector */}
                    {availableTenants.length > 1 && (
                        <div className="px-4 py-3 border-b border-gray-100">
                            <button
                                onClick={() => setShowTenantSelector(!showTenantSelector)}
                                className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900"
                            >
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Current Tenant</div>
                                    <div className="font-medium">{currentTenant?.name || 'Select tenant'}</div>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showTenantSelector ? 'rotate-180' : ''}`} />
                            </button>

                            {showTenantSelector && (
                                <div className="mt-2 space-y-1">
                                    {availableTenants.map((tenant) => (
                                        <button
                                            key={tenant.id}
                                            onClick={() => handleTenantSwitch(tenant.id)}
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${tenant.id === currentTenant?.id
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {tenant.name}
                                            {tenant.isDefault && (
                                                <span className="ml-2 text-xs text-gray-500">(Default)</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/admin/organization');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
