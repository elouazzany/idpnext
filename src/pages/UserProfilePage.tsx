import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Github, KeyRound } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');

    if (!user) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h1>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Header / Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                <div className="px-6 pb-6">
                    {/* Avatar & Basic Info */}
                    <div className="relative flex items-end -mt-12 mb-6">
                        <div className="p-1 bg-white rounded-full">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name || 'User'}
                                    className="w-24 h-24 rounded-full border-2 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-md text-2xl font-bold text-gray-500">
                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="ml-4 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Personal Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        disabled={!isEditing}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                                        <Mail className="w-4 h-4" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connected Accounts */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <KeyRound className="w-5 h-5" />
                                Connected Accounts
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Google</p>
                                            <p className="text-xs text-gray-500">
                                                {user.accounts?.some(a => a.provider === 'google') ? 'Connected' : 'Not connected'}
                                            </p>
                                        </div>
                                    </div>
                                    {user.accounts?.some(a => a.provider === 'google') && (
                                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                            Connected
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            <Github className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">GitHub</p>
                                            <p className="text-xs text-gray-500">
                                                {user.accounts?.some(a => a.provider === 'github') ? 'Connected' : 'Not connected'}
                                            </p>
                                        </div>
                                    </div>
                                    {user.accounts?.some(a => a.provider === 'github') && (
                                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                            Connected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
