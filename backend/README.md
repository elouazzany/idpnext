# IDP Authentication System

## Overview

This implementation provides a complete authentication system with:
- OAuth authentication (Google & GitHub)
- Multi-organization support
- Multi-tenant architecture
- Invitation system
- JWT-based API authentication

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT tokens
- `SESSION_SECRET` - Random secret for sessions
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - From GitHub OAuth Apps

#### Setup OAuth Applications

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:8080/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Application name: IDP (or your choice)
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:8080/api/auth/github/callback`
6. Copy Client ID and Client Secret to `.env`

#### Setup Database

Make sure PostgreSQL is running, then:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

#### Start Backend Server

```bash
npm run dev
```

Backend will run on http://localhost:8080

### 2. Frontend Setup

The frontend is already configured. Just make sure it's running:

```bash
npm run dev
```

Frontend will run on http://localhost:3000

## How It Works

### First Login Flow

1. User visits `/login`
2. Clicks "Sign in with Google" or "Sign in with GitHub"
3. Redirected to OAuth provider
4. After authentication, redirected to `/auth/callback`
5. Backend creates user and automatically creates an organization
6. User redirected to dashboard

### Invitation Flow

1. Admin creates invitation via API or UI
2. Invitee receives email with link (email service not implemented yet)
3. Invitee clicks link → `/invitations/{token}`
4. If not logged in, redirected to login with invitation token
5. After OAuth, backend adds user to organization
6. User redirected to dashboard

### Organization & Tenant Structure

- **Organization**: Top-level grouping (e.g., "Acme Corp")
- **Tenant**: Environment within organization (e.g., "Production", "Staging")
- Users can belong to multiple organizations
- Each organization can have multiple tenants
- Users have roles at both organization and tenant levels

### API Authentication

All API requests (except OAuth) require JWT token in Authorization header:

```
Authorization: Bearer {token}
```

Token is stored in localStorage and automatically added by the frontend API client.

## File Structure

### Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts           # Environment configuration
│   │   ├── db.ts            # Prisma client
│   │   └── passport.ts      # OAuth strategies
│   ├── middleware/
│   │   └── auth.ts          # Authentication middleware
│   ├── services/
│   │   ├── auth.service.ts        # Auth business logic
│   │   ├── organization.service.ts # Org management
│   │   └── invitation.service.ts   # Invitation system
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── organizations.routes.ts
│   │   ├── invitations.routes.ts
│   │   └── tenants.routes.ts
│   └── server.ts            # Express app
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

### Frontend

```
src/
├── contexts/
│   └── AuthContext.tsx      # Auth state management
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   └── layout/
│       └── UserMenu.tsx     # User menu with org/tenant switching
├── pages/
│   ├── LoginPage.tsx
│   ├── OAuthCallbackPage.tsx
│   └── InvitationAcceptPage.tsx
├── services/
│   └── api.ts              # API client
├── types/
│   └── auth.ts             # TypeScript types
└── utils/
    └── auth.ts             # Auth utilities
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google callback
- `GET /api/auth/github` - Initiate GitHub OAuth  
- `GET /api/auth/github/callback` - GitHub callback
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout

### Organizations
- `GET /api/organizations/:id` - Get organization
- `POST /api/organizations` - Create organization
- `PATCH /api/organizations/:id` - Update organization
- `GET /api/organizations/:id/members` - List members
- `DELETE /api/organizations/:id/members/:userId` - Remove member

### Invitations
- `POST /api/invitations` - Create invitation
- `GET /api/invitations/:token` - Get invitation (public)
- `GET /api/invitations/organization/:orgId` - List org invitations
- `DELETE /api/invitations/:id` - Revoke invitation

### Tenants
- `GET /api/tenants/organization/:orgId` - List org tenants
- `POST /api/tenants/organization/:orgId` - Create tenant
- `GET /api/tenants/:id` - Get tenant details
- `PATCH /api/tenants/:id` - Update tenant

## Next Steps

### Recommended Enhancements

1. **Email Service**: Integrate SendGrid/AWS SES for invitation emails
2. **Password Authentication**: Add email/password option alongside OAuth
3. **2FA**: Add two-factor authentication
4. **Role Permissions**: Define granular permissions per role
5. **Audit Logging**: Track all auth-related actions
6. **Session Management**: Add ability to view/revoke active sessions
7. **Organization Switching UI**: Add dropdown in header
8. **Tenant Management UI**: Create pages for tenant CRUD operations

### Security Considerations

- Always use HTTPS in production
- Rotate JWT secrets regularly
- Implement rate limiting on auth endpoints
- Add CSRF protection
- Implement IP whitelisting for sensitive operations
- Enable OAuth state parameter validation
- Add security headers (helmet.js)

## Troubleshooting

**OAuth fails with "redirect_uri_mismatch":**
- Check that callback URLs in OAuth apps match exactly
- Make sure to include protocol (http/https)

**Database connection fails:**
- Verify PostgreSQL is running
- Check DATABASE_URL format in .env
- Ensure database exists

**JWT token invalid:**
- Check JWT_SECRET matches between requests
- Verify token hasn't expired
- Clear localStorage and login again

**CORS errors:**
- Verify FRONTEND_URL in backend .env matches frontend URL
- Check CORS configuration in server.ts
