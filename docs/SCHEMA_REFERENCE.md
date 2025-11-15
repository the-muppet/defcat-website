# Database Schema Reference

Complete reference for DefCat DeckVault's Supabase database schema.

## Table of Contents

- [Core Tables](#core-tables)
- [Relationships](#relationships)
- [Enums](#enums)
- [Views](#views)
- [Functions](#functions)
- [Common Query Patterns](#common-query-patterns)

---

## Core Tables

### profiles

User profiles with Patreon integration and role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | User ID (matches auth.users.id) |
| `email` | TEXT | NOT NULL | User email address |
| `patreon_id` | TEXT | UNIQUE | Patreon user ID |
| `patreon_tier` | patreon_tier | | Current Patreon tier |
| `moxfield_username` | TEXT | | Moxfield username |
| `role` | TEXT | DEFAULT 'user' | User role for RBAC |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_profiles_patreon_id` on `patreon_id`
- `idx_profiles_email` on `email`

**RLS Policies:**
- Users can view own profile
- Users can update own profile
- Service role has full access

---

### moxfield_decks

Imported deck metadata from Moxfield API.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Internal deck ID |
| `moxfield_id` | TEXT | UNIQUE NOT NULL | Moxfield deck identifier |
| `name` | TEXT | NOT NULL | Deck name |
| `author_name` | TEXT | | Deck author's display name |
| `author_username` | TEXT | | Deck author's Moxfield username |
| `format` | TEXT | | Deck format (Commander, cEDH, etc.) |
| `visibility` | TEXT | | Public/Private/Unlisted |
| `commanders_count` | INTEGER | | Number of commanders |
| `mainboard_count` | INTEGER | | Number of mainboard cards |
| `sideboard_count` | INTEGER | | Number of sideboard cards |
| `view_count` | INTEGER | | Moxfield view count |
| `like_count` | INTEGER | | Moxfield like count |
| `comment_count` | INTEGER | | Moxfield comment count |
| `raw_data` | JSONB | | Full Moxfield API response (RawMoxData format) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Import timestamp |
| `fetched_at` | TIMESTAMPTZ | | Last fetch timestamp |
| `cards_fetched_at` | TIMESTAMPTZ | | Last card list fetch |
| `last_updated_at` | TIMESTAMPTZ | | Last Moxfield update time |

**Indexes:**
- `idx_moxfield_decks_moxfield_id` on `moxfield_id`
- Additional indexes on author, format, visibility

**RLS Policies:**
- Public read access for all users

---

### cards

MTG card data cache from Scryfall API.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Card ID (Scryfall ID or custom) |
| `name` | TEXT | NOT NULL | Card name |
| `scryfall_id` | TEXT | | Official Scryfall UUID |
| `mana_cost` | TEXT | | Mana cost string (e.g., "{2}{U}{B}") |
| `cmc` | NUMERIC | | Converted mana cost |
| `type_line` | TEXT | | Full type line |
| `oracle_text` | TEXT | | Card text |
| `colors` | TEXT[] | | Card colors (W, U, B, R, G) |
| `color_identity` | TEXT[] | | Color identity for Commander |
| `rarity` | TEXT | | Card rarity |
| `set_code` | TEXT | | Set code |
| `set_name` | TEXT | | Set name |
| `image_url` | TEXT | | Original Scryfall image URL |
| `cached_image_url` | TEXT | | Cached image in Supabase Storage |
| `cache_attempts` | INTEGER | | Number of cache attempts |
| `cache_error` | TEXT | | Last cache error message |
| `last_cache_attempt_at` | TIMESTAMPTZ | | Last cache attempt time |
| `prices` | JSONB | | Price data from Scryfall |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Card added timestamp |

**Indexes:**
- `idx_cards_name` on `name`
- `idx_cards_scryfall_id` on `scryfall_id`
- `idx_cards_color_identity` GIN index on `color_identity`
- `idx_cards_type_line` on `type_line`

**RLS Policies:**
- Public read access for all users

---

### decklist_cards

Junction table linking decks to their card lists.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Internal ID |
| `moxfield_deck_id` | TEXT | FOREIGN KEY → moxfield_decks | Deck reference |
| `card_id` | TEXT | FOREIGN KEY → cards | Card reference |
| `card_name` | TEXT | NOT NULL | Card name (denormalized) |
| `board` | TEXT | NOT NULL | Board type (mainboard/sideboard/commanders) |
| `quantity` | INTEGER | | Number of copies |
| `card_data` | JSONB | | Additional card metadata |
| `fetched_at` | TIMESTAMPTZ | | Card fetch timestamp |

**Indexes:**
- `idx_decklist_cards_moxfield_deck_id` on `moxfield_deck_id`
- `idx_decklist_cards_card_id` on `card_id`
- `idx_decklist_cards_board` on `board`

**RLS Policies:**
- Public read access

---

### deck_submissions

User deck submission requests with tier-based credit system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Submission UUID |
| `user_id` | TEXT | FOREIGN KEY → profiles | Submitting user |
| `patreon_id` | TEXT | | User's Patreon ID |
| `patreon_username` | TEXT | NOT NULL | Patreon display name |
| `patreon_tier` | TEXT | | Tier at submission time |
| `email` | TEXT | NOT NULL | Contact email |
| `discord_username` | TEXT | NOT NULL | Discord username |
| `moxfield_username` | TEXT | | Moxfield username |
| `submission_type` | submission_type | DEFAULT 'deck' | deck or roast |
| `mystery_deck` | BOOLEAN | DEFAULT FALSE | Mystery deck request |
| `commander` | TEXT | | Requested commander |
| `color_preference` | TEXT | | Color preference |
| `theme` | TEXT | | Deck theme |
| `bracket` | TEXT | | Power bracket |
| `budget` | TEXT | | Budget constraint |
| `ideal_date` | TEXT | | Preferred stream date |
| `deck_list_url` | TEXT | | URL to existing deck |
| `coffee_preference` | TEXT | | DefCat's coffee preference question |
| `notes` | TEXT | | Additional notes |
| `status` | TEXT | DEFAULT 'pending' | pending/in_progress/completed |
| `submission_month` | TEXT | | Month of submission (YYYY-MM) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_deck_submissions_user_id` on `user_id`
- `idx_deck_submissions_patreon_id` on `patreon_id`
- `idx_deck_submissions_status` on `status`
- `idx_deck_submissions_submission_month` on `submission_month`
- `idx_deck_submissions_submission_type` on `submission_type`

**RLS Policies:**
- Users can view own submissions
- Users can insert own submissions
- Service role has full access

---

### user_credits

Monthly credit allocation for deck/roast submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | TEXT | PRIMARY KEY, FK → profiles | User reference |
| `credits` | JSONB | NOT NULL | Credit balances by type |
| `last_granted` | JSONB | NOT NULL | Last grant metadata |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Credits JSON Structure:**
```json
{
  "deck": 2,
  "roast": 2
}
```

**Last Granted JSON Structure:**
```json
{
  "deck": "2024-10",
  "roast": "2024-10"
}
```

**RLS Policies:**
- Users can view own credits
- Service role has full access

---

### products

Affiliate products and merchandise for display.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Product UUID |
| `key` | TEXT | UNIQUE NOT NULL | Unique identifier key |
| `name` | TEXT | NOT NULL | Product name |
| `description` | TEXT | | Product description |
| `link` | TEXT | NOT NULL | Affiliate/product link |
| `image_url` | TEXT | | Product image URL |
| `category` | TEXT | | Product category |
| `sort_order` | INTEGER | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Visibility flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Created timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Updated timestamp |

**Indexes:**
- `idx_products_category` on `category`
- `idx_products_is_active` on `is_active`
- `idx_products_sort_order` on `sort_order`

**RLS Policies:**
- Public read access for active products

---

### site_config

Application configuration key-value store.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Config UUID |
| `key` | TEXT | UNIQUE NOT NULL | Configuration key |
| `value` | TEXT | | Configuration value |
| `category` | TEXT | DEFAULT 'general' | Config category |
| `description` | TEXT | | Human-readable description |
| `is_sensitive` | BOOLEAN | DEFAULT FALSE | Contains sensitive data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Created timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Updated timestamp |

**Indexes:**
- `idx_site_config_key` on `key`
- `idx_site_config_category` on `category`

**RLS Policies:**
- Admin access only

---

### tiers

Patreon tier definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Tier identifier |
| `display_name` | TEXT | NOT NULL | Display name |
| `sort_order` | INTEGER | NOT NULL | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Created timestamp |

**Data:**
- `citizen`: Citizen ($2+)
- `knight`: Knight ($10+)
- `emissary`: Emissary ($30+)
- `duke`: Duke ($50+)
- `wizard`: Wizard ($165+)
- `archmage`: ArchMage ($250+)

---

### credit_types

Types of credits users can have.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Credit type identifier |
| `display_name` | TEXT | NOT NULL | Display name |
| `description` | TEXT | | Description |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Created timestamp |

**Data:**
- `deck`: Deck submission credits
- `roast`: Roast request credits

---

### tier_benefits

Defines credit amounts granted per tier per credit type.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `tier_id` | TEXT | PRIMARY KEY, FK → tiers | Tier reference |
| `credit_type_id` | TEXT | PRIMARY KEY, FK → credit_types | Credit type reference |
| `amount` | INTEGER | DEFAULT 0 | Credits granted |

**Current Configuration:**
- Duke: 1 deck credit, 1 roast credit per month
- Wizard: 2 deck credits, 2 roast credits per month
- ArchMage: 3 deck credits, 3 roast credits per month

---

### update_logs

Audit log for batch operations and updates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Log UUID |
| `operation_type` | TEXT | NOT NULL | Type of operation |
| `status` | TEXT | NOT NULL | Operation status |
| `total_items` | INTEGER | | Total items to process |
| `processed_count` | INTEGER | | Items processed |
| `success_count` | INTEGER | | Successful operations |
| `failed_count` | INTEGER | | Failed operations |
| `skipped_count` | INTEGER | | Skipped operations |
| `error_message` | TEXT | | Error message if failed |
| `error_details` | JSONB | | Detailed error info |
| `metadata` | JSONB | | Additional metadata |
| `duration_ms` | INTEGER | | Operation duration |
| `triggered_by` | TEXT | | Who/what triggered |
| `started_at` | TIMESTAMPTZ | NOT NULL | Start time |
| `completed_at` | TIMESTAMPTZ | | Completion time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Log creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

---

### bookmark_sync_logs

Specific logs for Moxfield bookmark synchronization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Log UUID |
| `bookmark_id` | TEXT | NOT NULL | Moxfield bookmark ID |
| `status` | TEXT | NOT NULL | Sync status |
| `total_decks` | INTEGER | | Total decks in bookmark |
| `inserted_decks` | INTEGER | | New decks added |
| `updated_decks` | INTEGER | | Decks updated |
| `unchanged_decks` | INTEGER | | Decks unchanged |
| `duration_ms` | INTEGER | | Sync duration |
| `error_message` | TEXT | | Error message if failed |
| `started_at` | TIMESTAMPTZ | | Sync start time |
| `completed_at` | TIMESTAMPTZ | | Sync completion time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Log creation |

---

## Type Definitions

### RawMoxData

Represents the raw Moxfield API response format stored in the `moxfield_decks.raw_data` JSONB column. This is the unmodified deck data from Moxfield's API.

**TypeScript Definition:**
```typescript
interface RawMoxData {
  id: string                           // Moxfield deck ID
  name: string                         // Deck name
  colors: string[]                     // Color array (W, U, B, R, G)
  format: string                       // Deck format
  authors: CreatedByUser[]             // Deck authors
  bracket: number                      // Power bracket (1-5)
  isLegal: boolean                     // Format legality status
  hubNames: any[]                      // Associated hub names
  isShared: boolean                    // Shared status
  publicID: string                     // Public deck identifier
  hasPrimer: boolean                   // Has primer/description
  likeCount: number                    // Number of likes
  publicURL: string                    // Public deck URL
  viewCount: number                    // View count
  commanders: Commander[]              // Commander cards
  mainCardID: string                   // Main card display ID
  visibility: string                   // Public/Private/Unlisted
  autoBracket: number                  // Auto-calculated bracket
  commentCount: number                 // Total comments
  createdAtUTC: Date                   // Creation timestamp
  bookmarkCount: number                // Bookmark count
  colorIdentity: string[]              // Commander color identity
  createdByUser: CreatedByUser         // Original author
  authorsCanEdit: boolean              // Author edit permissions
  ignoreBrackets: boolean              // Bracket opt-out flag
  mainboardCount: number               // Mainboard card count
  sideboardCount: number               // Sideboard card count
  maybeboardCount: number              // Maybeboard card count
  sfwCommentCount: number              // Safe-for-work comment count
  colorPercentages: ColorPercentages   // Color distribution
  lastUpdatedAtUTC: Date               // Last update timestamp
  areCommentsEnabled: boolean          // Comments enabled flag
  mainCardIDIsBackFace: boolean        // Main card face flag
  mainCardIDIsCardFace: boolean        // Main card is card face
  colorIdentityPercentages: ColorPercentages  // Color identity %
}
```

**Storage:**
- Column: `moxfield_decks.raw_data` (JSONB)
- Purpose: Preserves complete Moxfield API response for future reference and processing
- Usage: Source of truth for deck metadata and card lists

### Commander

Represents commander card data within the `RawMoxData` format.

**TypeScript Definition:**
```typescript
interface Commander {
  id: string                           // Commander card ID
  name: string                         // Commander card name
  imageCardID: string                  // Image card identifier
  uniqueCardID: string                 // Unique Scryfall/Moxfield ID
  imageCardIDIsCardFace: boolean       // Image is specific card face
}
```

**Usage:**
- Stored within `RawMoxData.commanders` array
- Referenced for deck commander identification
- Used for deck color identity calculation

### Supporting Types

**CreatedByUser:**
```typescript
interface CreatedByUser {
  userName: string
  displayName: string
  profileImageUrl: string
  badges: string[]
}
```

**ColorPercentages:**
```typescript
interface ColorPercentages {
  white: number
  blue: number
  black: number
  red: number
  green: number
}
```

---

## Enums

### patreon_tier

```typescript
type PatreonTier =
  | 'Citizen'    // $2+/month
  | 'Knight'     // $10+/month
  | 'Emissary'   // $30+/month
  | 'Duke'       // $50+/month
  | 'Wizard'     // $165+/month
  | 'ArchMage'   // $250+/month
```

### submission_type

```typescript
type SubmissionType =
  | 'deck'   // Deck submission
  | 'roast'  // Roast request
```

### user_role

```typescript
type UserRole =
  | 'user'          // Level 0 - Basic user
  | 'member'        // Level 1 - Patreon member
  | 'moderator'     // Level 2 - Moderator
  | 'administrator' // Level 3 - Admin
  | 'developer'     // Level 4 - Developer
```

---

## Views

### deck_list_view

Simplified view for deck browsing with aggregated data.

**Columns:**
- `id`, `moxfield_id`, `name`, `author_username`
- `format`, `public_id`, `public_url`
- `mainboard_count`, `like_count`, `view_count`
- `color_string` (computed from cards)
- `primary_commander` (first commander)
- `price_category` (budget/mid/high)
- `total_price` (aggregated from cards)

### unified_deck_view

Comprehensive deck view with all analytics and metrics.

**Columns:**
- All moxfield_decks columns
- Card aggregations (commanders, colors, types)
- Price aggregations
- Calculated metrics (avg CMC, mana curve, etc.)
- Sync status indicators

### user_credit_details

Expanded user credit information.

**Columns:**
- `user_id`, `email`, `patreon_tier`
- `credits` (current balance)
- `credits_expanded` (detailed breakdown)
- `last_granted` (grant metadata)

### submission_stats

Aggregated submission statistics.

**Columns:**
- `total_submissions`
- `unique_users`
- `pending_count`, `in_progress_count`, `completed_count`
- `mystery_deck_count`
- Counts by tier (duke_submissions, wizard_submissions, archmage_submissions)
- `unique_brackets`, `unique_color_combinations`

### tier_benefit_matrix

Matrix view of tier benefits.

**Columns:**
- `tier` (tier name)
- `benefits` (JSON object with credit amounts)
- `sort_order`

---

## Functions

### use_credit(p_user_id, p_submission_type)

Consumes a credit for a submission.

**Parameters:**
- `p_user_id` (TEXT) - User ID
- `p_submission_type` (submission_type) - Type of credit to use

**Returns:** BOOLEAN - Success/failure

**Logic:**
- Decrements appropriate credit counter
- Returns FALSE if insufficient credits
- Returns TRUE on success

### refund_credit(p_user_id, p_submission_type, p_submission_month)

Refunds a credit for a cancelled/rejected submission.

**Parameters:**
- `p_user_id` (TEXT) - User ID
- `p_submission_type` (submission_type) - Type of credit
- `p_submission_month` (TEXT) - Month of submission

**Returns:** BOOLEAN - Success/failure

### refresh_user_credits(p_user_id, p_patreon_tier)

Resets user credits based on their current tier.

**Parameters:**
- `p_user_id` (TEXT) - User ID
- `p_patreon_tier` (TEXT) - Current Patreon tier

**Returns:** VOID

**Logic:**
- Calculates credit amounts for tier
- Updates user_credits with new amounts
- Updates last_granted timestamps

### distribute_monthly_credits()

Batch distributes credits to all active users.

**Returns:** TABLE(user_id TEXT, credits_granted JSONB)

**Logic:**
- Iterates all profiles with Patreon tiers
- Calls refresh_user_credits for each
- Returns summary of distributions

### import_deck_from_jsonb(deck_moxfield_id, deck_jsonb)

Imports a deck from Moxfield JSON data.

**Parameters:**
- `deck_moxfield_id` (TEXT) - Moxfield deck ID
- `deck_jsonb` (JSONB) - Full Moxfield API response

**Returns:** TEXT - Inserted/updated deck ID

---

## Common Query Patterns

### Get User Profile with Credits

```typescript
const { data, error } = await supabase
  .from('user_credit_details')
  .select('*')
  .eq('user_id', userId)
  .single()
```

### List Decks with Pagination

```typescript
const { data, error } = await supabase
  .from('deck_list_view')
  .select('*')
  .order('view_count', { ascending: false })
  .range(0, 19) // First 20 decks
```

### Get User Submissions

```typescript
const { data, error } = await supabase
  .from('deck_submissions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

### Check Credit Balance

```typescript
const { data, error } = await supabase
  .from('user_credits')
  .select('credits')
  .eq('user_id', userId)
  .single()

// data.credits = { deck: 2, roast: 1 }
```

### Use a Credit

```typescript
const { data, error } = await supabase
  .rpc('use_credit', {
    p_user_id: userId,
    p_submission_type: 'deck'
  })

// Returns true if successful, false if insufficient credits
```

---

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Service Role** bypasses RLS - use only in trusted server contexts
3. **User Isolation**: Users can only access their own sensitive data
4. **Public Read**: Cards, decks, and products are publicly readable
5. **Admin Operations**: Use admin client for privileged operations

---

**Last Updated:** 2025-10-31
