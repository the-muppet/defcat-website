# DefCat's DeckVault

> Premium cEDH decklists with tier-based Patreon access

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Deployed on Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify)](https://www.netlify.com/)

## Overview

DefCat's DeckVault is a Next.js application for browsing and managing premium competitive Commander (cEDH) decklists. Features include:

- 🎴 **Premium Deck Database** - Curated collection of high-quality cEDH decklists
- 🔐 **Patreon Integration** - Tier-based access control with automatic OAuth
- 💳 **Dynamic Credit System** - Flexible submission credits based on tier
- 🎨 **Modern UI** - Responsive design with dark mode and mana color theming
- 🔍 **Advanced Filtering** - Search by commander, colors, and archetypes
- 📊 **Deck Analytics** - View statistics, mana curves, and card distributions

## Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19.1** - UI library
- **TypeScript** - Type-safe development
- **Turbopack** - Fast bundler for dev and production

### Backend & Database
- **Supabase** - PostgreSQL database with Row Level Security
- **Supabase Auth** - Authentication with custom Patreon OAuth
- **Supabase Storage** - Card image caching

### State Management & Data
- **TanStack Query (React Query)** - Server state management
- **TanStack Virtual** - Virtualized list rendering
- **React Context** - Auth and theme state

### UI & Styling
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations
- **Mana Font** - Magic: The Gathering mana symbols

### External APIs
- **Patreon API** - OAuth and membership data
- **Moxfield API** - Deck data import
- **Scryfall API** - Card images and metadata

### Development Tools
- **Biome** - Fast linting and formatting
- **Vitest** - Unit testing framework
- **Husky** - Git hooks
- **Bun** - Package manager and runtime

## Getting Started

### Prerequisites

- **Node.js** 20+ or **Bun** 1.0+
- **Supabase** account and project
- **Patreon** developer application (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd defcat-website
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` with the following:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   POSTGRES_PASSWORD=your_postgres_password

   # Patreon OAuth
   PATREON_CLIENT_ID=your_patreon_client_id
   PATREON_CLIENT_SECRET=your_patreon_client_secret
   PATREON_REDIRECT_URI=http://localhost:8888/auth/patreon-callback
   CREATOR_ACCESS_TOKEN=your_patreon_creator_token
   CREATOR_REFRESH_TOKEN=your_patreon_refresh_token

   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:8888

   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Initialize the database**
   ```bash
   # Apply all migrations
   bun run db:up

   # Generate TypeScript types from schema
   bun run db:types
   ```

5. **Seed initial data (optional)**
   ```bash
   # Seed site configuration
   bun run seed:config

   # Create a test user
   bun run create-test-user

   # Import decks from Moxfield
   bun run fetch:decks
   ```

6. **Start the development server**
   ```bash
   bun run dev
   ```

   Open [http://localhost:8888](http://localhost:8888) in your browser.

## Development

### Available Scripts

#### Development
```bash
bun run dev              # Start dev server on port 8888 with Turbopack
bun run build            # Build for production
bun run start            # Start production server
```

#### Code Quality
```bash
bun run lint             # Check code with Biome
bun run format           # Format code with Biome
```

#### Testing
```bash
bun run test             # Run unit tests
bun run test:ui          # Run tests with UI
bun run test:coverage    # Generate coverage report
```

#### Database
```bash
bun run db:new "description"    # Create new migration
bun run db:up                   # Apply pending migrations
bun run db:types                # Regenerate TypeScript types
```

#### Data Management
```bash
bun run fetch:decks             # Import/update decks from Moxfield
bun run fetch:images            # Backfill card images from Scryfall
bun run cleanup:phantom-cache   # Clean up orphaned cache entries
```

### Project Structure

```
defcat-website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard routes
│   │   ├── api/               # API route handlers
│   │   ├── auth/              # Authentication pages
│   │   ├── decks/             # Deck browsing & detail pages
│   │   └── profile/           # User profile pages
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── layout/           # Layout components
│   │   ├── decks/            # Deck-specific components
│   │   ├── admin/            # Admin panel components
│   │   └── forms/            # Form components
│   ├── lib/                   # Core utilities & logic
│   │   ├── api/              # External API clients
│   │   ├── auth/             # Authentication guards & utilities
│   │   ├── supabase/         # Supabase client configurations
│   │   ├── contexts/         # React contexts (Auth, Theme)
│   │   ├── hooks/            # Custom React hooks
│   │   └── data/             # Data fetching utilities
│   ├── types/                 # TypeScript type definitions
│   │   └── supabase/         # Auto-generated Supabase types
│   └── styles/               # Global styles
├── supabase/
│   └── migrations/           # Database migration files
├── scripts/                   # Utility scripts
├── public/                    # Static assets
└── docs/                      # Documentation

```

### Key Architecture Patterns

#### Three-Tier Supabase Client Pattern

The application uses three distinct Supabase clients for security:

1. **Browser Client** (`src/lib/supabase/client.ts`)
   - For client components
   - Respects Row Level Security (RLS)
   - Uses user session cookies

2. **Server Client** (`src/lib/supabase/server.ts`)
   - For server components and API routes
   - Respects RLS
   - Server-side session handling

3. **Admin Client** (`src/lib/supabase/admin.ts`)
   - For privileged operations only
   - **Bypasses RLS** - use with caution
   - Uses service role key

#### Authentication System

**Dual-layer protection:**

1. **Route Middleware** (`proxy.ts`)
   - First line of defense
   - Role-based route access control
   - Automatic redirects to login

2. **Page/API Guards** (`src/lib/auth/`)
   - Server-side: `requireAuth()`, `requireAdmin()`, etc.
   - API-specific guards with proper HTTP responses
   - Used in 25+ locations

**Role Hierarchy:**
```
Developer (4) → Admin (3) → Moderator (2) → Member (1) → User (0)
```

#### Dynamic Credit System

Credits are stored as flexible JSONB:
```json
{
  "roast": 5,
  "deck": 3,
  "review": 2
}
```

Benefits defined by tier in database - no schema changes needed for new credit types.

### Database Workflow

1. **Create migration:**
   ```bash
   bun run db:new "add_new_feature_table"
   ```

2. **Edit the generated SQL file** in `supabase/migrations/`

3. **Apply migration:**
   ```bash
   bun run db:up
   ```

4. **Regenerate types:**
   ```bash
   bun run db:types
   ```

## API Integration

### Moxfield

Automatic version detection from Moxfield homepage:
- Caches version for 24 hours
- Fallback to hardcoded version if detection fails
- Used for deck imports and updates

### Scryfall

Card data and images with rate limiting:
- 75ms delay between requests (respects API guidelines)
- In-memory caching during runtime
- Images stored in Supabase Storage for CDN delivery

### Patreon

OAuth flow for authentication:
1. User clicks "Login with Patreon"
2. Patreon OAuth authorization
3. Exchange code for access token
4. Fetch membership data (tier, patreonId)
5. Create/update user in Supabase
6. Automatic tier assignment based on pledge amount

**Tier Thresholds:**
- ArchMage: $250+
- Wizard: $165+
- Duke: $50+
- Emissary: $30+
- Knight: $10+
- Citizen: $2+ (default)

## Deployment

### Netlify (Current)

The application is configured for Netlify deployment:

1. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment variables:**
   - Set all variables from `.env.local` in Netlify dashboard
   - Ensure `NEXT_PUBLIC_SITE_URL` matches your production URL

3. **Deploy:**
   ```bash
   git push origin master
   # Netlify automatically deploys on push
   ```

### Environment Configuration

**Development:**
- `NEXT_PUBLIC_SITE_URL=http://localhost:8888`
- `PATREON_REDIRECT_URI=http://localhost:8888/auth/patreon-callback`

**Production:**
- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- `PATREON_REDIRECT_URI=https://your-domain.com/auth/patreon-callback`

## Contributing

### Code Style

The project uses Biome for linting and formatting:
- Configured in `biome.json`
- Run `bun run lint` before committing
- Pre-commit hooks automatically format code

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit with descriptive messages
3. Push to your branch: `git push origin feature/your-feature`
4. Create a pull request

### Testing

Before submitting PRs:
```bash
bun run lint           # Ensure code style
bun run test           # Run test suite
bun run build          # Ensure builds successfully
```

## Security

### Authentication

- Patreon OAuth with automatic session management
- Row Level Security (RLS) enforced at database layer
- Role-based access control (RBAC) for admin features
- Secure cookie handling for sessions

### API Security

- API routes protected with auth guards
- Input validation on all user inputs
- Rate limiting on submission endpoints (recommended)
- CORS properly configured for production

### Best Practices

- Never commit `.env.local` (included in `.gitignore`)
- Use environment variables for all secrets
- Admin client usage is audited and minimal
- Hardcoded bypasses removed before production

## Troubleshooting

### Common Issues

**Port 8888 already in use:**
```bash
# Kill process on port 8888
lsof -ti:8888 | xargs kill -9
# Or use a different port
bun run dev -- --port 3000
```

**TypeScript errors:**
```bash
# Regenerate types from database
bun run db:types

# Clear Next.js cache
rm -rf .next
bun run build
```

**Supabase connection issues:**
```bash
# Verify environment variables
cat .env.local | grep SUPABASE

# Test connection with Supabase CLI
supabase db remote
```

**Patreon OAuth not working:**
- Verify redirect URI matches exactly (including port)
- Check Patreon app settings for correct domain
- Ensure `PATREON_REDIRECT_URI` environment variable is set

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Development guide for AI assistants
- **[DEEP_DIVE_ANALYSIS.md](./DEEP_DIVE_ANALYSIS.md)** - Comprehensive technical analysis
- **[API_SECURITY_AUDIT.md](./API_SECURITY_AUDIT.md)** - Security audit findings
- **[ROUTING_AUDIT_REPORT.md](./ROUTING_AUDIT_REPORT.md)** - Routing configuration review

## License

[Your License Here]

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: [Your Contact Information]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Deck data from [Moxfield](https://www.moxfield.com/)
- Card data from [Scryfall](https://scryfall.com/)
- Icons and components from [shadcn/ui](https://ui.shadcn.com/)
