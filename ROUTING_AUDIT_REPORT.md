# Routing Configuration Audit Report

## Executive Summary

This audit examines the routing configuration of the DefCat DeckVault Next.js application, comparing the proxy.ts middleware configuration with actual routes and identifying security gaps.

**Date:** 2025-10-30
**Auditor:** Claude Code
**Application:** DefCat DeckVault (Next.js 15.5.5)

---

## Critical Findings

### 1. Middleware Not Active (CRITICAL)

**Issue:** The file `proxy.ts` exists in the root directory but is NOT being used by Next.js.

**Details:**
- File location: `/proxy.ts`
- Function exported: `proxy()` (line 115)
- **Problem:** Next.js middleware MUST be in a file named `middleware.ts` in either the root or `src/` directory
- **Current state:** The middleware is not running, meaning NONE of the route protection is active

**Impact:**
- All protected routes defined in proxy.ts are currently UNPROTECTED
- Anyone can access admin routes without authentication
- Role-based access controls are not being enforced

**Recommendation:**
```bash
# Rename proxy.ts to middleware.ts
mv proxy.ts middleware.ts
# OR move to src/
mv proxy.ts src/middleware.ts
```

---

### 2. Duplicate Middleware Implementations

**Issue:** Two middleware implementations exist:

1. **`/proxy.ts`** (5,778 bytes)
   - Comprehensive role-based access control
   - Protects admin, moderator, developer, and member routes
   - Has proper route matching logic

2. **`/src/lib/supabase/middleware.ts`** (73 lines)
   - Minimal implementation
   - Only protects `/admin/*` routes
   - No role-based checks
   - Just redirects to login if not authenticated

**Recommendation:**
- Rename `/proxy.ts` → `/middleware.ts` to activate it
- Remove or repurpose `/src/lib/supabase/middleware.ts`
- Use the comprehensive proxy.ts implementation

---

## Route Protection Analysis

### Protected Routes (Defined in proxy.ts)

The proxy.ts configuration defines these protected routes:

| Path Pattern | Minimum Role | Actual Implementation | Status |
|--------------|--------------|----------------------|--------|
| `/developer` | developer | No routes found | Unused |
| `/dev` | developer | No routes found | Unused |
| `/admin` | admin | 13 pages + 14 API routes | UNPROTECTED (middleware not active) |
| `/mod` | moderator | No routes found | Unused |
| `/member` | member | No routes found | Unused |
| `/dashboard` | user | No route found | Unused |
| `/profile` | user | 1 page | UNPROTECTED |
| `/settings` | user | No route found (only /admin/settings) | Unused |
| `/submit` | user | No routes match | Unused |

### Public Routes (Defined in proxy.ts)

| Path | Exists | Notes |
|------|--------|-------|
| `/` | Yes | Home page |
| `/auth/login` | Yes | Login page |
| `/auth/callback` | Yes | OAuth callback |
| `/auth/signup` | No | NOT IMPLEMENTED |
| `/about` | Yes | About page |
| `/pricing` | No | NOT IMPLEMENTED |
| `/decks` | Yes | Public deck listing |
| `/commanders` | No | NOT IMPLEMENTED |
| `/api/webhooks` | No | NOT IMPLEMENTED |

---

## Actual Routes in Application

### Admin Pages (13 total)

All admin pages use `requireAdmin()` guard at the page level:

1. `/admin/page.tsx` - Dashboard (has requireAdmin)
2. `/admin/credits/page.tsx` - Credits management (has requireAdmin)
3. `/admin/database/page.tsx` - Database panel (has requireAdmin)
4. `/admin/decks/page.tsx` - Deck management (has requireAdmin)
5. `/admin/decks/[id]/page.tsx` - Deck editor (has requireAdmin)
6. `/admin/decks/import/page.tsx` - Deck import (has requireAdmin)
7. `/admin/docs/page.tsx` - Documentation (has requireAdmin)
8. `/admin/products/page.tsx` - Products config (has requireAdmin)
9. `/admin/settings/page.tsx` - Site settings (has requireAdmin)
10. `/admin/submissions/page.tsx` - Submissions queue (has requireAdmin)
11. `/admin/test/fetch/page.tsx` - Test page (needs verification)
12. `/admin/users/page.tsx` - User management (has requireAdmin)

