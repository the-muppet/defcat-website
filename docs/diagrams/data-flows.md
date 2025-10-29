# DefCat DeckVault - Data Flow Diagrams

## Key User Journeys

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextApp as Next.js App
    participant AuthAPI as /api/auth
    participant Patreon as Patreon OAuth
    participant DB as Supabase DB

    User->>Browser: Click "Login with Patreon"
    Browser->>NextApp: GET /auth/login
    NextApp->>Browser: Redirect to Patreon

    Browser->>Patreon: OAuth Authorization Request
    Patreon->>User: Login Prompt
    User->>Patreon: Approve Access

    Patreon->>Browser: Redirect with code
    Browser->>AuthAPI: GET /auth/callback?code=xxx

    AuthAPI->>Patreon: POST /api/oauth2/token
    Patreon->>AuthAPI: Access Token + Refresh Token

    AuthAPI->>Patreon: GET /api/oauth2/v2/identity
    Patreon->>AuthAPI: User Profile

    AuthAPI->>Patreon: GET /api/oauth2/v2/identity?include=memberships
    Patreon->>AuthAPI: Membership + Tier Data

    AuthAPI->>DB: Upsert Profile
    Note over AuthAPI,DB: Update patreon_id, email,<br/>tier_id, avatar_url
    DB->>AuthAPI: Profile Saved

    AuthAPI->>Browser: Set Session Cookie + Redirect
    Browser->>NextApp: GET /profile
    NextApp->>Browser: Render Profile Page

    Note over User,DB: User is now authenticated<br/>Session expires in 7 days
```

### 2. Deck Submission Flow

```mermaid
sequenceDiagram
    actor User
    participant Form as DeckForm Component
    participant API as /api/submit-deck
    participant DB as Supabase DB
    participant Email as Resend API
    participant Admin

    User->>Form: Fill Submission Form
    Note over User,Form: Deck name, commanders,<br/>theme, color identity

    Form->>Form: Client-side Validation
    Form->>API: POST /api/submit-deck

    API->>DB: Check User Tier
    DB->>API: Tier: "Commander Aficionado"

    API->>DB: Count Monthly Submissions
    Note over API,DB: WHERE user_id = X AND<br/>month = current AND<br/>status != 'rejected'
    DB->>API: Count: 2/3 (within limit)

    API->>DB: Create deck_submission
    Note over API,DB: status = 'pending'<br/>submission_month = 11<br/>submission_year = 2025
    DB->>API: Submission Created (ID: 123)

    par Send Email and Return Response
        API->>Email: Send Confirmation Email
        Note over API,Email: Template: deck-submission-received.tsx<br/>To: user email
        Email-->>User: Email Delivered
    and
        API->>Form: Return Success
        Form->>User: Show Success Message
    end

    Note over Admin: Admin later reviews submission<br/>in /admin/submissions

    Admin->>DB: Update submission status
    Note over Admin,DB: status = 'approved'<br/>reviewed_by = admin_id
    DB->>Admin: Updated

    Admin->>Email: Send Approval Email
    Email-->>User: "Your deck request was approved!"
```

### 3. Deck Import from Moxfield (Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant UI as ImportDeckForm
    participant API as /api/admin/decks/import
    participant Moxfield as Moxfield API
    participant Scryfall as Scryfall API
    participant DB as Supabase DB

    Admin->>UI: Enter Moxfield URL
    UI->>API: POST /api/admin/decks/import

    API->>Moxfield: GET /v2/decks/{publicId}
    Moxfield->>API: Deck JSON
    Note over Moxfield,API: Name, commanders, mainboard,<br/>sideboard, description

    loop For each unique card
        API->>DB: Check if card exists
        alt Card not in cache
            API->>Scryfall: GET /cards/named?exact={name}
            Scryfall->>API: Card Data
            Note over Scryfall,API: Types, colors, image,<br/>prices, legalities
            API->>DB: Insert Card
            DB->>API: Card Created
        else Card cached
            DB->>API: Existing Card
        end
    end

    API->>DB: Create Deck Record
    Note over API,DB: name, commanders[],<br/>color_identity, theme,<br/>moxfield_id, moxfield_url
    DB->>API: Deck Created (ID: 456)

    loop For each card in deck
        API->>DB: Create deck_cards entry
        Note over API,DB: deck_id, card_id,<br/>quantity, category
        DB->>API: Entry Created
    end

    API->>UI: Import Success
    UI->>Admin: Show Deck Preview

    Admin->>Admin: Navigate to /decks/456
```

