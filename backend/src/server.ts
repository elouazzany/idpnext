import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { passport } from './config/passport.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import organizationsRoutes from './routes/organizations.routes.js';
import invitationsRoutes from './routes/invitations.routes.js';
import tenantsRoutes from './routes/tenants.routes.js';
import blueprintsRoutes from './routes/blueprints.routes.js';
import entitiesRoutes from './routes/entities.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import auditLogsRoutes from './routes/audit-logs.routes.js';

const app = express();

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for OAuth)
app.use(
    session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/invitations', invitationsRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/blueprints', blueprintsRoutes);
app.use('/api/v1', entitiesRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api', auditLogsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

const PORT = parseInt(env.PORT);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
});

export default app;
