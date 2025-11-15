# Component Hierarchy & Structure

This document shows the React component hierarchy and organization in DefCat's DeckVault.

**Last Updated:** 2025-11-15

## App-Level Component Structure

```mermaid
graph TB
    RootLayout[RootLayout<br/>app/layout.tsx]

    RootLayout --> Providers[Providers<br/>Context Providers]
    RootLayout --> HeaderWrapper[HeaderWrapper<br/>Layout Header]
    RootLayout --> MainContent[Main Content Area<br/>children]
    RootLayout --> Footer[Footer<br/>Layout Footer]

    subgraph "Context Providers"
        Providers --> ThemeProvider[ThemeProvider<br/>Dark/Light Mode]
        Providers --> AuthProvider[AuthProvider<br/>User Session]
        Providers --> TanStackProvider[QueryClientProvider<br/>TanStack Query]
    end

    subgraph "Header Components"
        HeaderWrapper --> Header[Header<br/>Navigation Bar]
        Header --> NavigationHeader[NavigationHeader<br/>Main Nav]
        Header --> UserMenu[UserMenu<br/>User Dropdown]
        Header --> LoginButton[LoginButton]
        Header --> LogoutButton[LogoutButton]
    end

    subgraph "Main Content Routes"
        MainContent --> HomePage["/ - Home Page"]
        MainContent --> DecksPage["/decks - Deck Browser"]
        MainContent --> DeckDetailPage["/decks/:id - Deck Detail"]
        MainContent --> ProfilePage["/profile - User Profile"]
        MainContent --> AdminPage["/admin - Admin Dashboard"]
        MainContent --> AuthPages["/auth/* - Auth Pages"]
    end

    %% Styling
    classDef layout fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef provider fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef navigation fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef page fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class RootLayout,HeaderWrapper,Header,Footer layout
    class Providers,ThemeProvider,AuthProvider,TanStackProvider provider
    class NavigationHeader,UserMenu,LoginButton,LogoutButton navigation
    class HomePage,DecksPage,DeckDetailPage,ProfilePage,AdminPage,AuthPages page
```

## Page-Specific Component Trees

### Home Page Components

```mermaid
graph TB
    HomePage[Home Page<br/>app/page.tsx]

    HomePage --> FeaturedVideo[FeaturedVideo<br/>Hero Section]
    HomePage --> FeaturedDeckCard[FeaturedDeckCard<br/>Showcase Deck]
    HomePage --> RotatingAds[RotatingAds<br/>Product Carousel]
    HomePage --> SocialMediaLinks[SocialMediaLinks<br/>Social Footer]

    FeaturedVideo --> VideoPlayer[VideoPlayer<br/>Embedded Video]
    FeaturedDeckCard --> DeckCard[DeckCard<br/>Reusable Card]
    RotatingAds --> ProductCards[Product Cards<br/>Carousel Items]

    %% Styling
    classDef page fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef feature fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef component fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class HomePage page
    class FeaturedVideo,FeaturedDeckCard,RotatingAds,SocialMediaLinks feature
    class VideoPlayer,DeckCard,ProductCards component
```

### Deck Browser Components

```mermaid
graph TB
    DecksPage[Decks Page<br/>app/decks/page.tsx]

    DecksPage --> DeckFilters[Deck Filters<br/>Search & Filter UI]
    DecksPage --> DeckGrid[Deck Grid<br/>Results Display]
    DecksPage --> Pagination[Pagination<br/>Page Controls]

    DeckFilters --> ColorFilter[Color Filter<br/>Mana Symbols]
    DeckFilters --> FormatFilter[Format Filter<br/>Commander/cEDH]
    DeckFilters --> SearchInput[Search Input<br/>Text Search]

    DeckGrid --> DeckCard1[DeckCard]
    DeckGrid --> DeckCard2[DeckCard]
    DeckGrid --> DeckCard3[DeckCard]
    DeckGrid --> MoreDecks[...]

    DeckCard1 --> Commander[Commander<br/>Card Display]
    DeckCard1 --> ManaSymbols[ManaSymbols<br/>Color Identity]
    DeckCard1 --> DeckStats[Deck Stats<br/>Views/Likes]

    %% Styling
    classDef page fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef section fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef component fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef detail fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class DecksPage page
    class DeckFilters,DeckGrid,Pagination section
    class ColorFilter,FormatFilter,SearchInput,DeckCard1,DeckCard2,DeckCard3 component
    class Commander,ManaSymbols,DeckStats detail
```

