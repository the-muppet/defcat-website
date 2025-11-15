# Authentication & Authorization Architecture

This document contains diagrams showing the authentication and authorization flows in DefCat's DeckVault.

**Last Updated:** 2025-11-15

## 1. Three-Tier Supabase Client Architecture

```mermaid
graph TB
    subgraph "Client Context - Browser"
        ClientComp[Client Component<br/>'use client']
        ClientHooks[React Hooks<br/>useState, useEffect]
        BrowserClient[createBrowserClient<br/>@supabase/ssr]
    end

    subgraph "Server Context - RSC/Actions"
        ServerComp[Server Component<br/>async function]
        ServerActions[Server Actions<br/>async function]
        RouteHandlers[Route Handlers<br/>API Routes]
        ServerClient[createServerClient<br/>@supabase/ssr<br/>+ cookies]
    end

    subgraph "Admin Context - Privileged"
        AdminScripts[Background Scripts]
        AdminOps[Admin Operations]
        AdminClient[createAdminClient<br/>@supabase/supabase-js<br/>Service Role Key]
    end

    subgraph "Supabase Backend"
        SupabaseAuth[Supabase Auth]
        SupabaseDB[(PostgreSQL)]
        RLS[Row Level Security]
    end

    %% Client Flow
    ClientComp --> ClientHooks
    ClientHooks --> BrowserClient
    BrowserClient -->|Anon Key| SupabaseAuth
    BrowserClient -->|User Session| RLS
    RLS -->|Filtered by User| SupabaseDB

    %% Server Flow
    ServerComp --> ServerClient
    ServerActions --> ServerClient
    RouteHandlers --> ServerClient
    ServerClient -->|Anon Key + Cookies| SupabaseAuth
    ServerClient -->|User Session| RLS

    %% Admin Flow
    AdminScripts --> AdminClient
    AdminOps --> AdminClient
    AdminClient -->|Service Role Key| SupabaseAuth
    AdminClient -.Bypasses RLS.-> SupabaseDB

    %% Styling
    classDef client fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef server fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef admin fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef backend fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class ClientComp,ClientHooks,BrowserClient client
    class ServerComp,ServerActions,RouteHandlers,ServerClient server
    class AdminScripts,AdminOps,AdminClient admin
    class SupabaseAuth,SupabaseDB,RLS backend
```

## 2. Server Component Auth Guard Flow

```mermaid
flowchart TD
    Start[Server Component Rendered] --> RequireAuth{Choose Guard<br/>requireAuth<br/>requireRole<br/>requireTier<br/>requireMember<br/>requireModerator<br/>requireAdmin<br/>requireDeveloper}

    RequireAuth --> CoreAuth[Call getUserWithRole<br/>from core.ts]
    CoreAuth --> CreateClient[createClient<br/>server.ts]
    CreateClient --> GetUser[supabase.auth.getUser]
    GetUser --> UserExists{User<br/>Authenticated?}

    UserExists -->|No| RedirectLogin[redirect<br/>/auth/login?error=auth_required]
    UserExists -->|Yes| FetchProfile[Query profiles table<br/>role, patreon_tier, patreon_id]

    FetchProfile --> ReturnAuthResult[Return AuthResult<br/>user, role, patreonTier, patreonId]
    ReturnAuthResult --> ValidateAccess{Validate<br/>Role/Tier?}

    ValidateAccess -->|Role Check| CheckRole{hasMinimumRole<br/>from core.ts}
    ValidateAccess -->|Tier Check| CheckTier{hasMinimumTier<br/>from core.ts}
    ValidateAccess -->|Auth Only| Success[Return User]

    CheckRole -->|Fail| RedirectHome[redirect<br/>/?error=unauthorized]
    CheckRole -->|Pass| Success
    CheckTier -->|Fail| RedirectTier[redirect<br/>/?error=tier_required]
    CheckTier -->|Pass| Success

    Success --> RenderPage[Render Protected Page]
    RedirectLogin --> ShowLogin[Show Login Page]
    RedirectHome --> ShowHome[Show Home with Error]
    RedirectTier --> ShowHome

    %% Hierarchy Notes
    RoleHierarchy[Role Hierarchy<br/>user: 0<br/>member: 1<br/>moderator: 2<br/>admin: 3<br/>developer: 4]
    TierHierarchy[Tier Hierarchy<br/>Citizen: 0<br/>Knight: 1<br/>Emissary: 2<br/>Duke: 3<br/>Wizard: 4<br/>ArchMage: 5]

    CheckRole -.uses ROLE_HIERARCHY.-> RoleHierarchy
    CheckTier -.uses TIER_RANKS.-> TierHierarchy

    %% Styling
    classDef success fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class RenderPage,ReturnAuthResult,Success success
    class RedirectLogin,RedirectHome,RedirectTier error
    class CreateClient,GetUser,FetchProfile,CoreAuth process
    class UserExists,CheckRole,CheckTier,ValidateAccess decision
```