**Security Status:**
- Page-level protection: ACTIVE (requireAdmin guard)
- Middleware protection: INACTIVE (proxy.ts not running)
- **Defense in depth is working**, but middleware should still be activated

### Admin API Routes (14 total)

All admin API routes implement role checks manually:

1. `/api/admin/database/query/route.ts` - SQL query execution (requires developer)
2. `/api/admin/decks/import/route.ts` - Deck import API
3. `/api/admin/decks/[id]/route.ts` - Deck operations
4. `/api/admin/developer/reset-tier/route.ts` - Developer tools
5. `/api/admin/developer/spoof-tier/route.ts` - Developer tools
6. `/api/admin/moxfield/route.ts` - Moxfield integration
7. `/api/admin/products/route.ts` - Product CRUD (requires admin/moderator/developer)
8. `/api/admin/products/[id]/route.ts` - Product operations
9. `/api/admin/site-config/route.ts` - Site config
10. `/api/admin/site-config/add/route.ts` - Add config
11. `/api/admin/site-config/[key]/route.ts` - Config operations
12. `/api/admin/submissions/[id]/route.ts` - Submission management
13. `/api/admin/users/add/route.ts` - User creation
14. `/api/admin/users/update-role/route.ts` - Role management (requires admin/moderator/developer)

**Security Status:**
- API-level auth checks: ACTIVE (manual checks)
- Middleware protection: INACTIVE (proxy.ts not running)

### Public API Routes (5 total)

1. `/api/card-image/route.ts` - Card image proxy
2. `/api/health/route.ts` - Health check
3. `/api/metrics/route.ts` - Metrics endpoint
4. `/api/submit-deck/route.ts` - Deck submission (requires auth)
5. `/api/submit-roast/route.ts` - Roast submission (requires auth)

### Auth Routes (8 total)

1. `/auth/api/moxfield/route.ts` - Moxfield proxy
2. `/auth/callback/route.ts` - OAuth callback
3. `/auth/callback-success/page.tsx` - Success page
4. `/auth/login/page.tsx` - Login page
5. `/auth/logout/route.ts` - Logout handler
6. `/auth/patreon/route.ts` - Patreon OAuth init
7. `/auth/patreon-callback/route.ts` - Patreon callback
8. `/auth/reset-password/page.tsx` - Password reset
9. `/auth/verify/page.tsx` - Email verification

### User-Facing Pages

1. `/page.tsx` - Home page
2. `/about/page.tsx` - About page
3. `/decks/page.tsx` - Deck listing (public)
4. `/decks/[id]/page.tsx` - Deck detail (public)
5. `/decks/submission/page.tsx` - Deck submission form (UNPROTECTED)
6. `/decks/roast-submission/page.tsx` - Roast form (UNPROTECTED)
7. `/profile/page.tsx` - User profile (UNPROTECTED)

### Pivot Pages (4 total - experimental)

1. `/pivot/college/page.tsx`
2. `/pivot/home/page.tsx`
3. `/pivot/preview/page.tsx`
4. `/pivot/store/page.tsx`

---

## Security Gaps

### High Priority

1. **Middleware Not Active**
   - Severity: CRITICAL
   - Impact: No middleware protection on ANY routes
   - Fix: Rename `proxy.ts` → `middleware.ts`

2. **Unprotected Submission Forms**
   - Routes affected:
     - `/decks/submission/page.tsx` (no auth check)
     - `/decks/roast-submission/page.tsx` (no auth check)
   - Severity: HIGH
   - Current protection: API-level only (submit-deck/route.ts has auth)
   - Risk: Users can access forms but can't submit without auth
   - Fix: Add `requireAuth()` to these pages OR rely on API protection

3. **Unprotected Profile Page**
   - Route: `/profile/page.tsx`
   - Severity: MEDIUM
   - Fix: Add `requireAuth()` guard

### Medium Priority

4. **Missing Public Routes**
   - `/auth/signup` - Defined as public but doesn't exist
   - `/pricing` - Defined as public but doesn't exist
   - `/commanders` - Defined as public but doesn't exist
   - `/api/webhooks` - Defined as public but doesn't exist
   - Impact: No security risk, just inconsistent configuration
   - Fix: Remove from PUBLIC_ROUTES or implement

