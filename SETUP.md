# IDP Authentication - Quick Setup Guide

## Prerequisites Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js 18+ installed
- [ ] Google OAuth app created
- [ ] GitHub OAuth app created

## Step-by-Step Setup

### 1. Backend Dependencies (Already Completed ✓)

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example env file:
```bash
cd backend
copy .env.example .env   # Windows
# or
# cp .env.example .env   # Linux/Mac
```

Edit `backend/.env` and fill in:

```env
# Database (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/idpnext"

# Generate random secrets (use a password generator)
JWT_SECRET="your-random-secret-min-32-chars"
SESSION_SECRET="another-random-secret"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Create database tables (FASTER - recommended for development)
npm run db:push

# OR use migrations (better for production)
# npm run db:migrate
```

### 4. Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:8080
📝 Environment: development
🌐 Frontend URL: http://localhost:3000
```

### 5. Start the Frontend

In a new terminal:

```bash
# In the root directory (not backend/)
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

### 6. Test the Application

1. Open http://localhost:3000
2. You'll be redirected to http://localhost:3000/login (not authenticated)
3. Click "Continue with Google" or "Continue with GitHub"
4. Complete OAuth flow
5. You'll be redirected back and automatically logged in
6. Your organization will be auto-created on first login

## Creating OAuth Applications

### Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to "APIs & Services" → "Credentials"
4. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
5. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: IDP (or your choice)
   - User support email: your email
   - Developer contact: your email
6. Back to creating OAuth Client ID:
   - Application type: **Web application**
   - Name: IDP Backend
   - Authorized redirect URIs: `http://localhost:8080/api/auth/google/callback`
7. Click "CREATE"
8. Copy **Client ID** and **Client Secret**

### GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - Application name: **IDP**
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:8080/api/auth/github/callback`
4. Click "Register application"
5. Click "Generate a new client secret"
6. Copy **Client ID** and **Client Secret**

## Troubleshooting

### Database Connection Error

**Error**: `Can't reach database server`

**Fix**:
- Verify PostgreSQL is running
- Check DATABASE_URL format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- Test connection: `psql -U postgres -h localhost`

### OAuth Redirect Mismatch

**Error**: `redirect_uri_mismatch`

**Fix**:
- Ensure callback URLs match exactly (include http://)
- Google callback: `http://localhost:8080/api/auth/google/callback`
- GitHub callback: `http://localhost:8080/api/auth/github/callback`

### Backend Won't Start

**Error**: `Cannot find module 'xxx'`

**Fix**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Error**: Environment validation failed

**Fix**: Verify all required variables in .env are filled

### Frontend Can't Connect

**Error**: `Failed to fetch` or CORS errors

**Fix**:
- Verify backend is running on port 8080
- Check FRONTEND_URL in backend/.env is `http://localhost:3000`
- Restart both frontend and backend

## Database Commands

```bash
cd backend

# View database schema
npm run db:studio          # Opens Prisma Studio at http://localhost:5555

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npm run db:generate

# Create a new migration
npm run db:migrate
```

## Testing Authentication

### 1. First Login Test

1. Visit http://localhost:3000
2. Click "Continue with Google"
3. Complete Google authorization
4. You should be redirected back
5. Check the user menu (top right) - you should see your name and avatar

### 2. Verify Database

Open Prisma Studio:
```bash
cd backend
npm run db:studio
```

Check:
- User table - your OAuth user should exist
- Organization table - auto-created organization
- UserOrganization - you should be the owner
- Tenant table - default tenant created

### 3. Test API Endpoints

Get your JWT token from browser DevTools → Application → Local Storage → `idp_auth_token`

```bash
# Get current user
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# List organizations
curl http://localhost:8080/api/organizations/YOUR_ORG_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## What's Next?

- ✅ Authentication is working
- ✅ Organizations auto-created
- ✅ Protected routes functioning

**Optional Enhancements:**
1. Add email service for invitations
2. Create org management UI
3. Build member invitation flow in UI
4. Add tenant management pages
5. Implement user profile editing

## Need Help?

See [backend/README.md](backend/README.md) for detailed documentation.

Check [walkthrough.md](.gemini/antigravity/brain/.../walkthrough.md) for architecture details.