## 3. API Route Auth Guard Flow

```mermaid
flowchart TD
    Start[API Route Handler] --> RequireAuthAPI{Choose Guard<br/>requireAuth<br/>requireRole<br/>requireTier<br/>requireMember<br/>requireAdmin<br/>requireDeveloper}

    RequireAuthAPI --> CoreAuth[Call getUserWithRole<br/>from core.ts]
    CoreAuth --> CreateClient[createClient<br/>server.ts]
    CreateClient --> GetUser[supabase.auth.getUser]
    GetUser --> UserExists{User<br/>Authenticated?}

    UserExists -->|No| Return401[Return ApiGuardResult<br/>ok: false<br/>401 AUTH_REQUIRED]
    UserExists -->|Yes| FetchProfile[Query profiles table<br/>role, patreon_tier, patreon_id]

    FetchProfile --> ReturnData[Got AuthResult<br/>user, role, patreonTier, patreonId]
    ReturnData --> ValidateAccess{Validate<br/>Role/Tier?}

    ValidateAccess -->|Role Check| CheckRole{hasMinimumRole<br/>from core.ts}
    ValidateAccess -->|Tier Check| CheckTier{hasMinimumTier<br/>from core.ts}
    ValidateAccess -->|Auth Only| ReturnSuccess

    CheckRole -->|Fail| Return403Role[Return ApiGuardResult<br/>ok: false<br/>403 FORBIDDEN<br/>required/current role]
    CheckRole -->|Pass| ReturnSuccess[Return ApiGuardResult<br/>ok: true<br/>data: AuthResult]
    CheckTier -->|Fail| Return403Tier[Return ApiGuardResult<br/>ok: false<br/>403 TIER_REQUIRED<br/>required/current tier]
    CheckTier -->|Pass| ReturnSuccess

    ReturnSuccess --> UnpackResult[Handler unpacks result<br/>const authData = result.data]
    UnpackResult --> ProcessRequest[Process API Request]

    Return401 --> ClientHandles401[Client Handles 401]
    Return403Role --> ClientHandles403[Client Handles 403]
    Return403Tier --> ClientHandles403

    ProcessRequest --> SuccessResponse[Return 200 OK<br/>with Data]

    %% Guard Result Type
    GuardResult["ApiGuardResult Type<br/>{ok: true, data: AuthResult}<br/>OR<br/>{ok: false, response: NextResponse}"]

    ReturnSuccess -.returns.-> GuardResult
    Return401 -.returns.-> GuardResult
    Return403Role -.returns.-> GuardResult
    Return403Tier -.returns.-> GuardResult

    %% Styling
    classDef success fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class ProcessRequest,SuccessResponse,ReturnSuccess,UnpackResult success
    class Return401,Return403Role,Return403Tier,ClientHandles401,ClientHandles403 error
    class CreateClient,GetUser,FetchProfile,CoreAuth,ReturnData process
    class UserExists,CheckRole,CheckTier,ValidateAccess decision
```

## 4. Role-Based Access Control Hierarchy

```mermaid
graph TB
    subgraph "Role Hierarchy - Inheritance Model"
        Developer[Developer<br/>Level 4<br/>Highest Permissions]
        Admin[Admin<br/>Level 3]
        Moderator[Moderator<br/>Level 2]
        Member[Member<br/>Level 1]
        User[User<br/>Level 0<br/>Base Permissions]
    end

    Developer -->|inherits| Admin
    Admin -->|inherits| Moderator
    Moderator -->|inherits| Member
    Member -->|inherits| User

    subgraph "Permission Examples"
        DevPerms[Developer<br/>- System Configuration<br/>- Database Management<br/>- All Admin Features]
        AdminPerms[Admin<br/>- User Management<br/>- Content Moderation<br/>- Site Configuration]
        ModPerms[Moderator<br/>- Submission Review<br/>- Content Editing<br/>- User Support]
        MemberPerms[Member<br/>- Deck Submissions<br/>- Roast Requests<br/>- Premium Content]
        UserPerms[User<br/>- Browse Decks<br/>- View Content<br/>- Account Management]
    end

    Developer -.has.-> DevPerms
    Admin -.has.-> AdminPerms
    Moderator -.has.-> ModPerms
    Member -.has.-> MemberPerms
    User -.has.-> UserPerms

    %% Styling
    classDef highest fill:#ffebee,stroke:#c62828,stroke-width:3px
    classDef high fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef medium fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef low fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef base fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class Developer,DevPerms highest
    class Admin,AdminPerms high
    class Moderator,ModPerms medium
    class Member,MemberPerms low
    class User,UserPerms base
```

