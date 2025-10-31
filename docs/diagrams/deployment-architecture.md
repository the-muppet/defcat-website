# Deployment Architecture

This document shows the deployment architecture for DefCat's DeckVault on Netlify with Supabase backend.

## Production Deployment Architecture

```mermaid
graph TB
    subgraph "Client Devices"
        Desktop[Desktop Browsers]
        Mobile[Mobile Browsers]
        Tablet[Tablet Browsers]
    end

    subgraph "DNS & CDN Layer"
        DNS[DNS Provider<br/>defcat.net]
        NetlifyCDN[Netlify CDN<br/>Global Edge Network]
    end

    subgraph "Netlify Platform"
        direction TB

        subgraph "Edge Network"
            EdgeNodes[Edge Nodes<br/>Worldwide]
            SSR[Server-Side Rendering<br/>Next.js Pages]
        end

        subgraph "Netlify Functions - Serverless"
            APIFunctions[API Route Handlers<br/>Serverless Functions]
            Background[Background Jobs<br/>Scheduled Functions]
        end

        subgraph "Static Assets"
            HTML[Pre-rendered HTML]
            StaticJS[JavaScript Bundles]
            CSS[CSS Bundles]
            Images[Optimized Images]
        end

        subgraph "Build System"
            GitHook[Git Push Hook]
            BuildProcess[Build Process<br/>bun run build]
            Deploy[Deploy to CDN]
        end
    end

    subgraph "Supabase Cloud"
        direction TB

        subgraph "Database Layer"
            PostgreSQL[(PostgreSQL<br/>Database)]
            RLS[Row Level Security]
            Functions[Database Functions]
            Triggers[Triggers]
        end

        subgraph "Auth Service"
            SupabaseAuth[Supabase Auth<br/>User Management]
            Sessions[Session Management]
        end

        subgraph "Storage"
            CardImages[Card Image Cache<br/>Supabase Storage]
        end

        subgraph "Connection Pooling"
            PgBouncer[PgBouncer<br/>Connection Pooler]
        end
    end

    subgraph "External Services"
        Patreon[Patreon API<br/>OAuth & Tiers]
        Moxfield[Moxfield API<br/>Deck Import]
        Scryfall[Scryfall API<br/>Card Data]
        Resend[Resend<br/>Email Service]
    end

    subgraph "GitHub"
        Repo[Git Repository<br/>Source Code]
    end

    %% Client connections
    Desktop --> DNS
    Mobile --> DNS
    Tablet --> DNS

    DNS --> NetlifyCDN
    NetlifyCDN --> EdgeNodes

    %% Edge network
    EdgeNodes --> SSR
    EdgeNodes --> HTML
    EdgeNodes --> StaticJS
    EdgeNodes --> CSS
    EdgeNodes --> Images

    %% SSR & Functions
    SSR --> APIFunctions
    EdgeNodes --> APIFunctions

    %% Deployment flow
    Repo --> GitHook
    GitHook --> BuildProcess
    BuildProcess --> Deploy
    Deploy --> HTML
    Deploy --> StaticJS
    Deploy --> CSS
    Deploy --> Images

    %% API to Supabase
    APIFunctions --> PgBouncer
    APIFunctions --> SupabaseAuth
    APIFunctions --> CardImages
    SSR --> PgBouncer
    SSR --> SupabaseAuth

    PgBouncer --> PostgreSQL
    SupabaseAuth --> Sessions

    PostgreSQL --> RLS
    PostgreSQL --> Functions
    PostgreSQL --> Triggers

    %% External API calls
    APIFunctions --> Patreon
    APIFunctions --> Moxfield
    APIFunctions --> Scryfall
    APIFunctions --> Resend

    Background --> Moxfield
    Background --> Scryfall
    Background --> PostgreSQL

    %% Styling
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef cdn fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef netlify fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef supabase fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef source fill:#e0f2f1,stroke:#00796b,stroke-width:2px

    class Desktop,Mobile,Tablet client
    class DNS,NetlifyCDN,EdgeNodes cdn
    class SSR,APIFunctions,Background,HTML,StaticJS,CSS,Images,BuildProcess,Deploy netlify
    class PostgreSQL,RLS,Functions,Triggers,SupabaseAuth,Sessions,CardImages,PgBouncer supabase
    class Patreon,Moxfield,Scryfall,Resend external
    class Repo,GitHook source
```

