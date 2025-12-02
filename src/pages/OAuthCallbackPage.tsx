import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const OAuthCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const isNewUser = searchParams.get('newUser') === 'true';
            const error = searchParams.get('error');

            if (error) {
                navigate(`/login?error=${error}`);
                return;
            }

            if (!token) {
                navigate('/login?error=no_token');
                return;
            }

            try {
                await login(token);

                // Redirect based on whether user is new
                if (isNewUser) {
                    navigate('/auth/setup-organization');
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Callback error:', error);
                navigate('/login?error=login_failed');
            }
        };

        handleCallback();
    }, [searchParams, navigate, login]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
                <p className="text-gray-600">Please wait while we set up your account</p>
            </div>
        </div>
    );
};