5. **Unused Protected Route Definitions**
   - `/developer` - Defined but no routes exist
   - `/dev` - Defined but no routes exist
   - `/mod` - Defined but no routes exist
   - `/member` - Defined but no routes exist
   - `/dashboard` - Defined but no routes exist
   - `/settings` - Defined but only `/admin/settings` exists
   - `/submit` - Defined but forms are at `/decks/*`
   - Impact: Configuration clutter
   - Fix: Remove unused definitions or implement routes

6. **Inconsistent Developer Role Checks**
   - `/api/admin/database/query` requires `developer` role
   - Most other admin routes require `admin` role
   - proxy.ts has role hierarchy: developer (4) > admin (3) > moderator (2) > member (1) > user (0)
   - Risk: Some routes check for specific role strings instead of hierarchy
   - Fix: Implement consistent role hierarchy checks

### Low Priority

7. **Test Route in Production**
   - Route: `/admin/test/fetch/page.tsx`
   - Severity: LOW
   - Recommendation: Add environment check or remove before production

8. **Hardcoded Admin Bypass**
   - Location: Multiple files (proxy.ts line 31, auth-guards.ts lines 25, 72, 98)
   - Email: `elmo@bdwinc.org`
   - Severity: LOW (development only)
   - Fix: Remove before production deployment

---

## Role Hierarchy Implementation

### Defined in proxy.ts (lines 20-26)

```typescript
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  member: 1,
  moderator: 2,
  admin: 3,
  developer: 4,
}
```

### Current Role Check Patterns

**Pattern 1: Specific role check** (most API routes)
```typescript
if (!profile || !['admin', 'moderator', 'developer'].includes(profile.role))
```

**Pattern 2: Single role check** (auth-guards.ts)
```typescript
if (profile?.role !== 'admin')
```

**Pattern 3: Hierarchy check** (proxy.ts only)
```typescript
function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}
```

**Inconsistency:** Most API routes use Pattern 1 (explicit array), proxy.ts uses Pattern 3 (hierarchy)

---

## Auth Guard Implementation

### Server-Side Guards (auth-guards.ts)

1. **`requireAdmin()`** - Used in 9+ admin pages
   - Redirects to `/auth/login?error=auth_required` if not authenticated
   - Redirects to `/?error=unauthorized` if not admin
   - Has hardcoded bypass for `elmo@bdwinc.org`

2. **`requireAuth()`** - General auth check
   - Only redirects to login if not authenticated
   - No role check

3. **`hasRole(requiredRole)`** - Non-blocking check
   - Returns boolean
   - Used for conditional UI

4. **`getCurrentUserWithRole()`** - Gets user info
   - Returns user object with role
   - Returns null if not authenticated

### API Route Protection Pattern

All admin API routes follow this pattern:

```typescript
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'moderator', 'developer'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ... rest of handler
}
```

**This pattern is repeated across 14 API routes** - consider extracting to a utility function.

---

## Recommendations

### Immediate Actions (Critical)

1. **Activate Middleware**
   ```bash
   mv proxy.ts middleware.ts
   ```
   This will immediately enable middleware protection for all routes.

2. **Remove Duplicate Middleware**
   ```bash
   rm src/lib/supabase/middleware.ts
   ```
   OR document it as deprecated/unused.

3. **Verify Middleware is Running**
   - Deploy changes
   - Test accessing `/admin` without auth
   - Should redirect to `/auth/login?error=auth_required&redirect=/admin`

### Short-Term Actions (High Priority)

4. **Protect Submission Forms**

   Option A (Recommended): Add page-level guards
   ```typescript
   // src/app/decks/submission/page.tsx
   import { requireAuth } from '@/lib/auth/auth-guards'

   export default async function DeckSubmissionPage() {
     await requireAuth()
     // ... rest of component
   }
   ```

   Option B: Add client-side redirect
   ```typescript
   'use client'
   import { useRouter } from 'next/navigation'
   import { useEffect } from 'react'
   import { useAuth } from '@/hooks/useAuth'

   export default function DeckSubmissionPage() {
     const router = useRouter()
     const { user, loading } = useAuth()

     useEffect(() => {
       if (!loading && !user) {
         router.push('/auth/login?error=auth_required')
       }
     }, [user, loading, router])
     // ...
   }
   ```

5. **Protect Profile Page**
   ```typescript
   // src/app/profile/page.tsx
   import { requireAuth } from '@/lib/auth/auth-guards'

   export default async function ProfilePage() {
     await requireAuth()
     // ... rest of component
   }
   ```

