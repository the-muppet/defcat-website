# Data Flow & State Management

This document shows how data flows through DefCat's DeckVault using TanStack Query, Server Components, and Supabase.

## Overall Data Flow Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        ClientComponents[Client Components<br/>'use client']
        TanStackQuery[TanStack Query<br/>React Query]
        BrowserState[Local Component State<br/>useState, useReducer]
        ReactContext[React Contexts<br/>Auth, Theme]
    end

    subgraph "Server Components"
        ServerComponents[Server Components<br/>async functions]
        ServerFetch[Direct Data Fetching<br/>await supabase.from...]
    end

    subgraph "API Layer"
        APIRoutes[API Routes<br/>/api/*]
        RouteHandlers[Route Handlers<br/>GET/POST/PATCH/DELETE]
    end

    subgraph "Data Access Layer"
        ServerClient[Server Supabase Client<br/>createClient - server.ts]
        BrowserClient[Browser Supabase Client<br/>createClient - client.ts]
        AdminClient[Admin Supabase Client<br/>createAdminClient]
    end

    subgraph "Backend - Supabase"
        SupabaseAuth[Supabase Auth<br/>User Sessions]
        SupabaseDB[(PostgreSQL<br/>Database)]
        SupabaseStorage[Supabase Storage<br/>Card Images]
        RLS[Row Level Security<br/>Policies]
    end

    subgraph "External APIs"
        Patreon[Patreon API<br/>OAuth & Tiers]
        Moxfield[Moxfield API<br/>Deck Data]
        Scryfall[Scryfall API<br/>Card Data]
    end

    %% Client Component Flow
    ClientComponents --> TanStackQuery
    ClientComponents --> BrowserState
    ClientComponents --> ReactContext

    TanStackQuery --> APIRoutes
    TanStackQuery --> BrowserClient

    BrowserClient --> SupabaseAuth
    BrowserClient --> RLS
    RLS --> SupabaseDB

    %% Server Component Flow
    ServerComponents --> ServerFetch
    ServerFetch --> ServerClient
    ServerClient --> SupabaseAuth
    ServerClient --> RLS

    %% API Route Flow
    APIRoutes --> RouteHandlers
    RouteHandlers --> ServerClient
    RouteHandlers --> AdminClient

    AdminClient -.bypasses RLS.-> SupabaseDB

    %% External API Integration
    APIRoutes --> Patreon
    APIRoutes --> Moxfield
    APIRoutes --> Scryfall

    %% Storage
    ServerClient --> SupabaseStorage
    BrowserClient --> SupabaseStorage

    %% Styling
    classDef client fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef server fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef api fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class ClientComponents,TanStackQuery,BrowserState,ReactContext,BrowserClient client
    class ServerComponents,ServerFetch,ServerClient server
    class APIRoutes,RouteHandlers api
    class SupabaseAuth,SupabaseDB,SupabaseStorage,RLS,AdminClient database
    class Patreon,Moxfield,Scryfall external
```

## TanStack Query Data Flow

```mermaid
sequenceDiagram
    participant Component as Client Component
    participant TanStack as TanStack Query
    participant Cache as Query Cache
    participant API as API Route
    participant Supabase as Supabase
    participant DB as PostgreSQL

    Component->>TanStack: useQuery({ queryKey, queryFn })

    alt Cache Hit (Fresh)
        TanStack->>Cache: Check cache
        Cache-->>TanStack: Return cached data
        TanStack-->>Component: Render with cached data
    else Cache Miss or Stale
        TanStack->>Cache: Check cache
        Cache-->>TanStack: Stale or missing

        alt Has Stale Data
            TanStack-->>Component: Render with stale data
            TanStack->>TanStack: Background refetch
        else No Data
            TanStack-->>Component: Show loading state
        end

        TanStack->>+API: queryFn() - fetch('/api/endpoint')
        API->>API: Auth guard check
        API->>+Supabase: Query database
        Supabase->>+DB: SQL query with RLS
        DB-->>-Supabase: Filtered results
        Supabase-->>-API: Data
        API-->>-TanStack: JSON response

        TanStack->>Cache: Update cache
        TanStack-->>Component: Render with fresh data
    end

    Note over Component,DB: Automatic background refetching<br/>Stale-while-revalidate pattern<br/>Optimistic updates supported
```

## Server Component Data Fetching

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js Server
    participant RSC as Server Component
    participant ServerClient as Server Supabase Client
    participant Supabase as Supabase
    participant DB as PostgreSQL

    Browser->>+NextJS: Request page
    NextJS->>+RSC: Render component

    RSC->>RSC: await requireAuth()<br/>Check authentication

    alt User Authenticated
        RSC->>+ServerClient: createClient()
        ServerClient->>ServerClient: Load cookies<br/>(session tokens)

        RSC->>+Supabase: supabase.from('decks').select('*')
        Supabase->>Supabase: Apply RLS policies<br/>based on session
        Supabase->>+DB: SELECT with user context
        DB-->>-Supabase: Filtered rows
        Supabase-->>-RSC: Data

        RSC->>RSC: Render with data
        RSC-->>-NextJS: HTML with data
        NextJS-->>-Browser: Rendered page

        Note over Browser,DB: No client-side fetching<br/>Data embedded in HTML<br/>Instant page load
    else User Not Authenticated
        RSC->>Browser: redirect('/auth/login')
    end
```

## Mutation Flow (TanStack Query)

```mermaid
sequenceDiagram
    participant User
    participant Component as Client Component
    participant Mutation as useMutation
    participant Optimistic as Optimistic Update
    participant Cache as Query Cache
    participant API as API Route
    participant DB as Database

    User->>Component: Submit form<br/>(e.g., submit deck)

    Component->>Mutation: mutate(data)

    alt Optimistic Update
        Mutation->>Optimistic: Apply optimistic update
        Optimistic->>Cache: Update cache immediately
        Cache-->>Component: Render with optimistic data
        Component-->>User: Show success state
    end

    Mutation->>+API: POST /api/submit-deck<br/>{deck data}

    API->>API: requireMemberApi()<br/>Check auth & credits

    alt Auth Success
        API->>+DB: INSERT deck_submission
        DB-->>-API: Success

        API-->>-Mutation: 200 OK

        Mutation->>Cache: Invalidate related queries<br/>queryClient.invalidateQueries(['submissions'])

        Cache->>API: Background refetch
        API->>DB: Fresh data
        DB-->>API: Updated data
        API-->>Cache: Fresh data
        Cache-->>Component: Update UI

        Component-->>User: Show final state
    else Auth Failed or Error
        API-->>-Mutation: 401/403/500 Error

        Mutation->>Optimistic: Rollback optimistic update
        Optimistic->>Cache: Restore previous state
        Cache-->>Component: Restore UI

        Component-->>User: Show error message
    end
```

## Query Invalidation & Refetching

```mermaid
flowchart TD
    Start[User Action] --> DetermineMutation{What Changed?}

    DetermineMutation -->|Deck Created| InvalidateDecks[Invalidate 'decks' query]
    DetermineMutation -->|Submission Created| InvalidateSubs[Invalidate 'submissions' query]
    DetermineMutation -->|Profile Updated| InvalidateProfile[Invalidate 'profile' query]
    DetermineMutation -->|Tier Changed| InvalidateAll[Invalidate multiple queries]

    InvalidateDecks --> QueryClient[queryClient.invalidateQueries]
    InvalidateSubs --> QueryClient
    InvalidateProfile --> QueryClient
    InvalidateAll --> QueryClient

    QueryClient --> CheckActive{Query<br/>Currently Active?}

    CheckActive -->|Yes| ImmediateRefetch[Immediate refetch]
    CheckActive -->|No| MarkStale[Mark as stale<br/>Refetch on next mount]

    ImmediateRefetch --> FetchAPI[Fetch from API]
    FetchAPI --> UpdateCache[Update cache]
    UpdateCache --> ReRender[Re-render components]

    MarkStale --> NextMount[Wait for component mount]
    NextMount --> FetchAPI

    %% Styling
    classDef action fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class Start,InvalidateDecks,InvalidateSubs,InvalidateProfile,InvalidateAll action
    class QueryClient,ImmediateRefetch,MarkStale,FetchAPI,UpdateCache,ReRender,NextMount process
    class DetermineMutation,CheckActive decision
```

## Common Data Flow Patterns

### Pattern 1: Server Component + Direct Fetch

```mermaid
graph LR
    Page[Page Component<br/>Server Component] --> Auth[requireAuth]
    Auth --> CreateClient[createClient<br/>server.ts]
    CreateClient --> Fetch[supabase.from<br/>direct query]
    Fetch --> Render[Render with data]

    style Page fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Fetch fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Render fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
```

**Use When:**
- Initial page load
- Data doesn't need client-side reactivity
- SEO-critical content
- No real-time updates needed

### Pattern 2: Client Component + TanStack Query

```mermaid
graph LR
    Component[Client Component<br/>'use client'] --> UseQuery[useQuery<br/>queryKey, queryFn]
    UseQuery --> CheckCache{Cache?}
    CheckCache -->|Hit| ReturnCached[Return cached]
    CheckCache -->|Miss| FetchAPI[Fetch API]
    FetchAPI --> UpdateCache[Update cache]
    UpdateCache --> ReRender[Re-render]

    style Component fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style UseQuery fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style FetchAPI fill:#fff3e0,stroke:#f57c00,stroke-width:2px
```

**Use When:**
- User interactions trigger data changes
- Real-time updates needed
- Optimistic updates required
- Client-side filtering/sorting

### Pattern 3: Hybrid - Server Initial + Client Updates

```mermaid
graph TB
    ServerComponent[Server Component] --> InitialFetch[Initial data fetch]
    InitialFetch --> PassProps[Pass as props]
    PassProps --> ClientComponent[Client Component<br/>'use client']

    ClientComponent --> InitializeQuery[Initialize TanStack Query<br/>with initial data]
    InitializeQuery --> BackgroundRefetch[Background refetch]
    BackgroundRefetch --> Updates[Handle updates]

    style ServerComponent fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style ClientComponent fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style InitializeQuery fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
```

**Use When:**
- Best of both worlds
- Fast initial render (server)
- Interactive updates (client)
- Complex UIs

## Query Key Patterns

```mermaid
graph TB
    subgraph "Query Key Structure"
        AllDecks["('decks')<br/>All decks"]
        DecksByFilter["('decks', filter)<br/>Filtered decks"]
        SingleDeck["('decks', deckId)<br/>Single deck"]

        AllSubmissions["('submissions')<br/>All submissions"]
        UserSubmissions["('submissions', userId)<br/>User submissions"]

        Profile["('profile')<br/>Current user profile"]
        UserProfile["('profile', userId)<br/>Specific user"]
    end

    subgraph "Invalidation Hierarchy"
        InvalidateAll["invalidateQueries(('decks'))<br/>Invalidates ALL deck queries"]
        InvalidateFiltered["invalidateQueries(('decks', filter))<br/>Invalidates specific filter"]
        InvalidateSingle["invalidateQueries(('decks', deckId))<br/>Invalidates single deck"]
    end

    InvalidateAll -.affects.-> AllDecks
    InvalidateAll -.affects.-> DecksByFilter
    InvalidateAll -.affects.-> SingleDeck

    InvalidateFiltered -.affects.-> DecksByFilter

    InvalidateSingle -.affects.-> SingleDeck

    %% Styling
    classDef key fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef invalidate fill:#ffebee,stroke:#c62828,stroke-width:2px

    class AllDecks,DecksByFilter,SingleDeck,AllSubmissions,UserSubmissions,Profile,UserProfile key
    class InvalidateAll,InvalidateFiltered,InvalidateSingle invalidate
```

## State Management Layers

```mermaid
graph TB
    subgraph "Global State - React Context"
        AuthContext[AuthContext<br/>Current user session]
        ThemeContext[ThemeContext<br/>Dark/Light mode]
    end

    subgraph "Server State - TanStack Query"
        DecksQuery[Decks Query<br/>Cached deck data]
        SubmissionsQuery[Submissions Query<br/>User submissions]
        ProfileQuery[Profile Query<br/>User profile]
    end

    subgraph "Local State - useState"
        FormState[Form State<br/>Input values]
        UIState[UI State<br/>Modals, dropdowns]
        TempState[Temp State<br/>Filters, sorting]
    end

    AuthContext -.provides.-> Components[Components]
    ThemeContext -.provides.-> Components

    DecksQuery -.provides.-> Components
    SubmissionsQuery -.provides.-> Components
    ProfileQuery -.provides.-> Components

    FormState -.manages.-> Components
    UIState -.manages.-> Components
    TempState -.manages.-> Components

    %% Styling
    classDef context fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef query fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef local fill:#e8f5e9,stroke:#388e3c,stroke-width:2px

    class AuthContext,ThemeContext context
    class DecksQuery,SubmissionsQuery,ProfileQuery query
    class FormState,UIState,TempState local
```

## Caching Strategy

### TanStack Query Cache Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      cacheTime: 10 * 60 * 1000,       // 10 minutes
      refetchOnWindowFocus: true,       // Refetch on focus
      refetchOnReconnect: true,         // Refetch on reconnect
      retry: 1,                         // Retry once on failure
    },
  },
})
```

### Cache Behavior

| Data Type | Stale Time | Cache Time | Refetch on Focus |
|-----------|------------|------------|------------------|
| Decks List | 5 min | 10 min | Yes |
| Deck Detail | 5 min | 10 min | Yes |
| User Profile | 10 min | 30 min | Yes |
| Submissions | 2 min | 5 min | Yes |
| Site Config | 30 min | 60 min | No |

## Real-World Examples

### Example 1: Deck Submission Flow

```mermaid
sequenceDiagram
    actor User
    participant Form as DeckSubmissionForm
    participant Mutation as useMutation
    participant API as /api/submit-deck
    participant Credits as Credit System
    participant DB as Database
    participant Cache as Query Cache

    User->>Form: Fill out form
    User->>Form: Click Submit

    Form->>Mutation: mutate(formData)

    Mutation->>+API: POST /api/submit-deck

    API->>API: requireMemberApi()
    API->>+Credits: Check credits available
    Credits-->>-API: Credits OK

    API->>+DB: INSERT deck_submission
    API->>DB: CALL use_credit()
    DB-->>-API: Success

    API-->>-Mutation: 201 Created

    Mutation->>Cache: invalidateQueries(['submissions'])
    Mutation->>Cache: invalidateQueries(['profile'])

    Cache-->>Form: Trigger refetch

    Form-->>User: Show success message
```

### Example 2: Admin Deck Import

```mermaid
sequenceDiagram
    actor Admin
    participant Component as ImportButton
    participant Mutation as useMutation
    participant API as /api/admin/decks/import
    participant Moxfield as Moxfield API
    participant DB as Database
    participant Cache as Query Cache

    Admin->>Component: Click Import All

    Component->>Mutation: mutate()
    Component-->>Admin: Show loading state

    Mutation->>+API: POST /api/admin/decks/import

    API->>API: requireAdminApi()

    loop For each bookmark
        API->>+Moxfield: Fetch decks
        Moxfield-->>-API: Deck data

        API->>+DB: UPSERT decks
        DB-->>-API: Success
    end

    API-->>-Mutation: 200 OK<br/>{imported: 50, updated: 20}

    Mutation->>Cache: invalidateQueries(['decks'])
    Cache-->>Component: Refetch all deck queries

    Component-->>Admin: Show success with stats
```

## Performance Optimizations

1. **Prefetching**: Hover over deck cards prefetches deck details
2. **Pagination**: Only load visible page, cache pages separately
3. **Infinite Query**: Scroll-based loading for long lists
4. **Parallel Queries**: Load multiple resources simultaneously
5. **Background Refetch**: Update stale data without blocking UI
6. **Optimistic Updates**: Instant UI feedback on mutations
7. **Query Deduplication**: Multiple components, single network request
