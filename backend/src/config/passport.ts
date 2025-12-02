import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { env } from './env.js';
import { prisma } from './db.js';

// Serialize user for session
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { accounts: true }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Helper to handle OAuth success
const handleOAuthLogin = async (
    provider: string,
    profile: any,
    email: string,
    done: any
) => {
    try {
        // 1. Try to find an account with this provider/id
        const account = await prisma.account.findUnique({
            where: {
                provider_providerId: {
                    provider,
                    providerId: profile.id,
                },
            },
            include: { user: true },
        });

        if (account) {
            // Account found, return the user
            return done(null, account.user);
        }

        // 2. Account not found, check if user exists by email
        let user = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true },
        });

        if (user) {
            // User exists, link the new account
            await prisma.account.create({
                data: {
                    userId: user.id,
                    provider,
                    providerId: profile.id,
                },
            });

            // Update user avatar if missing
            if (!user.avatar) {
                const newAvatar = profile.photos?.[0]?.value || profile.avatar_url;
                if (newAvatar) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { avatar: newAvatar },
                    });
                }
            }

            // Return updated user
            user = await prisma.user.findUnique({
                where: { id: user.id },
                include: { accounts: true },
            });
        } else {
            // 3. Create new user and account
            user = await prisma.user.create({
                data: {
                    email,
                    name: profile.displayName || profile.username,
                    avatar: profile.photos?.[0]?.value || profile.avatar_url,
                    provider, // Keep for legacy/primary
                    providerId: profile.id, // Keep for legacy/primary
                    accounts: {
                        create: {
                            provider,
                            providerId: profile.id,
                        },
                    },
                },
                include: { accounts: true },
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error as Error, undefined);
    }
};

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('No email found in Google profile'), undefined);
            }
            await handleOAuthLogin('google', profile, email, done);
        }
    )
);

// GitHub OAuth Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            callbackURL: env.GITHUB_CALLBACK_URL,
            scope: ['user:email'],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('No email found in GitHub profile'), undefined);
            }
            await handleOAuthLogin('github', profile, email, done);
        }
    )
);

// JWT Strategy for API authentication
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                include: {
                    accounts: true, // Include linked accounts
                    organizations: {
                        include: {
                            organization: true,
                        },
                    },
                    tenants: {
                        include: {
                            tenant: true,
                        },
                    },
                },
            });

            if (!user) {
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    })
);

export { passport };