6. **Clean Up Route Configuration**

   Update proxy.ts (soon to be middleware.ts):
   ```typescript
   // Remove unused protected routes
   const PROTECTED_ROUTES: Array<{
     path: string
     minimumRole: UserRole
   }> = [
     // Admin routes
     { path: '/admin', minimumRole: 'admin' },

     // User routes
     { path: '/profile', minimumRole: 'user' },
     { path: '/decks/submission', minimumRole: 'user' },
     { path: '/decks/roast-submission', minimumRole: 'user' },
   ]

   // Update public routes to match reality
   const PUBLIC_ROUTES = [
     '/',
     '/auth/login',
     '/auth/callback',
     '/about',
     '/decks',
     '/api/health',
     '/api/metrics',
     '/api/card-image',
   ]
   ```

### Medium-Term Actions

7. **Extract API Auth Guard**

   Create reusable guard utility:
   ```typescript
   // src/lib/auth/api-guards.ts
   import { createClient } from '@supabase/supabase-js'
   import { NextRequest, NextResponse } from 'next/server'
   import type { UserRole } from '@/types/core'

   export async function requireApiAuth(
     request: NextRequest,
     allowedRoles?: UserRole[]
   ) {
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     )

     const authHeader = request.headers.get('authorization')
     if (!authHeader) {
       return {
         error: NextResponse.json(
           { success: false, error: 'Unauthorized' },
           { status: 401 }
         ),
       }
     }

     const token = authHeader.replace('Bearer ', '')
     const { data: { user }, error: authError } =
       await supabase.auth.getUser(token)

     if (authError || !user) {
       return {
         error: NextResponse.json(
           { success: false, error: 'Unauthorized' },
           { status: 401 }
         ),
       }
     }

     if (allowedRoles && allowedRoles.length > 0) {
       const { data: profile } = await supabase
         .from('profiles')
         .select('role')
         .eq('id', user.id)
         .single()

       if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
         return {
           error: NextResponse.json(
             { success: false, error: 'Forbidden' },
             { status: 403 }
           ),
         }
       }

       return { user, profile }
     }

     return { user }
   }

   // Usage in API routes:
   export async function POST(request: NextRequest) {
     const auth = await requireApiAuth(request, ['admin', 'moderator', 'developer'])
     if (auth.error) return auth.error

     // ... rest of handler with auth.user and auth.profile available
   }
   ```

8. **Implement Role Hierarchy Checks**

   Instead of checking arrays, use hierarchy:
   ```typescript
   if (!hasMinimumRole(profile.role, 'admin')) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
   }
   ```

9. **Add Environment-Based Route Protection**

   For test/debug routes:
   ```typescript
   // middleware.ts
   if (pathname.startsWith('/admin/test') && process.env.NODE_ENV === 'production') {
     return NextResponse.redirect(new URL('/', request.url))
   }
   ```

### Long-Term Actions

10. **Remove Hardcoded Admin Bypass**

    Before production deployment:
    - Remove all instances of `ADMIN_BYPASS_EMAILS`
    - Remove hardcoded email checks in auth-guards.ts
    - Use proper role assignment in database

11. **Implement Rate Limiting**

    For sensitive routes:
    - API route `/api/admin/database/query` (SQL execution)
    - Login/auth routes
    - Submission routes

12. **Add Audit Logging**

    Log all admin actions:
    - Role changes
    - Database queries
    - User modifications
    - Submission approvals

13. **Implement RBAC Helper Library**

    Centralize all role checks:
    ```typescript
    // src/lib/rbac/index.ts
    export class RBAC {
      private static hierarchy = { user: 0, member: 1, moderator: 2, admin: 3, developer: 4 }

      static can(userRole: UserRole, requiredRole: UserRole): boolean {
        return this.hierarchy[userRole] >= this.hierarchy[requiredRole]
      }

      static canAny(userRole: UserRole, allowedRoles: UserRole[]): boolean {
        return allowedRoles.some(role => this.can(userRole, role))
      }
    }
    ```

---

## Testing Checklist

After implementing fixes:

### Middleware Tests

- [ ] Access `/admin` without auth → redirects to login
- [ ] Access `/admin` with user role → redirects to home with error
- [ ] Access `/admin` with admin role → allowed
- [ ] Access `/profile` without auth → redirects to login
- [ ] Access `/profile` with auth → allowed
- [ ] Access `/decks/submission` without auth → redirects to login
- [ ] Access public routes without auth → allowed

