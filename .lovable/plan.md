

# Auth Module Fixes

## Overview
Fix 9 identified issues in the authentication module covering security, correctness, and UX gaps.

## Changes

### 1. Delete `src/lib/supabase.ts`
Remove the legacy client file that uses wrong env var names and hardcoded fallback credentials. Update any remaining imports to use `@/integrations/supabase/client`.

### 2. Fix auth listener ordering in `useAuth.tsx`
Register `onAuthStateChange` BEFORE calling `getSession()` to prevent missed auth events during initialization.

### 3. Extract shared role map
Create a `src/constants/roles.ts` file with the role mapping constant, and import it in `useAuth.tsx` and `Login.tsx` to eliminate duplication.

### 4. Fix RLS policy types (database migration)
Change all the "Authenticated users can read..." SELECT policies from RESTRICTIVE to PERMISSIVE on tables: `clubs`, `match_events`, `matches`, `players`, `provinces`, `teams`, `tournaments`, `verification_logs`, and `user_roles` (own-row read).

### 5. Add password reset flow
- Add a "Forgot Password" link on the Login page that triggers `resetPasswordForEmail`
- Create a `/reset-password` page that reads the recovery token and lets users set a new password

### 6. Fix ProtectedRoute toast spam
Move the unauthorized toast into a `useEffect` so it only fires once, not on every re-render.

### 7. Redirect back after login
Read `location.state.from` in `Login.tsx` and navigate there after successful authentication instead of always going to `/admin` or `/`.

### 8. Fix role fallback inconsistency
Standardize error handling: if role fetch fails, default to `null` in both code paths (init and listener) so the user is treated as unauthenticated-without-role consistently. Let `ProtectedRoute` handle the redirect.

## Files to modify
- **Delete**: `src/lib/supabase.ts`
- **Create**: `src/constants/roles.ts`
- **Create**: `src/pages/ResetPassword.tsx`
- **Edit**: `src/hooks/useAuth.tsx` (listener order, shared role map, consistent fallback)
- **Edit**: `src/pages/Login.tsx` (redirect-back, forgot password link, shared role map)
- **Edit**: `src/components/ProtectedRoute.tsx` (toast in useEffect)
- **Edit**: `src/App.tsx` (add `/reset-password` route)
- **Edit**: `src/services/playerService.ts` (if it imports from `lib/supabase`)
- **Migration**: Fix restrictive SELECT policies to permissive

## Technical Details

### Role constants file
```typescript
export const DB_TO_UI_ROLE_MAP: Record<string, 'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER'> = {
  super_admin: 'ADMIN',
  provincial_admin: 'ADMIN',
  match_commissioner: 'REGISTRAR',
  data_operator: 'REGISTRAR',
  scout: 'SCOUT',
};

export const ADMIN_DB_ROLES = ['super_admin', 'provincial_admin', 'match_commissioner', 'data_operator', 'scout'];
```

### Auth listener fix (useAuth.tsx)
```typescript
useEffect(() => {
  // 1. Set up listener FIRST
  const { data: { subscription } } = authService.onAuthStateChange(async (event, currentSession) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    if (currentSession?.user) {
      // fetch role...
    } else {
      setRole(null);
    }
    setLoading(false);
  });

  // 2. THEN check initial session
  authService.getSession().then(/* ... */);

  return () => subscription.unsubscribe();
}, []);
```

### RLS migration SQL
```sql
-- Drop restrictive SELECT policies and recreate as permissive
-- Example for each table:
DROP POLICY IF EXISTS "Authenticated users can read clubs" ON public.clubs;
CREATE POLICY "Authenticated users can read clubs"
  ON public.clubs FOR SELECT TO authenticated USING (true);
-- Repeat for all 8 tables...
```
