# Admin Panel User Guide

Welcome to the DefCat DeckVault Admin Panel! This guide will help you navigate and use all the administrative features available to manage the site.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Deck Management](#deck-management)
4. [User Management](#user-management)
5. [Submissions Management](#submissions-management)
6. [Products Management](#products-management)
7. [Site Settings](#site-settings)
8. [Documentation](#documentation)
9. [Common Tasks](#common-tasks)

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to `https://www.defcatmtg.com/admin`
2. You must have **Moderator** role or higher to access the admin panel
3. If you don't have access, you'll be redirected to the login page

### User Roles and Permissions

The system has a hierarchical role structure:

- **User (Level 0)** - Basic site access - This is for anon web-traffic
- **Member (Level 1)** - Member privileges - All patrons are Members
- **Moderator (Level 2)** - Can access dashboard and basic site settings
- **Admin (Level 3)** - Near-Complete system access including but not limited to:
   - control over the *display* of: 
      - content:
         - decklists
         - video links
         - social links
         - 'About' tab/page content (more on that later)  
      - products (both physical and digital assets):
         - digital: credit-system management (submission, roast, adding/removing new types is currently supported but we'd have to develop how to *use* them further down the road, but you could make a.. idk, Cat Credit and dole it out to specific users individually and give it value elsewhere or something)
         - physical: this encompasses your pre-existing store-based merch links and images and such.  
      - users: 
         - role assignment (This refers to **these** roles, not patreon-based tiers)
         - credits (allocation, distribution, creation, removal)
- **Developer (Level 4)** - Complete access and full sytem-wide permissions. (This is my role, and exists as a safety net for you - but can be removed upon request)

Higher roles **inherit all permissions from lower** roles.

---

## Dashboard Overview

The dashboard is your central hub for accessing all admin features.

### Statistics Cards

At the top of the dashboard, you'll see four key metrics. All of them are placeholders and can be removed or changed to w/e. just filing out the page more or less:

- **Total Decks** - Number of active deck listings in the database
- **Total Users** - Number of registered user accounts
- **Active Patrons** - Users with active Patreon subscriptions
- **Premium Decks** - Number of tier-exclusive decks 

### Quick Access Cards

Below the statistics, you'll find cards for quick access to major features:

1. **Deck Management** - Import, edit, and manage deck listings
2. **Pending Submissions** - Review and process user submissions
3. **User Management** - Manage user accounts and roles
4. **Products** - Configure store product links
5. **Site Settings** - Configure site-wide settings and credits
6. **Documentation** - View technical documentation and diagrams

Each card shows the number of pending items (if applicable) and provides a direct link to that feature.

---

## Deck Management

**Access Required:** Admin or Developer

### Viewing All Decks

From the main Deck Management page, you'll see a list of all decks with:

- Deck name
- Commander(s) with color identity badges
- View count
- Moxfield ID
- Action buttons (View, Edit)

### Importing a Single Deck

1. Click **Import Deck** from the Deck Management page
2. Enter the Moxfield deck URL
3. Click **Import Deck**
4. The system will fetch deck data from Moxfield and create a new entry

### Importing Multiple Decks (Bulk Import)

Use this to import all decks from your Moxfield bookmark collection:

1. Click **Fetch All (New)** button
2. The system will:
   - Connect to Moxfield
   - Find all bookmarked decks
   - Import only new decks not already in the database
3. Wait for the operation to complete (may take several minutes)
4. Page will automatically refresh to show new decks

### Updating Existing Decks

To refresh metadata for all decks:

1. Click **Update All Decks** button
2. Select the bookmark to sync from
3. The system will update view counts, commanders, and other metadata
4. Wait for completion (may take several minutes)

### Editing a Deck

1. Find the deck in the list
2. Click the **Edit** button
3. You can modify:
   - Deck name
   - Moxfield ID
   - Public URL
   - Format (Commander, Brawl, etc.)
   - View/like/comment counts
   - Mainboard and sideboard card counts
   - Author username
4. Click **Save Changes** when done

### Viewing a Deck

Click the **View** button to see the deck as users see it on the front-end.

---

## User Management

**Access Required:** Admin or Developer

### Searching for Users

1. Use the search bar at the top to find users by email
2. Type any part of the email address
3. Press Enter or click **Search**
4. Click the **X** button to clear search and return to the default view

### User Information

For each user, you can see:

- Email address
- Current Patreon tier
- How long they've been subscribed
- Account creation date
- Deck credits balance
- Roast credits balance
- Total submission count

### Changing User Roles

1. Find the user in the list
2. Click the role dropdown on the right side of their card
3. Select the new role:
   - User
   - Admin
   - Moderator
   - Developer (only if you're a Developer)
4. The change is applied immediately

### Adding a New User

1. Click **Add User** button
2. Fill in the form:
   - **Email** (required)
   - **Role** (defaults to User)
   - **Patreon Tier** (optional)
3. Click **Add User**
4. The system will:
   - Create the user account
   - Send a password reset email
   - Show success message

**Tip:** If you're searching for someone who doesn't exist, their email will be pre-filled in the Add User form!

---

## Submissions Management

**Access Required:** Admin or Developer

### Viewing Pending Submissions

The Submissions page shows all deck submissions with status "pending" or "queued", ordered by oldest first.

### Submission Details

Each submission card displays:

**User Information:**
- Email address
- Moxfield username (clickable link)
- Discord username
- Patreon tier

**Deck Preferences:**
- Submission type (Mystery Deck or Custom Build)
- Commander preference
- Color preference (shown with mana symbols)
- Power bracket
- Budget
- Coffee preference
- Theme/strategy
- Ideal completion date

**Metadata:**
- Submission number
- Submission timestamp

### Processing Submissions

You have two action options:

1. **Start** - Marks submission as "in_progress"
   - Use this when you begin working on the deck
   - Moves it out of the pending queue

2. **Reject** - Marks submission as "rejected"
   - Use this if the submission can't be fulfilled
   - Consider adding notes about why (future feature)

---

## Products Management

**Access Required:** Admin or Developer

Manage the product links that appear in your store (typically linked to Fourthwall).

### Adding a Product

1. Click **Add Product** button
2. Fill in the product information:
   - **Product Key** - Unique identifier (auto-generated if left blank)
   - **Product Name** (required)
   - **Description** - Detailed product description
   - **Product Link** (required) - Full Fourthwall URL
   - **Image URL** - Direct link to product image
   - **Category** - Organize products by category
   - **Sort Order** - Number to control display order (lower = first)
   - **Active** - Toggle to show/hide product
3. Click **Add Product**

### Editing a Product

1. Find the product in the list
2. Modify any field
3. Click **Save** to persist changes

### Deleting a Product

1. Click the **Delete** button (trash icon)
2. Confirm the deletion
3. Product is removed from database

**Note:** Product changes are saved individually. Make sure to click Save after editing!

---

## Site Settings

**Access Required:** Moderator+ (Credits tab requires Admin+)

### Site Settings Tab

This tab manages site-wide configuration including videos, social links, and other settings.

#### Configuration Categories

The settings are organized into categories. Each category has an **Add New** button to create additional entries.

**Common Configuration Items:**
- Video links for featured content
- Social media links (Twitter, Discord, Patreon, etc.)
- Site metadata and SEO settings
- Feature flags and toggles

#### Adding New Configuration

1. Click **Add New** in any category section
2. Fill in the dialog:
   - **Key** - Configuration identifier (e.g., `video_tutorial_1`)
   - **Value** - The actual value (URL, text, number, etc.)
   - **Category** - Auto-filled based on which section you clicked
   - **Description** - What this configuration controls
   - **Sensitive** - Check if this value should be hidden
3. Click **Create**

#### Editing Configuration

1. Find the configuration item
2. Modify the value in the input field
3. Click **Save Changes** at the bottom

#### Deleting Configuration

1. Click the trash icon next to the configuration item
2. Confirm deletion
3. Configuration is removed

### Credits Tab

**Access Required:** Admin or Developer

Manage the credit system used for deck submissions and roasts.

#### Credit Types

View and manage different types of credits:
- **Deck Credits** - Used for deck submission requests
- **Roast Credits** - Used for deck roast requests

**Adding a Credit Type:**
1. Click **Add Credit Type**
2. Enter:
   - Display Name
   - Description
3. ID is auto-generated
4. Click **Add**

#### Benefits Matrix

Configure how many credits each Patreon tier receives monthly:

1. View the matrix showing Tiers (rows) vs Credit Types (columns)
2. Enter the number of credits for each tier/type combination
3. Click **Save Benefits Matrix**

**Example:**
- Citizen tier: 1 deck credit, 2 roast credits per month
- Knight tier: 2 deck credits, 4 roast credits per month

#### Distribution Manager

View and manage credit distribution history:

- See past distributions with dates and status
- View which tiers received credits
- Trigger manual distributions if needed

**Note:** Credits are typically distributed automatically on a monthly schedule.

---

## Documentation

**Access Required:** Admin or Developer

The Documentation section provides technical diagrams and architecture information.

### Architecture Tab

View the system architecture diagram showing:
- External services (Patreon, Moxfield, Scryfall APIs)
- Application layers (Presentation, API, Business Logic, Data)
- Component relationships
- Security boundaries

### Database Tab

Explore the database schema with:
- Entity relationship diagram
- All database tables and their relationships
- Key constraints and indexes
- Row-level security policies

**Core Tables:**
- `profiles` - User accounts and authentication
- `products` - Patreon tier products
- `decks` - Deck metadata
- `cards` - MTG card cache
- `deck_cards` - Cards in each deck
- `deck_submissions` - User submission requests
- `site_config` - Site configuration

### Components Tab

See the component hierarchy diagram showing:
- Layout components (Header, Footer, Navigation)
- Feature components (Decks, Admin, Auth)
- Base UI components (shadcn/ui)
- Magic UI components (Mana symbols, card previews)

### Data Flows Tab

Understand how data flows through the system:
- Authentication flow sequence
- Deck submission process
- Caching strategies
- Error handling patterns

---

## Common Tasks

### Task: Import New Decks from Moxfield

1. Go to **Deck Management**
2. Click **Fetch All (New)**
3. Wait 3-5 minutes for import to complete
4. Page refreshes automatically to show new decks

### Task: Update Deck View Counts

1. Go to **Deck Management**
2. Click **Update All Decks**
3. Wait for sync to complete
4. View counts and metadata are refreshed

### Task: Promote a User to Admin

1. Go to **User Management**
2. Search for the user by email
3. Click their role dropdown
4. Select "Admin"
5. Change is applied immediately

### Task: Process a Pending Submission

1. Go to **Submissions Management**
2. Review submission details
3. Click **Start** when you begin working on it
4. (Outside admin panel) Build the deck
5. (Future feature) Mark as completed

### Task: Add a New Product to the Store

1. Go to **Products Management**
2. Click **Add Product**
3. Fill in all required fields:
   - Product Name
   - Product Link (Fourthwall URL)
4. Set Sort Order for display position
5. Toggle Active to make it visible
6. Click **Add Product**

### Task: Add a New Video Link to the Site

1. Go to **Site Settings** → Site Settings Tab
2. Click **Add New** in the Videos section
3. Enter:
   - Key: `video_feature_3`
   - Value: YouTube/video URL
   - Description: What this video is about
4. Click **Create**
5. Click **Save Changes** at the bottom

### Task: Configure Monthly Credit Distribution

1. Go to **Site Settings** → Credits Tab
2. Click **Benefits Matrix** sub-section
3. Set credit amounts for each tier:
   - Enter numbers in the matrix
   - Columns = credit types
   - Rows = Patreon tiers
4. Click **Save Benefits Matrix**
5. Credits will be distributed on the monthly schedule

---

## Tips and Best Practices

### General Tips

- **Always save your changes** - Some forms require clicking Save, changes aren't always automatic
- **Use search efficiently** - Email search is fast, use it instead of scrolling
- **Check permissions** - If you can't see a feature, check your role level
- **Refresh after bulk operations** - Imports and updates may take time, page will auto-refresh

### Security Best Practices

- **Be careful with roles** - Only assign Admin role to trusted individuals
- **Don't share credentials** - Each admin should have their own account
- **Review submissions carefully** - Check for inappropriate content or spam
- **Use Developer Tools responsibly** - Reset tier spoofing after testing

### Content Management

- **Monitor submissions** - Check pending submissions daily
- **Organize products** - Use Sort Order and Categories effectively
- **Document configuration** - Use clear keys and descriptions for site config

### Troubleshooting

**Problem: Can't access admin panel**
- Check your user role (must be Moderator+)
- Try logging out and back in
- Contact a Developer to verify your role

**Problem: Deck import fails**
- Verify Moxfield URL is correct
- Check if deck is public on Moxfield
- Wait a moment and try again (rate limiting)

**Problem: Changes don't appear**
- Click Save if required
- Refresh the page
- Clear browser cache
- Check for error messages

**Problem: User search returns no results**
- Verify email spelling
- Try searching partial email
- User may not exist (add them instead)

---

## Support and Questions

If you encounter issues or have questions:

1. Check this guide first
2. Review the Documentation section for technical details
3. Contact the development team
4. Check the GitHub repository for known issues

---

**Last Updated:** 2025-11-01

**Version:** 1.0.0