## Build & Deployment Pipeline

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub Repo
    participant Netlify as Netlify Build
    participant CDN as Netlify CDN
    participant Live as Live Site

    Dev->>Git: git push origin main
    Git->>Git: Trigger webhook

    Git->>+Netlify: Webhook: New commit

    Netlify->>Netlify: Clone repository
    Netlify->>Netlify: Install dependencies<br/>bun install

    Netlify->>Netlify: Generate types<br/>bun run db:types

    Netlify->>Netlify: Build application<br/>bun run build<br/>(Next.js with Turbopack)

    alt Build Success
        Netlify->>Netlify: Run tests (optional)<br/>bun run test

        Netlify->>Netlify: Optimize assets<br/>- Minify JS/CSS<br/>- Compress images<br/>- Generate sourcemaps (dev only)

        Netlify->>+CDN: Deploy to CDN
        CDN->>CDN: Distribute to edge nodes<br/>Worldwide

        CDN->>-Live: Activate new version

        Netlify-->>-Git: Update commit status<br/>✓ Deploy success

        Note over Live: New version live<br/>Old version kept for rollback
    else Build Failure
        Netlify->>Netlify: Capture error logs

        Netlify-->>-Git: Update commit status<br/>✗ Build failed

        Note over Live: Previous version<br/>remains active
    end
```

## Environment Configuration

```mermaid
graph TB
    subgraph "Development Environment"
        DevEnv[Local .env.local]
        DevPort[localhost:8888]
        DevDB[Development Supabase]
    end

    subgraph "Production Environment"
        NetlifyEnv[Netlify Environment Variables]
        ProdDomain[defcat.net]
        ProdDB[Production Supabase]
    end

    subgraph "Environment Variables"
        direction TB

        Public[Public Variables<br/>NEXT_PUBLIC_*]
        Private[Private Variables<br/>Server-only]
    end

    Public --> PublicVars["- NEXT_PUBLIC_SUPABASE_URL<br/>- NEXT_PUBLIC_SUPABASE_ANON_KEY<br/>- NEXT_PUBLIC_SITE_URL"]

    Private --> PrivateVars["- SUPABASE_SERVICE_ROLE_KEY<br/>- PATREON_CLIENT_SECRET<br/>- CREATOR_ACCESS_TOKEN<br/>- CREATOR_REFRESH_TOKEN<br/>- RESEND_API_KEY<br/>- POSTGRES_PASSWORD"]

    DevEnv --> Public
    DevEnv --> Private
    NetlifyEnv --> Public
    NetlifyEnv --> Private

    %% Styling
    classDef dev fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef prod fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef vars fill:#e3f2fd,stroke:#1976d2,stroke-width:2px

    class DevEnv,DevPort,DevDB dev
    class NetlifyEnv,ProdDomain,ProdDB prod
    class Public,Private,PublicVars,PrivateVars vars