### API Tests

- [ ] Call admin API without auth header → 401
- [ ] Call admin API with invalid token → 401
- [ ] Call admin API with user role → 403
- [ ] Call admin API with admin role → 200
- [ ] Call database API with admin role → 403
- [ ] Call database API with developer role → 200

### Role Hierarchy Tests

- [ ] Developer can access all admin routes
- [ ] Admin cannot access developer routes
- [ ] Moderator can access moderator routes
- [ ] Admin can access moderator routes

---

## Configuration Files Summary

### proxy.ts (NOT ACTIVE - needs rename)

- **Location:** `/proxy.ts`
- **Lines:** 212
- **Export:** `proxy()` function and `config` object
- **Status:** Not being used by Next.js
- **Fix:** Rename to `middleware.ts`

### src/lib/supabase/middleware.ts (Minimal)

- **Location:** `/src/lib/supabase/middleware.ts`
- **Lines:** 73
- **Export:** `updateSession()` function
- **Status:** Not being used
- **Purpose:** Session refresh helper
- **Fix:** Remove or document as utility only

### src/lib/auth/auth-guards.ts (Active)

- **Location:** `/src/lib/auth/auth-guards.ts`
- **Lines:** 126
- **Exports:** `requireAdmin()`, `requireAuth()`, `hasRole()`, `getCurrentUserWithRole()`
- **Status:** ACTIVE - Used in 9+ admin pages
- **Purpose:** Server-side page protection

---

## Conclusion

The application has **defense-in-depth** security with page-level and API-level auth checks, but the middleware layer is currently **not active** because `proxy.ts` is not named correctly for Next.js to recognize it.

**Primary Action:** Rename `proxy.ts` to `middleware.ts` to activate route-level protection.

**Secondary Actions:** Clean up route definitions, protect submission forms and profile page, and extract repeated API auth logic.

The security posture is reasonable but can be significantly improved by activating the middleware and implementing the recommendations above.

---

## Appendix: Complete Route Inventory

### All Route Files (51 total)

**Admin Pages (13)**
- /admin/page.tsx
- /admin/credits/page.tsx
- /admin/database/page.tsx
- /admin/decks/page.tsx
- /admin/decks/[id]/page.tsx
- /admin/decks/import/page.tsx
- /admin/docs/page.tsx
- /admin/products/page.tsx
- /admin/settings/page.tsx
- /admin/submissions/page.tsx
- /admin/test/fetch/page.tsx
- /admin/users/page.tsx

**Admin API Routes (14)**
- /api/admin/database/query/route.ts
- /api/admin/decks/import/route.ts
- /api/admin/decks/[id]/route.ts
- /api/admin/developer/reset-tier/route.ts
- /api/admin/developer/spoof-tier/route.ts
- /api/admin/moxfield/route.ts
- /api/admin/products/route.ts
- /api/admin/products/[id]/route.ts
- /api/admin/site-config/route.ts
- /api/admin/site-config/add/route.ts
- /api/admin/site-config/[key]/route.ts
- /api/admin/submissions/[id]/route.ts
- /api/admin/users/add/route.ts
- /api/admin/users/update-role/route.ts

**Public API Routes (5)**
- /api/card-image/route.ts
- /api/health/route.ts
- /api/metrics/route.ts
- /api/submit-deck/route.ts
- /api/submit-roast/route.ts

**Auth Routes (9)**
- /auth/api/moxfield/route.ts
- /auth/callback/route.ts
- /auth/callback-success/page.tsx
- /auth/login/page.tsx
- /auth/logout/route.ts
- /auth/patreon/route.ts
- /auth/patreon-callback/route.ts
- /auth/reset-password/page.tsx
- /auth/verify/page.tsx

**Public Pages (6)**
- /page.tsx (home)
- /about/page.tsx
- /decks/page.tsx
- /decks/[id]/page.tsx
- /decks/submission/page.tsx (NEEDS AUTH)
- /decks/roast-submission/page.tsx (NEEDS AUTH)

**User Pages (1)**
- /profile/page.tsx (NEEDS AUTH)

**Pivot Pages (4)**
- /pivot/college/page.tsx
- /pivot/home/page.tsx
- /pivot/preview/page.tsx
- /pivot/store/page.tsx

---

**End of Report**
