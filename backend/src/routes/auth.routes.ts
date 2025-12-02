import { Router, Request, Response } from 'express';
import { passport } from '../config/passport.js';
import { AuthService } from '../services/auth.service.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

// Google OAuth routes
router.get(
    '/google',
    (req: Request, res: Response, next) => {
        // Store invitation token in session if provided
        const invitationToken = req.query.invitation as string;
        if (invitationToken) {
            (req.session as any).invitationToken = invitationToken;
        }

        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    }
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/login?error=auth_failed`
    }),
    async (req: Request, res: Response) => {
        try {
            const invitationToken = (req.session as any).invitationToken;
            const result = await AuthService.handleOAuthCallback(req.user, invitationToken);

            // Clear invitation token from session
            delete (req.session as any).invitationToken;

            // Redirect to frontend with token
            const redirectUrl = new URL('/auth/callback', env.FRONTEND_URL);
            redirectUrl.searchParams.set('token', result.token);
            if (result.isNewUser) {
                redirectUrl.searchParams.set('newUser', 'true');
            }

            res.redirect(redirectUrl.toString());
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${env.FRONTEND_URL}/login?error=callback_failed`);
        }
    }
);

// GitHub OAuth routes
router.get(
    '/github',
    (req: Request, res: Response, next) => {
        // Store invitation token in session if provided
        const invitationToken = req.query.invitation as string;
        if (invitationToken) {
            (req.session as any).invitationToken = invitationToken;
        }

        passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
    }
);

router.get(
    '/github/callback',
    passport.authenticate('github', {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/login?error=auth_failed`
    }),
    async (req: Request, res: Response) => {
        try {
            const invitationToken = (req.session as any).invitationToken;
            const result = await AuthService.handleOAuthCallback(req.user, invitationToken);

            // Clear invitation token from session
            delete (req.session as any).invitationToken;

            // Redirect to frontend with token
            const redirectUrl = new URL('/auth/callback', env.FRONTEND_URL);
            redirectUrl.searchParams.set('token', result.token);
            if (result.isNewUser) {
                redirectUrl.searchParams.set('newUser', 'true');
            }

            res.redirect(redirectUrl.toString());
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${env.FRONTEND_URL}/login?error=callback_failed`);
        }
    }
);

// Get current user
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await AuthService.getUserProfile(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Logout (client-side token removal is sufficient, but this can clear any server state)
router.post('/logout', requireAuth, (req: Request, res: Response) => {
    res.json({ success: true });
});

export default router;