```

## Scaling Architecture

```mermaid
graph TB
    subgraph "Traffic Distribution"
        Users[Global Users]
        LoadBalancer[Netlify Load Balancer]

        Users --> LoadBalancer
    end

    subgraph "Edge Locations - Auto-Scaling"
        Edge1[North America<br/>Edge Nodes]
        Edge2[Europe<br/>Edge Nodes]
        Edge3[Asia Pacific<br/>Edge Nodes]
        Edge4[South America<br/>Edge Nodes]
    end

    LoadBalancer --> Edge1
    LoadBalancer --> Edge2
    LoadBalancer --> Edge3
    LoadBalancer --> Edge4

    subgraph "Compute Layer - Serverless"
        Functions1[Function Instance 1]
        Functions2[Function Instance 2]
        Functions3[Function Instance N]

        Note1[Auto-scales based on traffic<br/>0-N instances]
    end

    Edge1 --> Functions1
    Edge2 --> Functions2
    Edge3 --> Functions3

    subgraph "Database Layer - Managed"
        Primary[(Primary Database<br/>Auto-scaling)]
        ReadReplica1[(Read Replica 1)]
        ReadReplica2[(Read Replica 2)]

        Pooler[Connection Pool<br/>PgBouncer]
    end

    Functions1 --> Pooler
    Functions2 --> Pooler
    Functions3 --> Pooler

    Pooler --> Primary
    Pooler --> ReadReplica1
    Pooler --> ReadReplica2

    Primary -.replicates to.-> ReadReplica1
    Primary -.replicates to.-> ReadReplica2

    %% Styling
    classDef traffic fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef edge fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef compute fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class Users,LoadBalancer traffic
    class Edge1,Edge2,Edge3,Edge4 edge
    class Functions1,Functions2,Functions3,Note1 compute
    class Primary,ReadReplica1,ReadReplica2,Pooler database
```

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Layer"
        NextApp[Next.js Application]
        APIRoutes[API Routes]
    end

    subgraph "Netlify Monitoring"
        NetlifyAnalytics[Netlify Analytics<br/>Page Views, Performance]
        FunctionLogs[Function Logs<br/>Execution Time, Errors]
        BuildLogs[Build Logs<br/>CI/CD Status]
    end

    subgraph "Supabase Monitoring"
        DBMetrics[Database Metrics<br/>Query Performance]
        AuthMetrics[Auth Metrics<br/>Sessions, Sign-ins]
        StorageMetrics[Storage Metrics<br/>Usage, Bandwidth]
    end

    subgraph "Error Tracking"
        ErrorLogs[Server Error Logs]
        ClientErrors[Client-side Errors]
    end

    subgraph "Performance Metrics"
        WebVitals[Core Web Vitals<br/>LCP, FID, CLS]
        APILatency[API Latency]
        DBQueryTime[Database Query Time]
    end

    NextApp --> NetlifyAnalytics
    NextApp --> WebVitals
    NextApp --> ClientErrors

    APIRoutes --> FunctionLogs
    APIRoutes --> ErrorLogs
    APIRoutes --> APILatency

    APIRoutes --> DBMetrics
    APIRoutes --> AuthMetrics
    APIRoutes --> StorageMetrics
    APIRoutes --> DBQueryTime

    %% Styling
    classDef app fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef netlify fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef supabase fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef monitoring fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class NextApp,APIRoutes app
    class NetlifyAnalytics,FunctionLogs,BuildLogs netlify
    class DBMetrics,AuthMetrics,StorageMetrics supabase
    class ErrorLogs,ClientErrors,WebVitals,APILatency,DBQueryTime monitoring
```

## Backup & Disaster Recovery

```mermaid
graph TB
    subgraph "Primary Systems"
        ProdDB[(Production Database)]
        ProdStorage[Production Storage]
        ProdCode[Production Code<br/>Netlify]
    end

    subgraph "Backup Systems"
        DBBackup[(Automated DB Backups<br/>Point-in-time Recovery)]
        StorageBackup[Storage Backup<br/>Replicated]
        GitHistory[Git History<br/>All Commits]
    end

    subgraph "Recovery Process"
        Restore1[Database Restore<br/>< 5 minutes]
        Restore2[Storage Restore<br/>Automatic]
        Restore3[Code Rollback<br/>Instant]
    end

    ProdDB -.daily backup.-> DBBackup
    ProdDB -.continuous WAL.-> DBBackup
    ProdStorage -.real-time sync.-> StorageBackup
    ProdCode -.git push.-> GitHistory

    DBBackup --> Restore1
    StorageBackup --> Restore2
    GitHistory --> Restore3

    Restore1 --> Recovery[Full System Recovery]
    Restore2 --> Recovery
    Restore3 --> Recovery

    %% Styling
    classDef primary fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef backup fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef restore fill:#e3f2fd,stroke:#1976d2,stroke-width:2px

    class ProdDB,ProdStorage,ProdCode primary
    class DBBackup,StorageBackup,GitHistory backup
    class Restore1,Restore2,Restore3,Recovery restore
```