### 4. Deck Browsing Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Page as /decks/page.tsx
    participant Component as DeckGrid
    participant Query as TanStack Query
    participant API as Supabase Client
    participant DB as Supabase DB

    User->>Browser: Navigate to /decks
    Browser->>Page: Request Page

    Page->>Component: Render DeckGrid
    Component->>Query: useQuery('decks', filters)

    Query->>Query: Check Cache
    alt Cache Hit (< 5 min)
        Query->>Component: Return Cached Data
    else Cache Miss or Stale
        Query->>API: createClient().from('decks').select()
        API->>DB: SELECT * FROM decks WHERE is_public = true
        DB->>API: Deck Records
        API->>Query: Deck Data
        Query->>Query: Update Cache
        Query->>Component: Return Fresh Data
    end

    Component->>Component: Render DeckCard[]
    Component->>Browser: HTML + Data
    Browser->>User: Display Deck Grid

    User->>Browser: Click Color Filter "UG"
    Browser->>Page: Update URL: /decks?color=UG

    Page->>Component: Re-render with new filter
    Component->>Query: useQuery('decks', { color: 'UG' })
    Query->>API: .eq('color_identity', 'UG')
    API->>DB: SELECT * WHERE color_identity = 'UG'
    DB->>API: Filtered Decks
    API->>Component: Filtered Data
    Component->>Browser: Updated Grid
    Browser->>User: Show Only UG Decks
```

### 5. Admin User Management Flow

```mermaid
sequenceDiagram
    actor Admin
    participant UI as UserTable Component
    participant API as /api/admin/users
    participant AdminClient as Admin Supabase Client
    participant DB as Supabase DB

    Admin->>UI: Navigate to /admin/users
    UI->>AdminClient: Fetch All Users
    Note over UI,AdminClient: Using admin client<br/>bypasses RLS
    AdminClient->>DB: SELECT * FROM profiles
    DB->>AdminClient: All User Records
    AdminClient->>UI: User Data
    UI->>Admin: Display User Table

    Admin->>UI: Click "Change Role" on User
    UI->>Admin: Show Role Selection Dialog
    Admin->>UI: Select "moderator"

    UI->>API: PATCH /api/admin/users/update-role
    Note over UI,API: Body: { userId, role: 'moderator' }

    API->>API: Verify Admin Permissions
    API->>AdminClient: Update Profile
    AdminClient->>DB: UPDATE profiles SET role = 'moderator'
    DB->>AdminClient: Update Successful
    AdminClient->>API: Success

    API->>UI: Return Updated User
    UI->>UI: Invalidate Query Cache
    UI->>UI: Optimistic Update
    UI->>Admin: Show Success Toast

    Note over Admin,DB: User role updated<br/>New permissions take effect<br/>on next request
```

## Data Access Patterns

### Browser Client (Anonymous)

```mermaid
flowchart LR
    A[Client Component] --> B[createClient<br/>lib/supabase/client.ts]
    B --> C[Supabase<br/>Anon Key]
    C --> D{RLS Check}
    D -->|Allowed| E[Public Data]
    D -->|Denied| F[403 Error]

    style B fill:#c8e6c9
    style C fill:#fff9c4
    style E fill:#e1bee7
    style F fill:#ffcdd2
```

**Use Cases**:
- Public deck browsing
- Card image loading
- Unauthenticated reads

### Server Client (Authenticated)

```mermaid
flowchart LR
    A[Server Component/<br/>API Route] --> B[createServerClient<br/>lib/supabase/server.ts]
    B --> C[Read Session Cookie]
    C --> D[Supabase<br/>with User Context]
    D --> E{RLS Check}
    E -->|User Owns| F[User Data]
    E -->|Public| G[Public Data]
    E -->|Denied| H[403 Error]

    style B fill:#3ecf8e
    style D fill:#fff9c4
    style F fill:#e1bee7
    style G fill:#e1bee7
    style H fill:#ffcdd2
```

**Use Cases**:
- User profile updates
- Deck submissions
- User-specific queries

### Admin Client (Privileged)

```mermaid
flowchart LR
    A[Admin API Route] --> B[createAdminClient<br/>lib/supabase/admin.ts]
    B --> C[Supabase<br/>Service Role Key]
    C --> D[Bypass RLS]
    D --> E[All Data<br/>Full Access]

    style B fill:#e74c3c
    style C fill:#ff9800
    style E fill:#9c27b0