### Deck Detail Page Components

```mermaid
graph TB
    DeckDetail["Deck Detail Page<br/>app/decks/:id/page.tsx"]

    DeckDetail --> DeckHeader[Deck Header<br/>Title & Metadata]
    DeckDetail --> CommanderDisplay[Commander Display<br/>Commander Images]
    DeckDetail --> DeckTabs[Deck Tabs<br/>Different Views]
    DeckDetail --> DeckSidebar[Deck Sidebar<br/>Stats Panel]

    DeckHeader --> TitleSection[Title Section]
    DeckHeader --> AuthorInfo[Author Info]
    DeckHeader --> ActionButtons[Action Buttons<br/>View/Export]

    CommanderDisplay --> CommanderImage1[CommanderImage]
    CommanderDisplay --> CommanderImage2[CommanderImage]

    DeckTabs --> StatsTab[Stats Tab]
    DeckTabs --> CardListTab[Card List Tab]
    DeckTabs --> AnalyticsTab[Analytics Tab]

    StatsTab --> ManaCurve[ManaCurve<br/>CMC Distribution]
    StatsTab --> ColorDist[ColorDist<br/>Color Distribution]
    StatsTab --> Cardtypes[Cardtypes<br/>Type Breakdown]

    CardListTab --> CardSection1[Commanders Section]
    CardListTab --> CardSection2[Mainboard Section]
    CardListTab --> CardSection3[Sideboard Section]

    CardSection2 --> CardPreview1[CardPreview]
    CardSection2 --> CardPreview2[CardPreview]
    CardSection2 --> CardPreview3[CardPreview]

    DeckSidebar --> DeckStatsView[DeckStatsView<br/>Numeric Stats]
    DeckSidebar --> ManaAnalysisCard[ManaAnalysisCard<br/>Mana Analysis]
    DeckSidebar --> RoastButton[RoastButton<br/>Submit for Roast]

    %% Styling
    classDef page fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef section fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef component fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef detail fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class DeckDetail page
    class DeckHeader,CommanderDisplay,DeckTabs,DeckSidebar section
    class TitleSection,AuthorInfo,ActionButtons,StatsTab,CardListTab,AnalyticsTab component
    class ManaCurve,ColorDist,Cardtypes,CardPreview1,CardPreview2,CardPreview3,DeckStatsView,ManaAnalysisCard,RoastButton detail
```

### Profile Page Components

```mermaid
graph TB
    ProfilePage[Profile Page<br/>app/profile/page.tsx]

    ProfilePage --> ProfilePanel[ProfilePanel<br/>User Info]
    ProfilePage --> TierCreditsCard[TierCreditsCard<br/>Tier & Credits]
    ProfilePage --> MySubmissions[MySubmissions<br/>Submission History]
    ProfilePage --> UserDecks[UserDecks<br/>User's Decks]
    ProfilePage --> MyDrafts[MyDrafts<br/>Draft Submissions]

    ProfilePanel --> ProfileEditForm[ProfileEditForm<br/>Edit Profile]
    ProfilePanel --> PatreonStatus[Patreon Status<br/>Tier Display]

    TierCreditsCard --> TierBadge[TierBadge<br/>Tier Icon]
    TierCreditsCard --> CreditDisplay[Credit Display<br/>Remaining Credits]

    MySubmissions --> SubmissionList[Submission List]
    SubmissionList --> SubmissionCard1[Submission Card]
    SubmissionList --> SubmissionCard2[Submission Card]

    UserDecks --> DeckCard1[DeckCard]
    UserDecks --> DeckCard2[DeckCard]

    %% Styling
    classDef page fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef section fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef component fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class ProfilePage page
    class ProfilePanel,TierCreditsCard,MySubmissions,UserDecks,MyDrafts section
    class ProfileEditForm,PatreonStatus,TierBadge,CreditDisplay,SubmissionList,SubmissionCard1,SubmissionCard2,DeckCard1,DeckCard2 component
```

### Admin Dashboard Components