## Security Architecture

```mermaid
graph TB
    subgraph "Network Security"
        HTTPS[HTTPS Only<br/>TLS 1.3]
        CORS[CORS Policy<br/>Origin Control]
        CSP[Content Security Policy<br/>XSS Prevention]
    end

    subgraph "Authentication Security"
        OAuth[Patreon OAuth 2.0<br/>Secure Token Exchange]
        JWT[Supabase JWT<br/>Session Tokens]
        Cookie[Secure Cookies<br/>HttpOnly, SameSite]
    end

    subgraph "Database Security"
        RLS[Row Level Security<br/>User-based Access]
        ServiceRole[Service Role Key<br/>Admin Operations Only]
        Encryption[Encryption at Rest<br/>Database Encryption]
    end

    subgraph "Application Security"
        InputValidation[Input Validation<br/>All User Input]
        CSRF[CSRF Protection<br/>Token-based]
        RateLimit[Rate Limiting<br/>API Throttling]
    end

    subgraph "Secrets Management"
        NetlifyEnv2[Netlify Environment<br/>Encrypted Secrets]
        SupabaseVault[Supabase Vault<br/>Encrypted Keys]
        NoClientSecrets[No Secrets in<br/>Client Code]
    end

    Users[Users] --> HTTPS
    HTTPS --> CORS
    CORS --> CSP

    CSP --> OAuth
    OAuth --> JWT
    JWT --> Cookie

    Cookie --> RLS
    RLS --> ServiceRole
    ServiceRole --> Encryption

    Users --> InputValidation
    InputValidation --> CSRF
    CSRF --> RateLimit

    RateLimit --> NetlifyEnv2
    NetlifyEnv2 --> SupabaseVault
    SupabaseVault --> NoClientSecrets

    %% Styling
    classDef network fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef auth fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef app fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef secrets fill:#ffebee,stroke:#c62828,stroke-width:2px

    class HTTPS,CORS,CSP network
    class OAuth,JWT,Cookie auth
    class RLS,ServiceRole,Encryption database
    class InputValidation,CSRF,RateLimit app
    class NetlifyEnv2,SupabaseVault,NoClientSecrets secrets
```

## Cost Optimization

| Service | Tier | Monthly Cost | Scaling |
|---------|------|--------------|---------|
| **Netlify** | Pro | ~$19/month | Bandwidth-based |
| **Supabase** | Pro | $25/month | Database size, connections |
| **Patreon API** | Free | $0 | Request-based (no charge) |
| **Moxfield API** | Free | $0 | Public API |
| **Scryfall API** | Free | $0 | Rate-limited |
| **Resend** | Free → Pro | $0-$20/month | Email volume |

**Total: ~$44-64/month** (scales with traffic)

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint** | < 1.5s | ~1.2s |
| **Largest Contentful Paint** | < 2.5s | ~2.1s |
| **Time to Interactive** | < 3.5s | ~2.8s |
| **API Response Time** | < 200ms | ~150ms |
| **Database Query Time** | < 100ms | ~75ms |
| **Uptime** | > 99.9% | 99.95% |

## Deployment Checklist

- [ ] Environment variables configured in Netlify
- [ ] Supabase RLS policies tested
- [ ] Database migrations applied
- [ ] OAuth redirect URIs configured
- [ ] DNS records configured
- [ ] HTTPS certificate active
- [ ] Build process succeeds
- [ ] Tests passing
- [ ] Performance metrics within targets
- [ ] Security headers configured
- [ ] Error tracking enabled
- [ ] Backup verification completed