```

**Use Cases**:
- User role management
- Bulk data operations
- System administration

## Caching Strategy

### TanStack Query Cache Layers

```mermaid
flowchart TB
    A[Component Request] --> B{Query Cache}
    B -->|Hit + Fresh<br/>< 5 min| C[Return Cache]
    B -->|Hit + Stale<br/>> 5 min| D[Return Cache<br/>+ Background Refetch]
    B -->|Miss| E[Fetch from API]

    E --> F[Update Cache]
    D --> F
    F --> G{Garbage Collection}
    G -->|Unused > 10 min| H[Evict from Memory]
    G -->|Recently Used| I[Keep in Cache]

    style B fill:#fff9c4
    style C fill:#c8e6c9
    style D fill:#ffe0b2
    style E fill:#ffcdd2
    style F fill:#e1bee7
```

**Configuration** (`src/app/layout.tsx`):
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
})
```

### Cache Invalidation Patterns

```mermaid
sequenceDiagram
    participant User
    participant Form
    participant Mutation
    participant API
    participant Cache
    participant UI

    User->>Form: Submit Data
    Form->>Mutation: useMutation

    Mutation->>UI: Optimistic Update
    Note over Mutation,UI: Immediately update UI<br/>with expected result

    Mutation->>API: POST Request

    alt Success
        API->>Mutation: Success Response
        Mutation->>Cache: Invalidate Queries
        Note over Mutation,Cache: queryClient.invalidateQueries(['decks'])
        Cache->>API: Refetch Fresh Data
        API->>Cache: New Data
        Cache->>UI: Update with Real Data
    else Error
        API->>Mutation: Error Response
        Mutation->>Cache: Rollback Optimistic Update
        Cache->>UI: Restore Previous State
        Mutation->>User: Show Error Message
    end
```

## Error Handling Flow

```mermaid
flowchart TB
    A[User Action] --> B[API Request]
    B --> C{Response Status}

    C -->|200-299| D[Success Handler]
    C -->|400-499| E[Client Error]
    C -->|500-599| F[Server Error]
    C -->|Network Error| G[Connection Error]

    D --> H[Update UI]

    E --> I{Error Type}
    I -->|401| J[Redirect to Login]
    I -->|403| K[Show Permission Error]
    I -->|404| L[Show Not Found]
    I -->|422| M[Show Validation Errors]

    F --> N[Log to Sentry]
    N --> O[Show Generic Error]
    O --> P[Retry Button]

    G --> Q[Show Offline Notice]
    Q --> R[Auto-Retry with Backoff]

    style D fill:#c8e6c9
    style E fill:#ffe0b2
    style F fill:#ffcdd2
    style G fill:#e1bee7
    style H fill:#c8e6c9
```

## Real-Time Updates (Future)

```mermaid
sequenceDiagram
    participant User1
    participant User2
    participant App1 as User1 Browser
    participant App2 as User2 Browser
    participant Realtime as Supabase Realtime
    participant DB as Database

    User1->>App1: Submit Deck
    App1->>DB: Insert deck_submission
    DB->>App1: Success

    DB->>Realtime: Broadcast INSERT
    Realtime->>App1: Update Event
    Realtime->>App2: Update Event

    App1->>App1: Invalidate Cache
    App2->>App2: Show Toast Notification
    App2->>User2: "New deck submitted!"

    Note over User1,User2: Both users see real-time updates<br/>without manual refresh
```

## Performance Monitoring Data Flow

```mermaid
flowchart LR
    A[User Action] --> B[Next.js App]
    B --> C[Web Vitals]
    C --> D{Metrics}

    D --> E[LCP<br/>Largest Contentful Paint]
    D --> F[FID<br/>First Input Delay]
    D --> G[CLS<br/>Cumulative Layout Shift]

    E --> H[Vercel Analytics]
    F --> H
    G --> H

    B --> I[API Response Times]
    I --> J[/api/metrics endpoint]

    B --> K[Error Boundary]
    K --> L[Sentry]

    style C fill:#fff9c4
    style H fill:#3ecf8e
    style J fill:#e1bee7
    style L fill:#e74c3c
```

## Summary of Data Flow Principles

1. **Server-First**: Data fetching happens on the server when possible
2. **Progressive Enhancement**: Basic functionality works without JS
3. **Optimistic Updates**: UI updates immediately, then confirms with server
4. **Smart Caching**: 5-minute stale time, 10-minute garbage collection
5. **Three-Tier Access**: Browser (public) → Server (user) → Admin (privileged)
6. **Error Resilience**: Automatic retries with exponential backoff
7. **Type Safety**: End-to-end TypeScript from DB to UI