## 5. Middleware Session Refresh Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Middleware as Next.js Middleware
    participant SupabaseMiddleware as updateSession
    participant Supabase as Supabase Auth

    Browser->>+Middleware: Request (with cookies)
    Middleware->>+SupabaseMiddleware: updateSession(request)

    SupabaseMiddleware->>SupabaseMiddleware: createServerClient<br/>with cookie handlers

    SupabaseMiddleware->>+Supabase: getUser()
    Supabase-->>-SupabaseMiddleware: User data

    SupabaseMiddleware->>SupabaseMiddleware: Check if /admin route

    alt User not authenticated & /admin route
        SupabaseMiddleware->>Browser: 302 Redirect<br/>/auth/login?redirectTo=/admin
    else Authenticated or public route
        SupabaseMiddleware->>SupabaseMiddleware: Refresh session cookies
        SupabaseMiddleware-->>-Middleware: NextResponse with updated cookies
        Middleware-->>-Browser: Response with fresh session
    end

    Note over SupabaseMiddleware,Supabase: CRITICAL: Session cookies must<br/>be returned exactly as Supabase<br/>provides them
```

## Key Authentication Patterns

### Three-Module Architecture

The auth system is split into three modules:

1. **`core.ts`** - Shared core logic
   - `getUserWithRole()` - Fetches user with profile data
   - `hasMinimumRole()` - Role hierarchy validation
   - `hasMinimumTier()` - Tier hierarchy validation
   - Uses `ROLE_HIERARCHY` and `TIER_RANKS` from `types/core.ts`

2. **`server.ts`** - Server Component guards
   - `requireAuth()`, `requireRole()`, `requireTier()`
   - Convenience functions: `requireMember()`, `requireAdmin()`, etc.
   - **Redirects** on auth failure using Next.js `redirect()`
   - Non-redirecting helpers: `getCurrentUser()`, `hasRole()`, `hasTier()`

3. **`api.ts`** - API Route guards
   - Same function names as server.ts
   - **Returns `NextResponse`** instead of redirecting
   - Returns `ApiGuardResult` type: `{ok: true, data: AuthResult}` or `{ok: false, response: NextResponse}`
   - Includes `ApiErrors` helper object for standard error responses

### Server Component Pattern
```typescript
// src/app/admin/page.tsx
import { requireAdmin } from '@/lib/auth/server'

export default async function AdminPage() {
  const { user, role, patreonTier } = await requireAdmin()
  const supabase = await createClient()

  // Fetch data with RLS applied
  const { data } = await supabase.from('decks').select('*')

  return <AdminDashboard user={user} decks={data} />
}
```

### API Route Pattern
```typescript
// src/app/api/admin/users/route.ts
import { requireAdmin } from '@/lib/auth/api'

export async function GET(request: Request) {
  const result = await requireAdmin()
  if (!result.ok) return result.response

  const { user, role, patreonTier } = result.data

  // Process request with authenticated user
  return NextResponse.json({ data })
}
```

### Tier-Based Access Pattern
```typescript
// Require specific Patreon tier
import { requireTier, requireWizard } from '@/lib/auth/server'

export default async function PremiumPage() {
  // Either specific tier
  const { user, patreonTier } = await requireTier('Wizard')

  // Or convenience function
  const authData = await requireWizard()

  return <PremiumContent />
}
```

### Client Component Pattern
```typescript
// src/components/admin/Panel.tsx
'use client'

export function AdminPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-data'],
    queryFn: async () => {
      const res = await fetch('/api/admin/data')
      if (!res.ok) throw new Error('Unauthorized')
      return res.json()
    }
  })

  return <div>...</div>
}
```

## Security Considerations

1. **Never mix client types**: Always use the correct Supabase client for the context
2. **API routes use API guards**: Returns responses instead of redirecting
3. **Middleware is critical**: Must return Supabase response with cookies intact
4. **RLS is the last line of defense**: Even with auth guards, RLS policies protect data
5. **Admin client bypasses RLS**: Use only in trusted server-side contexts
6. **Role hierarchy**: Higher roles automatically satisfy lower role requirements
