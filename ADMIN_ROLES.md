# Admin Roles Guide

This application has a two-tier admin system to separate client content management from developer system access.

## Role Hierarchy

```
user < admin < moderator < developer
```

### Role Capabilities

#### **User** (default)
- Browse decks
- Submit deck requests (based on Patreon tier)
- View public content

#### **Admin** (for client)
- ✅ Access `/admin` panel
- ✅ Manage products (add, edit, delete)
- ✅ Update site configuration (videos, social links)
- ✅ View deck submissions
- ✅ Manage user roles (promote to admin/moderator only)
- ❌ NO database access
- ❌ NO SQL query execution
- ❌ CANNOT assign developer role
- ❌ CANNOT spoof Patreon tiers

#### **Moderator**
- Same as Admin
- ✅ Additional moderation capabilities (future)

#### **Developer** (for technical work)
- ✅ Everything Admin can do
- ✅ Access `/admin/database` panel
- ✅ Execute SQL queries (SELECT only for safety)
- ✅ View all database tables
- ✅ Manage all user roles (including developer)
- ✅ Spoof Patreon tiers for testing
- ✅ Full system access

## Setting Roles

### Make Someone an Admin (Client Access)

```bash
# First, find their user ID
npx tsx scripts/check-my-role.ts

# Then set them to admin
npx tsx scripts/set-client-admin.ts <USER_ID>
```

### Make Yourself a Developer (Full Access)

```bash
npx tsx scripts/make-me-developer.ts
```

## Access Paths

| Role      | Admin Panel | User Management | Database Panel | Developer Tools |
|-----------|-------------|-----------------|----------------|-----------------|
| user      | ❌          | ❌              | ❌             | ❌              |
| admin     | ✅          | ✅ (limited)    | ❌             | ❌              |
| moderator | ✅          | ✅ (limited)    | ❌             | ❌              |
| developer | ✅          | ✅ (full)       | ✅             | ✅              |

- **Admin Panel**: `/admin` - Settings, products, site config
- **User Management**: `/admin/users` - Assign roles, manage permissions
- **Database Panel**: `/admin/database` - SQL queries, table inspection (developer only)
- **Developer Tools**: Part of User Management page - Spoof tiers, testing utilities (developer only)

## Security Notes

- Admins can manage content but cannot execute arbitrary SQL
- Developers have full database access - use responsibly
- The database panel only allows SELECT queries for safety
- All modifications should go through proper API routes
- RLS policies protect sensitive data at the database level

## Recommended Workflow

1. **Client gets `admin` role** - Can manage day-to-day content
2. **You keep `developer` role** - Can handle technical issues and database work
3. When client needs help with something technical, you log in as developer
4. For security, consider having separate accounts for each role

## Example: Setting Up the Client

```bash
# 1. Client creates account via Patreon OAuth
# 2. Find their user ID
npx tsx scripts/check-my-role.ts

# 3. Set them to admin (copy their ID from output)
npx tsx scripts/set-client-admin.ts abc123-def456-...

# 4. They can now:
#    - Go to /admin
#    - Manage products
#    - Update videos and social links
#    - Assign admin/moderator roles to other users
#    - But CANNOT access /admin/database
#    - But CANNOT assign developer role
#    - But CANNOT spoof Patreon tiers
```

## Developer Features

### Spoof Patreon Tier (Testing)

As a developer, you can temporarily override your Patreon tier to test tier-gated features:

1. Go to `/admin/users`
2. In the "Developer Tools" panel (right side)
3. Select a tier to spoof
4. Click "Spoof Tier"
5. Refresh the page to see changes
6. Click "Reset" to return to your real tier

**Use cases:**
- Test deck submission limits for different tiers
- Verify tier-gated deck access
- Test tier badge displays
- Validate pricing/benefits for each tier

### Managing User Roles

**As Admin/Moderator:**
1. Go to `/admin/users`
2. Search for user by email
3. Use dropdown to assign: `user`, `admin`, or `moderator`
4. Cannot assign `developer` role

**As Developer:**
1. Go to `/admin/users`
2. Search for user by email
3. Use dropdown to assign any role (including `developer`)
4. Full control over all user permissions
