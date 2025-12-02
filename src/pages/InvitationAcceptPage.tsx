import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationsApi } from '@/services/api';
import { Invitation } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export const InvitationAcceptPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInvitation = async () => {
            if (!token) {
                setError('Invalid invitation link');
                setLoading(false);
                return;
            }

            try {
                const inv = await invitationsApi.getInvitation(token);
                setInvitation(inv);
            } catch (err: any) {
                setError(err.message || 'Failed to load invitation');
            } finally {
                setLoading(false);
            }
        };

        loadInvitation();
    }, [token]);

    const handleAccept = () => {
        if (!invitation) return;

        if (!isAuthenticated) {
            // Redirect to login with invitation token
            navigate(`/login?invitation=${token}`);
        } else {
            // User is already logged in, redirect to dashboard
            // The backend will have already processed the invitation during OAuth
            navigate('/dashboard');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading invitation...</p>
                </div>
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
                        <p className="text-gray-600 mb-6">{error || 'This invitation is no longer valid'}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Icon */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.586a1 1 0 01.293-.707l6.414-6.414a1 1 0 011.414 0l6.414 6.414a1 1 0 01.293.707V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.414-6.414M21 19l-6.414-6.414m0 0L15 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h2>
                    </div>

                    {/* Invitation Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-1">You've been invited to join</p>
                        <p className="text-lg font-semibold text-gray-900 mb-3">{invitation.organization?.name}</p>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Invited by</span>
                            <span className="font-medium text-gray-900">{invitation.createdBy?.name || invitation.createdBy?.email}</span>
                        </div>

                        <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            Role: {invitation.role}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleAccept}
                        className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        {isAuthenticated ? 'Accept Invitation' : 'Sign in to Accept'}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-4">
                        This invitation will expire on {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};
