# Configuration Guide

Complete configuration reference for DefCat DeckVault.

## Environment Variables

All environment variables should be defined in `.env.local` for local development and in your hosting provider's environment configuration for production.

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Required:** Yes
- **Type:** String (URL)
- **Description:** Your Supabase project URL
- **Example:** `https://abcdefghijk.supabase.co`
- **How to get:** Supabase Dashboard → Project Settings → API → Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Required:** Yes
- **Type:** String (JWT)
- **Description:** Supabase anonymous/public API key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get:** Supabase Dashboard → Project Settings → API → Project API keys → anon public
- **Note:** Safe to expose in client-side code (prefix: `NEXT_PUBLIC_`)

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Required:** Yes
- **Type:** String (JWT)
- **Description:** Supabase service role key (bypasses RLS)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get:** Supabase Dashboard → Project Settings → API → Project API keys → service_role
- **⚠️ Security:** NEVER expose this key to the client. Server-side only.

#### `POSTGRES_PASSWORD`
- **Required:** Yes (for migrations)
- **Type:** String
- **Description:** PostgreSQL database password
- **How to get:** Supabase Dashboard → Project Settings → Database → Password
- **Usage:** Used by migration scripts (`bun run db:up`)

---

### Patreon OAuth Configuration

#### `PATREON_CLIENT_ID`
- **Required:** Yes
- **Type:** String
- **Description:** Patreon OAuth application client ID
- **How to get:**
  1. Go to [Patreon Developers Portal](https://www.patreon.com/portal/registration/register-clients)
  2. Create a new client
  3. Copy the Client ID

#### `PATREON_CLIENT_SECRET`
- **Required:** Yes
- **Type:** String
- **Description:** Patreon OAuth application client secret
- **How to get:** Patreon Developers Portal → Your Client → Client Secret
- **⚠️ Security:** Never commit this to version control

#### `PATREON_REDIRECT_URI`
- **Required:** Yes
- **Type:** String (URL)
- **Description:** OAuth callback URL (must match Patreon app settings exactly)
- **Development:** `http://localhost:8888/auth/patreon-callback`
- **Production:** `https://your-domain.com/auth/patreon-callback`
- **Note:** Must be registered in Patreon app settings

#### `CREATOR_ACCESS_TOKEN`
- **Required:** Yes
- **Type:** String
- **Description:** Patreon creator access token for API calls
- **How to get:** Patreon Developers Portal → Your Client → Creator's Access Token
- **Usage:** Fetching campaign/membership data

#### `CREATOR_REFRESH_TOKEN`
- **Required:** Yes
- **Type:** String
- **Description:** Patreon creator refresh token
- **How to get:** Patreon Developers Portal → Your Client → Creator's Refresh Token
- **Usage:** Refreshing expired access tokens

---

### Site Configuration

#### `NEXT_PUBLIC_SITE_URL`
- **Required:** Yes
- **Type:** String (URL)
- **Description:** Public URL of your application
- **Development:** `http://localhost:8888`
- **Production:** `https://your-domain.com`
- **Usage:** OAuth redirects, email links, absolute URLs

#### `APP_NAME`
- **Required:** No
- **Type:** String
- **Default:** `DefCatDB`
- **Description:** Application name for display and logs

---

### External Services

#### `RESEND_API_KEY`
- **Required:** Yes (for email notifications)
- **Type:** String
- **Description:** Resend API key for sending emails
- **How to get:**
  1. Sign up at [Resend](https://resend.com/)
  2. Create an API key
- **Usage:** Submission confirmations, notifications

---

### Patreon API Configuration

#### `PATREON_API_Version`
- **Required:** No
- **Type:** String
- **Default:** `2`
- **Description:** Patreon API version to use
- **Options:** `1`, `2`
- **Recommendation:** Use `2` (latest)

---

## Configuration Files

### `next.config.ts`

Next.js configuration with Turbopack and image optimization.

```typescript
const nextConfig: NextConfig = {
  // Image configuration for remote patterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'paerhoqoypdezkqhzimk.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Remove in production
  },

  // Source maps (disabled to prevent 404s)
  productionBrowserSourceMaps: false,
}
```

**Key Settings:**
- `images.remotePatterns`: Whitelist for Next.js Image component
- `typescript.ignoreBuildErrors`: Should be `false` in production
- `productionBrowserSourceMaps`: Disabled to reduce bundle size

---

### `tsconfig.json`

TypeScript compiler configuration with path aliases.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/lib/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/app/*": ["./src/app/*"],
      "@/context/*": ["./src/lib/contexts/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/emails/*": ["./src/emails/*"]
    }
  }
}
```

**Path Aliases:**
- `@/*` → `./src/*` (general imports)
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/hooks/*` → `./src/lib/hooks/*`
- `@/types/*` → `./src/types/*`

---

### `biome.json`

Biome linting and formatting configuration.

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

**Key Settings:**
- Recommended rules enabled by default
- 2-space indentation
- 100-character line width

---

### `vitest.config.ts`

Vitest testing configuration.

```typescript
{
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
}
```

**Key Settings:**
- `jsdom` environment for React component testing
- 85% coverage thresholds (aspirational)
- Global test utilities enabled

---

### `tailwind.config.ts`

Tailwind CSS configuration with custom theme.

```typescript
{
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom MTG mana colors
        mana: {
          white: '#F9FAF4',
          blue: '#0E68AB',
          black: '#150B00',
          red: '#D3202A',
          green: '#00733E',
          colorless: '#CAC5C0',
        },
      },
    },
  },
}
```

---

## Database Configuration

### Supabase Connection

The application uses three distinct Supabase clients:

1. **Browser Client** (`src/lib/supabase/client.ts`)
   - Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Respects Row Level Security (RLS)

2. **Server Client** (`src/lib/supabase/server.ts`)
   - Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Respects RLS
   - Handles server-side session management

3. **Admin Client** (`src/lib/supabase/admin.ts`)
   - Uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - **Bypasses RLS** - use with caution

### Migration Configuration

Migrations are managed via Supabase CLI:

```bash
# Create new migration
bun run db:new "migration_name"

# Apply migrations
bun run db:up

# Generate types
bun run db:types
```

**Configuration in `scripts/migrate.sh`:**
- Reads `.env.local` for credentials
- Uses `POSTGRES_PASSWORD` for authentication
- Applies migrations to remote Supabase project

---

## TanStack Query Configuration

Configured in `src/lib/contexts/Providers.tsx`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
  },
})
```

**Key Settings:**
- `staleTime`: How long data is considered fresh (5 min)
- `gcTime`: How long to keep cached data (10 min)
- `retry`: Number of retry attempts on error
- `refetchOnWindowFocus`: Refetch when user returns to tab

**Custom Query Configurations:**

**Auth Session:**
```typescript
queryKey: ['auth-session']
staleTime: 5 * 60 * 1000  // 5 minutes
```

**Deck Data:**
```typescript
queryKey: ['decks']
staleTime: Infinity  // Never refetch (data updates weekly)
```

**Infinite Scroll:**
```typescript
queryKey: ['decks-infinite']
initialPageParam: 0
getNextPageParam: (lastPage) => lastPage.nextPage
```

---

## Patreon Tier Configuration

Tier thresholds are defined in `src/lib/api/patreon.ts`:

```typescript
function determineTier(pledgeAmountCents: number): PatreonTier {
  if (pledgeAmountCents >= 25000) return 'ArchMage'  // $250
  if (pledgeAmountCents >= 16500) return 'Wizard'    // $165
  if (pledgeAmountCents >= 5000)  return 'Duke'      // $50
  if (pledgeAmountCents >= 3000)  return 'Emissary'  // $30
  if (pledgeAmountCents >= 1000)  return 'Knight'    // $10
  return 'Citizen'  // $2 (default)
}
```

**To modify tier thresholds:**
1. Edit `src/lib/api/patreon.ts`
2. Update `determineTier()` function
3. Sync with Patreon campaign tiers
4. Update database `tier_benefits` table

---

## Credit System Configuration

Credits are stored in the database as JSONB and configured per tier:

### Database Tables

**`credit_types`**
```sql
CREATE TABLE credit_types (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);
```

**`tier_benefits`**
```sql
CREATE TABLE tier_benefits (
  tier_id TEXT,
  credit_type_id TEXT,
  amount INTEGER NOT NULL,
  PRIMARY KEY (tier_id, credit_type_id)
);
```

**`user_credits`**
```sql
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY,
  credits JSONB DEFAULT '{}'::jsonb,
  last_granted JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Adding New Credit Types

1. **Insert into `credit_types`:**
   ```sql
   INSERT INTO credit_types (id, display_name, description)
   VALUES ('review', 'Deck Review', 'Professional deck review service');
   ```

2. **Configure benefits per tier:**
   ```sql
   INSERT INTO tier_benefits (tier_id, credit_type_id, amount)
   VALUES
     ('knight', 'review', 1),
     ('duke', 'review', 3),
     ('wizard', 'review', 5);
   ```

3. **No code changes needed** - the system dynamically reads from the database.

---

## Middleware Configuration

Route protection is configured in `proxy.ts`:

```typescript
const PROTECTED_ROUTES = [
  { path: '/admin', minimumRole: 'admin' },
  { path: '/profile', minimumRole: 'user' },
  { path: '/decks/submission', minimumRole: 'user' },
]

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/callback',
  '/about',
  '/decks',
  '/api/health',
  '/api/metrics',
]
```

**To protect new routes:**
1. Edit `proxy.ts`
2. Add to `PROTECTED_ROUTES` array with minimum role
3. Middleware automatically enforces on next deployment

---

## Email Configuration (Resend)

Email templates are in `src/emails/`:

**Deck Submission Confirmation:**
```typescript
// src/emails/deck-sub-confirmation.tsx
export function DeckSubmissionEmail({
  deckName,
  submissionId,
}) {
  return (
    <Html>
      <Body>
        <h1>Deck Submission Received</h1>
        <p>Your deck "{deckName}" has been submitted.</p>
        <p>Submission ID: {submissionId}</p>
      </Body>
    </Html>
  )
}
```

**Sending emails:**
```typescript
import { render } from '@react-email/render'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'DefCat <noreply@defcat.com>',
  to: userEmail,
  subject: 'Submission Received',
  html: render(DeckSubmissionEmail({ ... })),
})
```

---

## Deployment Configuration

### Netlify

**Build settings:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"
```

**Environment Variables in Netlify:**
1. Go to Site Settings → Build & Deploy → Environment
2. Add all variables from `.env.local`
3. Deploy

### Vercel (Alternative)

1. Connect GitHub repository
2. Framework Preset: Next.js
3. Add environment variables in Project Settings
4. Deploy automatically on push to main

---

## Security Configuration

### CORS

CORS is configured in API routes:

```typescript
headers: {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL,
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

### Content Security Policy

Add to `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ]
}
```

---

## Troubleshooting Configuration

### Port Conflicts

**Error:** `Port 8888 already in use`

**Solution:**
```bash
# Change port in package.json
"dev": "next dev --port 3000"

# Or kill process on port
lsof -ti:8888 | xargs kill -9
```

### Environment Variables Not Loading

**Error:** `undefined` values for environment variables

**Solution:**
1. Ensure `.env.local` exists in project root
2. Restart dev server after changing env vars
3. Check for typos in variable names
4. Verify `NEXT_PUBLIC_` prefix for client-side vars

### Supabase Connection Issues

**Error:** `Failed to fetch` or `Invalid API key`

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://xxx.supabase.co`
2. Check API keys match your project
3. Ensure service role key is not exposed to client
4. Test connection with Supabase CLI: `supabase db remote`

### Patreon OAuth Redirect Mismatch

**Error:** `redirect_uri_mismatch`

**Solution:**
1. Ensure `PATREON_REDIRECT_URI` exactly matches Patreon app settings
2. Include port number if using localhost (`:8888`)
3. Use HTTPS in production
4. Check for trailing slashes

---

## Configuration Checklist

Before deploying to production:

- [ ] All environment variables set in hosting provider
- [ ] `NEXT_PUBLIC_SITE_URL` points to production domain
- [ ] `PATREON_REDIRECT_URI` registered with Patreon
- [ ] `typescript.ignoreBuildErrors` set to `false`
- [ ] Hardcoded admin bypasses removed
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] CORS configured for production domain
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Error tracking (Sentry) setup
- [ ] Monitoring and alerts configured

---

**Last Updated:** 2025-10-31
**Version:** 0.1.0
