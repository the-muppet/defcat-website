# DefCat DeckVault - Architecture Diagrams

This directory contains comprehensive architectural documentation and diagrams for the DefCat DeckVault application.

## Quick Links

1. [Database Schema](#database-schema) - Entity Relationship Diagram
2. [System Architecture](#system-architecture) - Overall system design
3. [Authentication Flow](#authentication-flow) - Auth & authorization patterns
4. [Patreon OAuth](#patreon-oauth) - OAuth integration
5. [API Routes & Middleware](#api-routes--middleware) - API structure
6. [Component Hierarchy](#component-hierarchy) - React component structure
7. [Data Flow](#data-flow) - State management & data fetching
8. [Deployment](#deployment) - Production deployment architecture

---

## Database Schema

**File:** [database-schema.md](./database-schema.md)

Complete database Entity Relationship Diagram showing:
- All tables and their relationships
- Key fields and data types
- Enums (patreon_tier, submission_type, user_role)
- Row Level Security policies
- Database functions and triggers
- Views for common queries

**Key Tables:**
- `profiles` - User profiles with Patreon integration
- `moxfield_decks` - Imported deck data from Moxfield
- `cards` - MTG card cache from Scryfall
- `deck_submissions` - User deck submission requests
- `user_credits` - Monthly submission credits by tier
- `products` - Affiliate products and merchandise
- `site_config` - Application configuration

---

## System Architecture

**File:** [system-architecture.md](./system-architecture.md)

High-level system architecture showing:
- Frontend (Next.js 16 with App Router, React 19)
- Middleware layer (session management, route protection)
- API routes structure
- Three-tier Supabase client architecture
- Backend services (Supabase)
- External integrations (Patreon, Moxfield, Scryfall, Resend)
- Background jobs and scripts

**Key Components:**
- Browser/Server/Admin Supabase clients
- TanStack Query for state management
- Row Level Security for data access control
- Serverless API routes
- Background processing for deck imports

---

## Authentication Flow

**File:** [authentication-flow.md](./authentication-flow.md)

Authentication and authorization architecture including:
- Three-tier Supabase client architecture
- Server Component auth guard flow
- API Route auth guard flow
- Role-based access control hierarchy
- Middleware session refresh flow

**Role Hierarchy:**
- Developer (4) - Highest level
- Admin (3)
- Moderator (2)
- Member (1)
- User (0) - Base level

**Auth Patterns:**
- Server Components: `requireAuth()`, `requireAdmin()`, etc.
- API Routes: `requireAuthApi()`, `requireAdminApi()`, etc.
- Middleware: Session refresh and route protection

---

## Patreon OAuth

**File:** [patreon-oauth-flow.md](./patreon-oauth-flow.md)

Complete Patreon OAuth integration showing:
- OAuth flow sequence (initiate → callback → session setup)
- Tier determination logic based on pledge amount
- Profile update and synchronization
- Error handling and edge cases

**Patreon Tiers:**
- ArchMage: $250+/month (3 submissions)
- Wizard: $165+/month (2 submissions)
- Duke: $50+/month (1 submission)
- Emissary: $30+/month
- Knight: $10+/month
- Citizen: $2+/month (default)

**OAuth Scopes:**
- `identity` - Basic user info
- `identity[email]` - Email address
- `identity.memberships` - Membership & pledge data

---

## API Routes & Middleware

**File:** [api-routes-middleware.md](./api-routes-middleware.md)

Complete API structure and middleware flow:
- API routes organization (public, auth, admin, developer)
- Middleware request flow
- Auth guard patterns
- Route-to-guard mapping
- Error response standards

**Route Categories:**
- Public: `/api/health`, `/api/metrics`, `/api/card-image`
- Member: `/api/submit-deck`, `/api/submit-roast`
- Admin: `/api/admin/decks/*`, `/api/admin/users/*`, etc.
- Developer: `/api/admin/developer/spoof-tier`, etc.

**Error Codes:**
- `AUTH_REQUIRED` (401) - Not authenticated
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `BAD_REQUEST` (400) - Invalid input
- `SERVER_ERROR` (500) - Internal error

---

## Component Hierarchy

**File:** [component-hierarchy.md](./component-hierarchy.md)

React component structure and organization:
- App-level component structure
- Page-specific component trees
- Shared/reusable components
- Server vs Client component breakdown
- Component file organization

**Key Component Categories:**
- UI Components (shadcn/ui)
- Custom Shared Components
- Form Components
- Analytics Components
- Auth Components
- Layout Components

**Organization Pattern:**
```
components/
├── ui/          # Base UI components
├── layout/      # Layout components
├── auth/        # Authentication UI
├── decks/       # Deck components
├── profile/     # Profile components
├── admin/       # Admin panel
├── forms/       # Forms
└── analytics/   # Charts & stats
```

---

## Data Flow

**File:** [data-flow.md](./data-flow.md)

Data fetching and state management:
- Overall data flow architecture
- TanStack Query (React Query) patterns
- Server Component direct fetching
- Mutation flow with optimistic updates
- Query invalidation and refetching
- Common data flow patterns

**State Management Layers:**
1. Global State - React Context (auth, theme)
2. Server State - TanStack Query (cached data)
3. Local State - useState (UI state, forms)

**Data Flow Patterns:**
- Server Component + Direct Fetch (initial loads)
- Client Component + TanStack Query (interactive)
- Hybrid - Server initial + Client updates (best of both)

**Query Key Patterns:**
```typescript
['decks']                    // All decks
['decks', {filter}]          // Filtered decks
['decks', deckId]            // Single deck
['submissions', userId]      // User submissions
['profile']                  // Current user
```

---

## Deployment

**File:** [deployment-architecture.md](./deployment-architecture.md)

Production deployment on Netlify + Supabase:
- Production deployment architecture
- Build & deployment pipeline
- Environment configuration
- Scaling architecture
- Monitoring & observability
- Backup & disaster recovery
- Security architecture

**Tech Stack:**
- **Hosting:** Netlify (CDN + Serverless)
- **Database:** Supabase (PostgreSQL)
- **Runtime:** Bun
- **Framework:** Next.js 16 with Turbopack

**Performance Targets:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- API Response Time: < 200ms
- Uptime: > 99.9%

**Monthly Cost:** ~$44-64/month
- Netlify Pro: ~$19
- Supabase Pro: $25
- Resend: $0-$20

---

## Diagram Viewing

All diagrams use **Mermaid** syntax and can be viewed in:

1. **GitHub** - Natively renders Mermaid diagrams
2. **VS Code** - Install "Markdown Preview Mermaid Support" extension
3. **Mermaid Live Editor** - Copy/paste code at https://mermaid.live
4. **Documentation Sites** - Most modern doc platforms support Mermaid

---

## Technology Stack Summary

### Frontend
- **Framework:** Next.js 16 (App Router)
- **React:** 19.1.0 (stable)
- **Build Tool:** Turbopack
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** TanStack Query (React Query)
- **Package Manager:** Bun

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + Patreon OAuth
- **Storage:** Supabase Storage
- **Hosting:** Netlify
- **Runtime:** Node.js (via Bun)

### External APIs
- **Patreon:** OAuth & tier verification
- **Moxfield:** Deck data import
- **Scryfall:** Card data & images
- **Resend:** Transactional emails

### Development
- **Language:** TypeScript
- **Linting:** Biome
- **Testing:** Vitest + React Testing Library
- **Type Generation:** Supabase CLI
- **Git Hooks:** Husky + lint-staged

---

## Contributing to Diagrams

When updating diagrams:

1. Use Mermaid syntax for all diagrams
2. Follow existing naming conventions
3. Keep diagrams focused and readable
4. Update this README if adding new diagrams
5. Test rendering in GitHub before committing
6. Include diagram titles and descriptions

## Diagram Style Guide

**Colors:**
- Client/Browser: Purple (`#f3e5f5`)
- Server/Backend: Green (`#e8f5e9`)
- API/Network: Blue (`#e3f2fd`)
- Database: Orange (`#fff3e0`)
- Auth/Security: Pink (`#fce4ec`)
- External: Red/Pink (`#ffebee`)

**Graph Types:**
- Use `graph TB` (top-bottom) for hierarchies
- Use `sequenceDiagram` for flows over time
- Use `flowchart TD` for decision trees
- Use `erDiagram` for database schemas
- Use `classDiagram` for type definitions

---

## Quick Reference

| Concept | Diagram | Key Files |
|---------|---------|-----------|
| Database tables | database-schema.md | `supabase/migrations/*.sql` |
| Auth guards | authentication-flow.md | `src/lib/auth/*.ts` |
| Patreon login | patreon-oauth-flow.md | `src/app/auth/patreon*/route.ts` |
| API routes | api-routes-middleware.md | `src/app/api/**/*.ts` |
| Components | component-hierarchy.md | `src/components/**/*.tsx` |
| Data fetching | data-flow.md | `src/lib/data/*.ts` |
| Production | deployment-architecture.md | `netlify.toml`, CI/CD |

---

## Additional Resources

- [CLAUDE.md](../../CLAUDE.md) - Project overview and development guide
- [API Documentation](../API.md) - API endpoint documentation
- [Configuration Guide](../CONFIGURATION.md) - Environment setup
- [Changelog](../../CHANGELOG.md) - Version history

---

**Last Updated:** 2025-10-31

**Maintained By:** DefCat Development Team
