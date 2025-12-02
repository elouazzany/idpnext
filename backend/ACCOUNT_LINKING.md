# OAuth Account Linking Fix

## Issue
When a user logged in with one OAuth provider (e.g., Google) and then tried to log in with another provider (e.g., GitHub) using the same email address, the system would fail with:

```
Unique constraint failed on the fields: (`email`)
```

## Root Cause
The original implementation only checked for users by `provider + providerId` combination. When a user tried to authenticate with a different provider but the same email, it would attempt to create a new user record, violating the unique constraint on the email field.

## Solution
Implemented **account linking** - the system now:

1. First checks if a user exists with the current provider + providerId
2. If not found, checks if a user with that email already exists
3. If an existing user is found, **links** the new OAuth provider to that account by updating the provider info
4. If no existing user, creates a new user account

## Code Changes

Updated both Google and GitHub OAuth strategies in [passport.ts](file:///c:/Users/elouazzany/workspace/ai/idpnext/backend/src/config/passport.ts):

```typescript
// NEW FLOW:
// 1. Try to find by provider + providerId
let user = await prisma.user.findUnique({
    where: {
        provider_providerId: {
            provider: 'google', // or 'github'
            providerId: profile.id,
        },
    },
});

// 2. If not found, check for existing user by email
if (!user) {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        // 3. Link account: Update existing user with new provider
        user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                provider: 'google', // Update to current provider
                providerId: profile.id,
                avatar: existingUser.avatar || profile.photos?.[0]?.value,
            },
        });
    } else {
        // 4. Create new user if no existing account
        user = await prisma.user.create({ ... });
    }
}
```

## Behavior

### Scenario 1: First-time user
- User logs in with Google → New account created with Google credentials
- ✅ Works as before

### Scenario 2: Existing user tries different provider
- User previously logged in with Google
- User now logs in with GitHub (same email)
- ✅ **FIXED**: System finds existing account and links GitHub provider
- User's account is updated to use GitHub credentials
- User keeps all their organizations and data

### Scenario 3: Returning user with same provider
- User logs in with Google again
- ✅ Works as before - finds existing user by provider + providerId

## Important Notes

### Current Limitation: Single Provider Storage
The current database schema stores only **one provider per user** (the most recent). This means:

- User logs in with Google → `provider: 'google'`
- User logs in with GitHub → `provider: 'github'` (overwrites Google)
- User logs in with Google again → `provider: 'google'` (overwrites GitHub)

**This works fine** because the email remains the same, and users can switch between providers freely.

### Future Enhancement: Multiple Providers
To store **all** providers a user has used, you would need to:

1. Update the database schema to have a separate `UserOAuthProvider` table:
```prisma
model UserOAuthProvider {
  id         String @id @default(cuid())
  userId     String
  provider   String
  providerId String
  user       User   @relation(fields: [userId], references: [id])
  
  @@unique([provider, providerId])
}
```

2. Update the User model to remove provider/providerId and add the relation
3. Update the passport strategies to create/find UserOAuthProvider records

**For now, the current single-provider approach is sufficient** and follows the pattern used by many authentication systems.

## Testing

1. Create an account with Google OAuth
2. Log out
3. Log in with GitHub using the same email
4. ✅ Should successfully link accounts and log in
5. Check database - user record should be updated with GitHub provider info
6. User's organizations and tenants remain intact

## No Migration Required

This fix works with the existing database schema - no migration needed!