```mermaid
graph TB
    AdminPage[Admin Dashboard<br/>app/admin/page.tsx]

    AdminPage --> AdminTabs[Admin Tabs<br/>Navigation]

    AdminTabs --> DecksTab[Decks Tab]
    AdminTabs --> SubmissionsTab[Submissions Tab]
    AdminTabs --> UsersTab[Users Tab]
    AdminTabs --> ProductsTab[Products Tab]
    AdminTabs --> CreditsTab[Credits Tab]
    AdminTabs --> SettingsTab[Settings Tab]
    AdminTabs --> DocsTab[Docs Tab]

    DecksTab --> DecksList[DecksList<br/>All Decks]
    DecksTab --> ImportButton[ImportAllDecksButton]
    DecksTab --> UpdateButton[UpdateAllDecksButton]

    DecksList --> DeckEditForm[DeckEditForm<br/>Edit Deck]
    DecksList --> DeckImportForm[DeckImportForm<br/>Import Single]

    SubmissionsTab --> PendingSubmissions[PendingSubmissions<br/>Review Queue]
    PendingSubmissions --> SubmissionCard[Submission Card]

    UsersTab --> UserRoleManager[UserRoleManager<br/>Role Management]
    UserRoleManager --> UserList[User List]
    UserList --> RoleSelector[Role Selector]

    ProductsTab --> ProductsPanel[ProductsPanel<br/>Product CRUD]
    ProductsPanel --> ProductForm[Product Form]

    CreditsTab --> CreditMatrix[CreditMatrix<br/>Tier Benefits]
    CreditsTab --> DistributionManager[DistributionManager<br/>Credit Distribution]
    CreditsTab --> CreditList[CreditList<br/>User Credits]

    SettingsTab --> SiteConfigForm[SiteConfigForm<br/>Config Editor]

    DocsTab --> DocumentationView[DocumentationView<br/>API Docs]

    %% Styling
    classDef page fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef tab fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef section fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef component fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class AdminPage page
    class AdminTabs,DecksTab,SubmissionsTab,UsersTab,ProductsTab,CreditsTab,SettingsTab,DocsTab tab
    class DecksList,PendingSubmissions,UserRoleManager,ProductsPanel,CreditMatrix,DistributionManager,CreditList,SiteConfigForm,DocumentationView section
    class ImportButton,UpdateButton,DeckEditForm,DeckImportForm,SubmissionCard,UserList,RoleSelector,ProductForm component
```

## Shared/Reusable Components

```mermaid
graph TB
    subgraph "UI Components - shadcn/ui"
        Button[Button]
        Card[Card]
        Dialog[Dialog]
        Input[Input]
        Select[Select]
        Tabs[Tabs]
        Badge[Badge]
        Avatar[Avatar]
        Dropdown[DropdownMenu]
        Tooltip[Tooltip]
    end

    subgraph "Custom Shared Components"
        DeckCard[DeckCard<br/>Deck Display]
        Commander[Commander<br/>Commander Info]
        CommanderImage[CommanderImage<br/>Card Image]
        ManaSymbols[ManaSymbols<br/>Mana Display]
        TierBadge[TierBadge<br/>Tier Icon]
        CardPreview[CardPreview<br/>Card Hover]
    end

    subgraph "Form Components"
        CommanderDeckForm[CommanderDeckForm<br/>Deck Submission]
        RoastSubmissionForm[RoastSubmissionForm<br/>Roast Request]
        ProfileEditForm2[ProfileEditForm<br/>Profile Update]
        DeckEditForm2[DeckEditForm<br/>Deck Editor]
        DeckImportForm2[DeckImportForm<br/>Deck Import]
        SiteConfigForm2[SiteConfigForm<br/>Config Editor]
    end

    subgraph "Analytics Components"
        ManaCurve2[ManaCurve<br/>CMC Chart]
        ColorDist2[ColorDist<br/>Color Pie]
        Cardtypes2[Cardtypes<br/>Type Chart]
        ManaAnalysisCard2[ManaAnalysisCard<br/>Mana Stats]
        ManaHealthBadge[ManaHealthBadge<br/>Health Indicator]
    end

    subgraph "Auth Components"
        LoginButton2[LoginButton<br/>Login CTA]
        LogoutButton2[LogoutButton<br/>Logout]
        AuthLoadingModal[AuthLoadingModal<br/>Auth State]
    end

    %% Styling
    classDef ui fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef custom fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef form fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef analytics fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef auth fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class Button,Card,Dialog,Input,Select,Tabs,Badge,Avatar,Dropdown,Tooltip ui
    class DeckCard,Commander,CommanderImage,ManaSymbols,TierBadge,CardPreview custom
    class CommanderDeckForm,RoastSubmissionForm,ProfileEditForm2,DeckEditForm2,DeckImportForm2,SiteConfigForm2 form
    class ManaCurve2,ColorDist2,Cardtypes2,ManaAnalysisCard2,ManaHealthBadge analytics
    class LoginButton2,LogoutButton2,AuthLoadingModal auth
```

