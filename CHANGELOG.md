# Changelog

All notable changes to DefCat's DeckVault will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation suite (README, CLAUDE.md, deep dive analysis)
- Security audit reports for API and routing configuration
- Type-safe database layer with auto-generated types from Supabase schema

### Changed
- Migrated to Next.js 16 with App Router
- Updated to React 19.1 stable
- Upgraded to Turbopack for faster builds
- Improved authentication system with dual-layer protection

### Fixed
- Fixed infinite loops in useEffect dependency arrays (commit: dbc7e30)
- Replaced wildcard select('*') queries with explicit column lists for better performance (commit: d51ca5b)

### Security
- Security hardening pass completed (commit: 9f0e439)
- API route protection audited and documented
- Row Level Security policies enforced at database layer

## [0.1.0] - 2025-10-31

### Added

#### Core Features
- **Premium Deck Database**
  - Browse curated collection of cEDH decklists
  - Advanced filtering by commander, colors, and archetypes
  - Deck detail pages with card lists, statistics, and mana curves
  - Integration with Moxfield for deck imports

- **Patreon Integration**
  - Custom OAuth flow with automatic tier detection
  - Six-tier system (Citizen, Knight, Emissary, Duke, Wizard, ArchMage)
  - Dynamic credit system for submissions based on tier
  - Automatic tier synchronization on login

- **User Features**
  - User profiles with deck submissions and credits tracking
  - Deck submission system with approval workflow
  - Roast request system for deck critiques
  - Email notifications via Resend integration

- **Admin Dashboard**
  - User management with role assignment
  - Deck import and management tools
  - Submission queue with approve/reject workflow
  - Site configuration editor
  - Product management for Patreon tiers
  - Credit system administration

#### Technical Architecture
- **Three-Tier Supabase Client Pattern**
  - Browser client for client components
  - Server client for RSC and API routes
  - Admin client for privileged operations

- **Authentication System**
  - Route middleware for role-based access control
  - Page-level guards (`requireAuth`, `requireAdmin`, etc.)
  - API-specific authentication guards
  - Role hierarchy: Developer → Admin → Moderator → Member → User

- **State Management**
  - TanStack Query for server state caching
  - React Context for auth and theme state
  - Smart caching strategies (5min for auth, infinite for decks)

- **Database**
  - 13 migrations for schema evolution
  - Dynamic JSONB credit system
  - Row Level Security policies
  - Automated type generation workflow

#### UI/UX
- **Modern Interface**
  - Dark mode with theme persistence
  - Responsive design for all screen sizes
  - Magic: The Gathering mana symbol integration
  - Smooth animations with Framer Motion
  - Accessible components from Radix UI

- **Deck Browsing**
  - Table and grid view modes
  - Sortable columns (views, likes, updated date)
  - Color identity filtering with mana symbols
  - Search by deck name, commander, or description
  - Virtualized lists for performance

- **Card Display**
  - High-quality card images from Scryfall
  - Hover previews with card details
  - Mana curve visualization
  - Color distribution charts
  - Card type breakdown

#### External Integrations
- **Moxfield API**
  - Automatic version detection
  - Deck data synchronization
  - Scheduled updates via Supabase Edge Functions

- **Scryfall API**
  - Card image caching in Supabase Storage
  - Rate-limited requests (75ms delay)
  - Fallback mechanisms for missing data

- **Patreon API**
  - OAuth authentication flow
  - Membership tier detection
  - Automatic tier updates on login

#### Development Tools
- **Modern Stack**
  - TypeScript with strict mode
  - Biome for fast linting and formatting
  - Vitest for unit testing
  - Husky for git hooks
  - Lint-staged for pre-commit checks

- **Scripts**
  - Database migration tools
  - Type generation from schema
  - Deck import utilities
  - Cache cleanup scripts
  - Test user creation

### Changed
- Replaced ESLint/Prettier with Biome for faster tooling
- Migrated from Webpack to Turbopack
- Updated to Tailwind CSS v4
- Switched from Context API to TanStack Query for deck data

### Fixed
- Memory leaks in WebSocket handlers
- Database connection pooling issues
- Image loading performance in deck lists
- Infinite re-render loops in useEffect hooks

### Security
- Implemented three-tier Supabase client pattern
- Added Row Level Security policies
- Secured admin routes with role-based access control
- Sanitized error messages in API responses
- Configured CORS for production deployment

### Performance
- Implemented infinite scroll pagination (50 decks per page)
- Added card image caching to reduce API calls
- Optimized database queries with explicit column selection
- Configured TanStack Query with appropriate stale times
- Virtualized long lists with TanStack Virtual

---

## Development Guidelines

### Commit Message Format

We use conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add Patreon OAuth integration

Implements custom OAuth flow with automatic tier detection
and user profile synchronization.

Closes #42

---

fix(decks): resolve infinite loop in useEffect

Properly memoize dependencies to prevent re-renders

---

docs: add comprehensive README and API documentation

Includes installation guide, development workflow,
and architecture documentation.
```

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

---

## Migration Guides

### From 0.x to 1.0 (When Available)

Will be added when 1.0 is released with any breaking changes documented.

---

## Contributors

- Robert Pratt - Initial development and architecture

---

**Note:** This changelog is maintained automatically. For detailed commit history, see the git log.
