# DefCat DeckVault - Complete Navigation Map

**Generated:** 2025-10-20
**Purpose:** Comprehensive map of all routes, API endpoints, navigation links, redirects, and user interaction flows

---

## Table of Contents
1. [Public Pages](#public-pages)
2. [Auth Flow](#auth-flow)
3. [Protected Pages](#protected-pages)
4. [Admin Pages](#admin-pages)
5. [API Endpoints](#api-endpoints)
6. [Navigation Components](#navigation-components)
7. [Redirects & Flow Patterns](#redirects--flow-patterns)

---

## Public Pages

### Home Page
**Route:** `/`
**File:** `src/app/page.tsx`
**Type:** Public
**Features:**
- Search bar (client-side filtering)
- Color identity filter (client-side)
- Stats overview (React Query cached - 5min stale)
  - Total Decks
  - Unique Commanders
  - Most Popular Commander (rotating stat)
  - Most Common Card (rotating stat)
  - Average Mana Curve
  - Top Color Identities
- Featured Deck display
- Light rays animation effect

**Navigation Out:**
- Search redirects to `/decks` with query params (planned)
- Featured deck links to `/decks/[id]`
- Header navigation

---

### Decks Browser
**Route:** `/decks`
**File:** `src/app/decks/page.tsx`
**Type:** Public
**Features:**
- Browse all decks
- Filter by color identity, commander, tier
- Search functionality
- Pagination

**Navigation Out:**
- Individual deck cards → `/decks/[id]`
- Submit deck CTA → `/decks/submission`

---

### Deck Detail
**Route:** `/decks/[id]`
**File:** `src/app/decks/[id]/page.tsx`
**Type:** Public
**Parameters:**
- `id` (string) - Deck UUID

**Features:**
- Full deck display
- Commander info
- Card list
- Mana curve chart
- Color distribution
- View counter increment
- External link to Moxfield

**Navigation Out:**
- Moxfield URL → External (`deck.moxfield_url`)
- Back to decks → `/decks`

---

### Deck Submission
**Route:** `/decks/submission`
**File:** `src/app/decks/submission/page.tsx`
**Type:** Protected (Duke+ tier required)
**Form Fields:**
- Patreon Username
- Email
- Discord Username
- Mystery Deck (yes/no)
- Commander (optional if mystery)
- Color Preference
- Theme (optional)
- Bracket (1-4)
- Budget
- Coffee Preference
- Ideal Date (optional)

**Submission Flow:**
1. Form validation (client-side)
2. POST to `/api/submit-deck`
3. On success → Redirect to confirmation page
4. Email sent to user + admin

**Navigation Out:**
- Success → Confirmation modal/page
- Cancel → `/decks`

---

### Tiers Page
**Route:** `/tiers`
**File:** `src/app/tiers/page.tsx`
**Type:** Public
**Features:**
- Display Patreon tier benefits
- Pricing information
- CTA to Patreon

**Navigation Out:**
- Patreon CTA → External (Patreon URL)
- Login → `/auth/login`

---

### About Page
**Route:** `/about`
**File:** `src/app/about/page.tsx`
**Type:** Public
**Features:**
- Project information
- Team/creator info
- Links to social media

**Navigation Out:**
- Social media links → External

---

### Profile Page
**Route:** `/profile`
**File:** `src/app/profile/page.tsx`
**Type:** Protected
**Features:**
- User profile settings
- Tier display
- Account management

---

### Commander College
**Route:** `/commander-college`
**File:** `src/app/commander-college/page.tsx`
**Type:** Public
**Features:**
- Educational content
- Strategy guides

---

### Discount Store
**Route:** `/discount-store`
**File:** `src/app/discount-store/page.tsx`
**Type:** Public
**Features:**
- Affiliated product links
- Discount codes

---

### Preview Page
**Route:** `/preview`
**File:** `src/app/preview/page.tsx`
**Type:** Development/Testing
**Purpose:** Component preview and testing

---

### Example Home
**Route:** `/example-home`
**File:** `src/app/example-home/page.tsx`
**Type:** Development
**Purpose:** Alternative home page design

---

## Auth Flow

### 1. Login Page
**Route:** `/auth/login`
**File:** `src/app/auth/login/page.tsx`
**Type:** Public

**Features:**
- "Login with Patreon" button
- Redirects to Patreon OAuth

**Flow:**
```
User clicks "Login with Patreon"
  ↓
POST /auth/patreon
  ↓
Redirect to Patreon OAuth (303)
```

---

### 2. Patreon OAuth Initiation
**Route:** POST `/auth/patreon`
**File:** `src/app/auth/patreon/route.ts`
**Type:** Route Handler

**Parameters:**
- None (server-side env vars)

**Flow:**
```
Build OAuth URL with:
  - client_id
  - redirect_uri
  - scopes: identity, identity[email], identity.memberships
  ↓
Redirect to Patreon (303)
```

**Error Redirects:**
- Missing config → `/auth/login?error=config_missing`

---

### 3. Patreon OAuth Callback
**Route:** GET `/auth/patreon-callback`
**File:** `src/app/auth/patreon-callback/route.ts`
**Type:** Route Handler

**Query Parameters:**
- `code` (string) - OAuth authorization code from Patreon

**Flow:**
```
Receive code from Patreon
  ↓
Exchange code for access token
  ↓
Fetch user data from Patreon API:
  - Email
  - Full name
  - Patreon ID
  - Membership tier
  ↓
Create/update user in Supabase Auth
  ↓
Create/update profile in profiles table:
  - patreon_id
  - patreon_tier
  - role (default: 'user')
  ↓
Generate random password for user
  ↓
Sign in with email/password
  ↓
Create session tokens
  ↓
Redirect to /auth/callback-success with tokens in URL hash
```

**Error Redirects:**
- No code → `/auth/login?error=no_code`
- No email → `/auth/login?error=no_email`
- User lookup failed → `/auth/login?error=user_lookup_failed`
- User creation failed → `/auth/login?error=user_creation_failed`
- Password setup failed → `/auth/login?error=password_setup_failed`
- Sign-in failed → `/auth/login?error=signin_failed`
- Generic error → `/auth/login?error=callback_failed`

---

### 4. Callback Success Page
**Route:** `/auth/callback-success`
**File:** `src/app/auth/callback-success/page.tsx`
**Type:** Client Component

**URL Hash Parameters:**
- `access_token` (string)
- `refresh_token` (string)

**Flow:**
```
Read tokens from URL hash
  ↓
Store tokens in Supabase client
  ↓
Set up session
  ↓
useRouter to redirect to /decks
```

**Purpose:** Client-side session establishment from server-generated tokens

---

### 5. Auth Callback (Legacy/Alternative)
**Route:** GET `/auth/callback`
**File:** `src/app/auth/callback/route.ts`
**Type:** Route Handler
**Note:** May be legacy/unused - verify if active

---

### 6. Verify Page
**Route:** `/auth/verify`
**File:** `src/app/auth/verify/page.tsx`
**Type:** Protected
**Purpose:** Email verification or auth status check

---

### 7. Logout
**Route:** POST/GET `/auth/logout`
**File:** `src/app/auth/logout/route.ts`
**Type:** Route Handler

**Flow:**
```
Call supabase.auth.signOut()
  ↓
Clear session
  ↓
Redirect to /?logged_out=true (303)
```

**Error Response:**
- Logout error → 500 JSON response

---

### 8. Moxfield API Proxy
**Route:** `/auth/api/moxfield`
**File:** `src/app/auth/api/moxfield/route.ts`
**Type:** Route Handler
**Purpose:** Proxy requests to Moxfield API (auth context)

---

## Protected Pages

Pages requiring authentication:

### Deck Submission
**Route:** `/decks/submission`
**Requirements:**
- Authenticated user
- Duke tier or higher ($50+/month)
- Monthly submission limit enforced:
  - Duke/Wizard: 1 per month
  - ArchMage: 2 per month

### Profile
**Route:** `/profile`
**Requirements:**
- Authenticated user

---

## Admin Pages

All admin pages require `role = 'admin'` or special email check

### Admin Dashboard
**Route:** `/admin`
**File:** `src/app/admin/page.tsx`
**Type:** Admin Only

**Features:**
- Overview stats
- Quick actions
- Links to admin sections

**Navigation Out:**
- `/admin/users`
- `/admin/decks`
- `/admin/tiers`
- `/admin/settings`
- `/admin/database`

---

### User Management
**Route:** `/admin/users`
**File:** `src/app/admin/users/page.tsx`
**Type:** Admin Only

**Features:**
- List all users
- Edit user roles
- View Patreon tiers
- Manage permissions

---

### Deck Management
**Route:** `/admin/decks`
**File:** `src/app/admin/decks/page.tsx`
**Type:** Admin Only

**Features:**
- List all decks
- Edit deck metadata
- Delete decks
- View deck analytics

**Navigation Out:**
- Edit deck → `/admin/decks/[id]`
- Import deck → `/admin/decks/import`

---

### Edit Deck
**Route:** `/admin/decks/[id]`
**File:** `src/app/admin/decks/[id]/page.tsx`
**Type:** Admin Only

**Parameters:**
- `id` (string) - Deck UUID

**Features:**
- Edit deck form
- Update commanders
- Update description
- Update tier requirements

**API Calls:**
- PATCH `/api/admin/decks/[id]`
- DELETE `/api/admin/decks/[id]`

**Navigation Out:**
- Save → Back to `/admin/decks`
- Cancel → Back to `/admin/decks`

---

### Import Deck
**Route:** `/admin/decks/import`
**File:** `src/app/admin/decks/import/page.tsx`
**Type:** Admin Only

**Features:**
- Import from Moxfield by ID
- Set tier requirement
- Preview before import

**API Calls:**
- POST `/api/admin/decks/import`

**Navigation Out:**
- Success → `/admin/decks`
- Cancel → `/admin/decks`

---

### Tier Management
**Route:** `/admin/tiers`
**File:** `src/app/admin/tiers/page.tsx`
**Type:** Admin Only

**Features:**
- Configure tier benefits
- Set pricing
- Manage tier limits

---

### Admin Settings
**Route:** `/admin/settings`
**File:** `src/app/admin/settings/page.tsx`
**Type:** Admin Only

**Features:**
- Site configuration
- Feature flags
- Email templates

---

### Database Admin
**Route:** `/admin/database`
**File:** `src/app/admin/database/page.tsx`
**Type:** Admin Only

**Features:**
- Database stats
- Run migrations
- Backup management

---

### Admin Test Pages
**Route:** `/admin/test/fetch`
**File:** `src/app/admin/test/fetch/page.tsx`
**Type:** Admin Only
**Purpose:** Testing data fetching patterns

---

## API Endpoints

### Deck Submission API
**Endpoint:** POST `/api/submit-deck`
**File:** `src/app/api/submit-deck/route.ts`
**Auth:** Required (Bearer token in Authorization header)
**Rate Limit:** Monthly limit based on tier

**Request Headers:**
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

**Request Body:**
```typescript
{
  patreonUsername: string
  email: string (validated)
  discordUsername: string
  mysteryDeck: 'yes' | 'no'
  commander?: string (optional if mysteryDeck = 'yes')
  colorPreference: string
  theme?: string
  bracket: '1' | '2' | '3' | '4'
  budget: string
  coffee: string
  idealDate?: string
}
```

**Success Response (201):**
```typescript
{
  success: true
  data: {
    id: string (UUID)
    submissionNumber: number
  }
}
```

**Error Responses:**

401 - Unauthorized:
```typescript
{
  success: false
  error: {
    message: string
    code: 'UNAUTHORIZED'
  }
}
```

403 - Insufficient Tier:
```typescript
{
  success: false
  error: {
    message: string
    code: 'INSUFFICIENT_TIER'
  }
}
```

429 - Monthly Limit Reached:
```typescript
{
  success: false
  error: {
    message: string
    code: 'MONTHLY_LIMIT_REACHED'
  }
}
```

400 - Validation Error:
```typescript
{
  success: false
  error: {
    message: string
    code: 'VALIDATION_ERROR'
  }
}
```

500 - Internal Error:
```typescript
{
  success: false
  error: {
    message: string
    code: 'DATABASE_ERROR' | 'INTERNAL_ERROR'
  }
}
```

**Side Effects:**
1. Creates `deck_submissions` record
2. Sends confirmation email to user
3. Sends notification email to admin
4. Increments monthly submission count

**CORS:**
- OPTIONS method supported
- Access-Control-Allow-Origin: *

---

### Admin Deck Update
**Endpoint:** PATCH `/api/admin/decks/[id]`
**File:** `src/app/api/admin/decks/[id]/route.ts`
**Auth:** Admin only (via `requireAdmin()`)

**URL Parameters:**
- `id` (string) - Deck UUID

**Request Body:**
```typescript
{
  name: string (required)
  description?: string
  commanders: string[] (required, min 1)
}
```

**Success Response (200):**
```typescript
{
  success: true
  data: Deck
}
```

**Error Responses:**

400 - Validation Error:
```typescript
{
  error: string
}
```

500 - Database Error:
```typescript
{
  error: 'Failed to update deck'
}
```

**Note:** `color_identity` is derived, not editable

---

### Admin Deck Delete
**Endpoint:** DELETE `/api/admin/decks/[id]`
**File:** `src/app/api/admin/decks/[id]/route.ts`
**Auth:** Admin only (via `requireAdmin()`)

**URL Parameters:**
- `id` (string) - Deck UUID

**Success Response (200):**
```typescript
{
  success: true
}
```

**Error Responses:**

500 - Database Error:
```typescript
{
  error: 'Failed to delete deck cards' | 'Failed to delete deck'
}
```

**Side Effects:**
1. Deletes all `deck_cards` records (foreign key)
2. Deletes `decks` record

---

### Admin Deck Import
**Endpoint:** POST `/api/admin/decks/import`
**File:** `src/app/api/admin/decks/import/route.ts`
**Auth:** Admin only (uses admin client)

**Request Body:**
```typescript
{
  moxfieldId: string (required)
  tier?: string (default: 'Citizen')
}
```

**Flow:**
1. Fetch deck from Moxfield API: `https://api2.moxfield.com/v3/decks/all/{moxfieldId}`
2. Parse deck data
3. Upsert to `decks` table
4. Import mainboard cards to `deck_cards` table

**Success Response (200):**
```typescript
{
  success: true
  data: {
    deck: Deck
  }
}
```

**Error Responses:**

400 - Missing Moxfield ID:
```typescript
{
  success: false
  error: 'Moxfield ID is required'
}
```

404 - Deck Not Found:
```typescript
{
  success: false
  error: 'Failed to fetch deck from Moxfield'
}
```

500 - Database/Import Error:
```typescript
{
  success: false
  error: 'Failed to save deck to database' | 'An unexpected error occurred'
}
```

---

## Navigation Components

### Header
**File:** `src/components/layout/Header.tsx`
**Type:** Global, Client Component

**Links:**
- Logo → `/` (home)
- `/decks` - Decks browser
- `/tiers` - Tier info
- `/about` - About page
- `/decks/submission` - Submit deck

**User Menu (when logged in):**
- Browse Decks → `/decks`
- Admin Dashboard → `/admin` (admin only)
- Profile Settings → `/profile`
- Logout → Calls `supabase.auth.signOut()` → Redirects to `/`

**Auth Button (when logged out):**
- Login → `/auth/login`

**Features:**
- Theme toggle (dark/light mode with mana animation)
- Auth state listener (real-time)
- Loading modal on login/logout

---

### Navigation Menu
**File:** `src/components/layout/Navigation.tsx`
**Type:** Reusable Component

**Links:**
- Home → `/`
- Decks → `/decks`
- Tiers → `/tiers`
- About → `/about`
- Submit Deck → `/decks/submission`

---

### Navigation Header (Alternative)
**File:** `src/components/layout/NavigationHeader.tsx`
**Type:** Alternative header design

**Links:**
- Tutorial button (opens modal)
- Deck Vault → `/decks`
- Defcat's Discount Store → `/discount-store`
- Commander College → `/commander-college`
- Login → `/auth/login`

**Features:**
- Active route highlighting
- Tutorial modal
- Theme toggle

---

### Footer
**File:** `src/components/layout/Footer.tsx`
**Type:** Global, Static

**Product Links:**
- Browse Decks → `/decks`
- Membership Tiers → `/tiers`
- Submit Deck → `/decks/submission`

**Company Links:**
- About → `/about`

**Connect Links:**
- Patreon → External (https://patreon.com)
- Discord → External (https://discord.gg)

---

### User Menu
**File:** `src/components/user/UserMenu.tsx`
**Type:** Dropdown Menu (Client Component)

**Menu Items:**
- Browse Decks → `/decks`
- Admin Dashboard → `/admin` (conditional: admin role)
- Profile Settings → `/profile`
- Logout → `<LogoutButton />` component

**Display:**
- User avatar with initials
- Email
- Tier badge

---

### Deck Card
**File:** `src/components/decks/DeckCard.tsx`
**Type:** Reusable Component

**External Link:**
- View on Moxfield → `deck.moxfield_url` (opens in new tab)

**Variants:**
- `default` - Full card with image
- `compact` - Condensed version
- `featured` - Highlighted with badge

---

### Auth Buttons

**Login Button:**
**File:** `src/components/auth/login-button.tsx`
**Action:** `window.location.href = '/auth/login'`

**Logout Button:**
**File:** `src/components/auth/logout-button.tsx`
**Action:** POST `/auth/logout` → Redirect to `/`

---

## Redirects & Flow Patterns

### Authentication Flow
```
Unauthenticated user clicks "Login"
  ↓
/auth/login (login page)
  ↓
POST /auth/patreon
  ↓
Redirect to Patreon OAuth (external)
  ↓
User authorizes on Patreon
  ↓
Patreon redirects to /auth/patreon-callback?code=...
  ↓
Server exchanges code for tokens
  ↓
Server creates/updates user in Supabase
  ↓
Server creates session
  ↓
Redirect to /auth/callback-success#access_token=...&refresh_token=...
  ↓
Client reads tokens from hash
  ↓
Client sets up session
  ↓
useRouter.push('/decks')
```

---

### Deck Submission Flow
```
User navigates to /decks/submission
  ↓
Check auth (middleware/client-side)
  ↓
If not authenticated → Redirect to /auth/login
  ↓
Check tier (Duke+)
  ↓
If insufficient tier → Show error/upgrade CTA
  ↓
User fills form
  ↓
Client-side validation
  ↓
POST /api/submit-deck with Bearer token
  ↓
Server checks:
  - Authentication
  - Tier eligibility
  - Monthly limit
  - Form validation
  ↓
If valid:
  - Insert to deck_submissions table
  - Send confirmation email
  - Send admin notification
  - Return submission ID
  ↓
Show success modal → Option to redirect to /decks
  ↓
If invalid:
  - Show error message
  - User can retry
```

---

### Admin Deck Import Flow
```
Admin navigates to /admin/decks/import
  ↓
Enter Moxfield deck ID + tier
  ↓
Click "Import"
  ↓
POST /api/admin/decks/import
  ↓
Server fetches from Moxfield API
  ↓
Server upserts deck to database
  ↓
Server imports cards
  ↓
Return success
  ↓
Router push to /admin/decks
```

---

### Logout Flow
```
User clicks "Logout" in UserMenu
  ↓
<LogoutButton /> triggers supabase.auth.signOut()
  ↓
OR
User navigates to /auth/logout (GET or POST)
  ↓
supabase.auth.signOut() called
  ↓
Clear session cookies
  ↓
Redirect to /?logged_out=true (303)
  ↓
Header component detects auth state change
  ↓
UI updates to show logged-out state
```

---

### Admin Deck Edit Flow
```
Admin navigates to /admin/decks
  ↓
Clicks "Edit" on a deck
  ↓
Router push to /admin/decks/[id]
  ↓
Form loads with current deck data
  ↓
Admin makes changes
  ↓
Click "Save"
  ↓
PATCH /api/admin/decks/[id]
  ↓
Server validates with requireAdmin()
  ↓
Update deck in database
  ↓
Return success
  ↓
Router push to /admin/decks
  ↓
OR Click "Delete"
  ↓
Confirm deletion modal
  ↓
DELETE /api/admin/decks/[id]
  ↓
Server deletes deck_cards first
  ↓
Server deletes deck
  ↓
Return success
  ↓
Router push to /admin/decks
```

---

## Protected Route Guards

### Middleware
**File:** `src/lib/supabase/middleware.ts`
**Purpose:** Server-side route protection

**Protected Routes:**
- `/admin/*` - Requires admin role
- `/profile` - Requires authentication
- `/decks/submission` - Requires authentication + Duke tier

### Auth Guards
**File:** `src/lib/auth-guards.ts`

**Functions:**
- `requireAuth()` - Checks if user is authenticated, redirects to `/auth/login`
- `requireAdmin()` - Checks if user has admin role, redirects to `/`

---

## Special Navigation Patterns

### External Links

**Moxfield:**
- Deck cards link to `deck.moxfield_url`
- Opens in new tab with `target="_blank" rel="noopener noreferrer"`

**Patreon:**
- Tier page links to Patreon
- Auth flow redirects to Patreon OAuth

**Discord:**
- Footer links to Discord community

**Social Media:**
- Various external social links in footer/about

---

### Error Handling

**Auth Errors:**
- All auth errors redirect to `/auth/login?error=...`
- Error types:
  - `config_missing`
  - `no_code`
  - `no_email`
  - `user_lookup_failed`
  - `user_creation_failed`
  - `password_setup_failed`
  - `signin_failed`
  - `callback_failed`

**API Errors:**
- Return JSON with standardized error format
- Client displays error messages in UI
- No automatic redirects

---

### Loading States

**Auth Loading Modal:**
**Component:** `src/components/auth/auth-loading-modal.tsx`
**Trigger:** Login/logout actions
**Animation:** Mana symbol with loading text

**Page Loading:**
- Skeleton loaders for data-heavy pages
- React Query handles loading states
- Suspense boundaries for async components

---

## Query Parameters & URL State

### Deck Browser
**Route:** `/decks`
**Potential Query Params:**
- `?search=...` - Search query
- `?colors=...` - Color filter
- `?tier=...` - Tier filter
- `?page=...` - Pagination

### Auth Pages
**Route:** `/auth/login`
**Query Params:**
- `?error=...` - Error codes from auth flow

**Route:** `/auth/callback-success`
**URL Hash:**
- `#access_token=...`
- `#refresh_token=...`

---

## Summary Statistics

**Total Public Pages:** 9
- `/`, `/decks`, `/decks/[id]`, `/tiers`, `/about`, `/profile`, `/commander-college`, `/discount-store`, `/preview`

**Total Auth Pages:** 4
- `/auth/login`, `/auth/patreon-callback`, `/auth/callback-success`, `/auth/verify`

**Total Protected Pages:** 2
- `/decks/submission`, `/profile`

**Total Admin Pages:** 9
- `/admin`, `/admin/users`, `/admin/decks`, `/admin/decks/[id]`, `/admin/decks/import`, `/admin/tiers`, `/admin/settings`, `/admin/database`, `/admin/test/fetch`

**Total API Endpoints:** 6
- `POST /api/submit-deck`
- `PATCH /api/admin/decks/[id]`
- `DELETE /api/admin/decks/[id]`
- `POST /api/admin/decks/import`
- `POST /auth/patreon`
- `GET /auth/patreon-callback`
- `POST/GET /auth/logout`

**Total Route Handlers:** 7 (including OPTIONS)

**Navigation Components:** 5
- Header, Navigation, NavigationHeader, Footer, UserMenu

---

## Key Interaction Flows

### First-Time User Journey
```
1. Land on / (home page)
2. Browse stats, see featured deck
3. Click "View on Moxfield" or browse /decks
4. Decide to join → Click "Login"
5. OAuth flow → Authenticate with Patreon
6. Redirect to /decks as authenticated user
7. If Duke+ tier → Can access /decks/submission
```

### Returning User Journey
```
1. Land on / or direct to /decks
2. Already authenticated (session cookie)
3. Header shows UserMenu with tier badge
4. Can browse decks, submit if eligible
5. Admin can access /admin dashboard
```

### Admin Workflow
```
1. Login as admin
2. Navigate to /admin
3. Manage users at /admin/users
4. Import deck at /admin/decks/import
   - Enter Moxfield ID
   - Set tier requirement
   - Submit → Redirect to /admin/decks
5. Edit deck at /admin/decks/[id]
   - Update metadata
   - Save or Delete
   - Redirect to /admin/decks
```

---

## Development/Testing Routes

**Route:** `/preview`
**Purpose:** Component preview and testing
**Status:** Development only

**Route:** `/example-home`
**Purpose:** Alternative home page design
**Status:** Development/comparison

**Route:** `/admin/test/fetch`
**Purpose:** Test data fetching patterns
**Status:** Admin testing only

---

## Notes

1. **Three-Tier Supabase Pattern:**
   - Browser client (`lib/supabase/client.ts`) - Read-only, client components
   - Server client (`lib/supabase/server.ts`) - Full access, server components/actions
   - Admin client (`lib/supabase/admin.ts`) - Service role, bypass RLS

2. **React Query Caching:**
   - `staleTime: 5 minutes`
   - `gcTime: 10 minutes`
   - Automatic refetch on window focus

3. **Path Aliases:**
   - All imports use `@/*` pattern
   - Defined in `tsconfig.json`

4. **Auth Pattern:**
   - Custom Patreon OAuth (NOT Supabase native auth)
   - Session managed via Supabase after user creation
   - JWT tokens in cookies

5. **Monthly Submission Limits:**
   - Enforced server-side in API route
   - Also checked by database trigger
   - Duke/Wizard: 1 per month
   - ArchMage: 2 per month

6. **External Integrations:**
   - Patreon OAuth for authentication
   - Moxfield API for deck imports
   - Scryfall for card data (via Moxfield)
   - Resend for email delivery

---

**End of Navigation Map**