## Component Type Breakdown

### Server Components (RSC)
- Default in Next.js 16 App Router
- Can fetch data directly
- No client-side interactivity
- Examples: Page components, layout components

**Files:**
- `app/page.tsx`
- `app/decks/page.tsx`
- `app/decks/[id]/page.tsx`
- `app/profile/page.tsx`
- `app/admin/page.tsx`

### Client Components
- Marked with `'use client'` directive
- Can use hooks, state, events
- Required for interactivity
- Examples: Forms, interactive UI

**Files:**
- `components/auth/login-button.tsx`
- `components/forms/CommanderDeckForm.tsx`
- `components/profile/UserMenu.tsx`
- `components/decks/DeckCard.tsx` (with interactions)

### Hybrid Pattern
- Server Component wrapper
- Client Component for interactive parts
- Optimizes performance

**Example:**
```typescript
// Server Component (default)
export default async function DeckPage({ params }) {
  const deck = await fetchDeck(params.id) // Server-side fetch
  return <DeckClientView deck={deck} />
}

// Client Component
'use client'
function DeckClientView({ deck }) {
  // Interactive features
  const [showDetails, setShowDetails] = useState(false)
  return <div>...</div>
}
```

## Component File Organization

```
src/components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/                 # Layout components
│   ├── Header.tsx
│   ├── HeaderWrapper.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── auth/                   # Authentication UI
│   ├── login-button.tsx
│   ├── logout-button.tsx
│   └── auth-loading-modal.tsx
├── decks/                  # Deck-related components
│   ├── DeckCard.tsx
│   ├── Commander.tsx
│   ├── CommanderImage.tsx
│   ├── ManaSymbols.tsx
│   ├── CardPreview.tsx
│   ├── ManaCurve.tsx
│   ├── ColorDist.tsx
│   ├── Cardtypes.tsx
│   └── details/
│       ├── DeckSidebar.tsx
│       ├── DeckStatsView.tsx
│       └── DeckEmptyState.tsx
├── profile/                # Profile components
│   ├── ProfilePanel.tsx
│   ├── ProfileEditForm.tsx
│   ├── TierCreditsCard.tsx
│   ├── UserMenu.tsx
│   ├── MySubmissions.tsx
│   ├── MyDrafts.tsx
│   └── UserDecks.tsx
├── admin/                  # Admin panel components
│   ├── DecksList.tsx
│   ├── ImportAllDecksButton.tsx
│   ├── UpdateAllDecksButton.tsx
│   ├── PendingSubmissions.tsx
│   ├── UserRoleManager.tsx
│   ├── ProductsPanel.tsx
│   ├── CreditMatrix.tsx
│   ├── DistributionManager.tsx
│   ├── CreditList.tsx
│   └── DocumentationView.tsx
├── forms/                  # Form components
│   ├── CommanderDeckForm.tsx
│   ├── RoastSubmissionForm.tsx
│   ├── DeckEditForm.tsx
│   ├── DeckImportForm.tsx
│   └── SiteConfigForm.tsx
├── tier/                   # Tier-related
│   └── TierBadge.tsx
├── home/                   # Home page specific
│   ├── FeaturedVideo.tsx
│   ├── FeaturedDeckCard.tsx
│   ├── RotatingAds.tsx
│   └── SocialMediaLinks.tsx
└── analytics/              # Analytics & charts
    └── mana/
        ├── ManaAnalysisCard.tsx
        └── ManaHealthBadge.tsx
```

## Key Patterns

1. **Server-First**: Default to server components, use client only when needed
2. **Composition**: Small, focused components that compose together
3. **Reusability**: Shared components in common directories
4. **Type Safety**: TypeScript types for all props
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Responsive**: Mobile-first Tailwind CSS
7. **Performance**: Code splitting, lazy loading, memoization where needed
