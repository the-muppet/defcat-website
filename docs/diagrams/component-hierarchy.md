# DefCat DeckVault - Component Hierarchy

## Component Organization

```mermaid
graph TB
    subgraph "Root Layout"
        RootLayout[layout.tsx<br/>Providers + Theme + Nav]
    end

    subgraph "Page Components - app/"
        HomePage[page.tsx<br/>Landing page]
        AboutPage[about/page.tsx]

        subgraph "Deck Pages"
            DecksPage[decks/page.tsx<br/>Deck browser]
            DeckDetailPage[decks/[id]/page.tsx<br/>Single deck view]
            SubmissionPage[decks/submission/page.tsx<br/>Submit deck request]
            RoastPage[decks/roast-submission/page.tsx]
        end

        subgraph "Auth Pages"
            LoginPage[auth/login/page.tsx]
            VerifyPage[auth/verify/page.tsx]
            CallbackPage[auth/callback-success/page.tsx]
        end

        subgraph "Admin Pages"
            AdminDashboard[admin/page.tsx]
            AdminUsers[admin/users/page.tsx]
            AdminDecks[admin/decks/page.tsx]
            AdminProducts[admin/products/page.tsx]
            AdminDatabase[admin/database/page.tsx]
        end

        ProfilePage[profile/page.tsx]
    end

    subgraph "Feature Components - components/"
        subgraph "Auth Components"
            LoginForm[auth/LoginForm.tsx<br/>Client Component]
            PatreonButton[auth/PatreonButton.tsx]
            AuthGuard[auth/AuthGuard.tsx]
        end

        subgraph "Deck Components"
            DeckGrid[decks/DeckGrid.tsx<br/>Deck card grid]
            DeckCard[decks/DeckCard.tsx<br/>Single deck preview]
            DeckDetail[decks/DeckDetail.tsx<br/>Full deck display]
            DeckForm[decks/DeckForm.tsx<br/>Submission form]
            CommanderList[decks/CommanderList.tsx]
            ColorIdentityBadge[decks/ColorIdentityBadge.tsx]
        end

        subgraph "Admin Components"
            UserTable[admin/UserTable.tsx<br/>User management grid]
            DeckTable[admin/DeckTable.tsx<br/>Deck management grid]
            ProductForm[admin/ProductForm.tsx]
            DatabaseQuery[admin/DatabaseQueryTool.tsx]
            ImportDeckForm[admin/ImportDeckForm.tsx]
        end

        subgraph "Profile Components"
            ProfilePanel[profile/ProfilePanel.tsx<br/>User info display]
            SubmissionHistory[profile/SubmissionHistory.tsx]
            TierDisplay[profile/TierDisplay.tsx]
        end

        subgraph "Layout Components"
            Navbar[layout/Navbar.tsx<br/>Top navigation]
            Footer[layout/Footer.tsx]
            Sidebar[layout/Sidebar.tsx<br/>Admin sidebar]
        end

        subgraph "Magic UI Components"
            ManaSymbol[magicui/ManaSymbol.tsx<br/>Renders mana icons]
            CardImage[magicui/CardImage.tsx<br/>MTG card display]
            ColorPill[magicui/ColorPill.tsx<br/>Color identity pills]
            DeckStats[magicui/DeckStats.tsx<br/>CMC curve, colors]
        end
    end

    subgraph "Base UI Components - components/ui/"
        Button[Button.tsx<br/>shadcn/ui]
        Input[Input.tsx]
        Card[Card.tsx]
        Dialog[Dialog.tsx]
        Table[Table.tsx]
        Select[Select.tsx]
        Tabs[Tabs.tsx]
        Badge[Badge.tsx]
        Tooltip[Tooltip.tsx]
    end

    subgraph "Providers & Contexts"
        QueryProvider[QueryClientProvider<br/>TanStack Query]
        ThemeProvider[ThemeProvider<br/>next-themes]
        AuthContext[AuthContext<br/>User session]
    end

    RootLayout --> QueryProvider
    RootLayout --> ThemeProvider
    RootLayout --> AuthContext
    RootLayout --> Navbar

    HomePage --> DeckGrid
    DecksPage --> DeckGrid
    DeckDetailPage --> DeckDetail

    DeckGrid --> DeckCard
    DeckCard --> ColorIdentityBadge
    DeckCard --> ManaSymbol
    DeckCard --> Card

    DeckDetail --> CommanderList
    DeckDetail --> CardImage
    DeckDetail --> DeckStats
    DeckDetail --> ColorPill

    SubmissionPage --> DeckForm
    DeckForm --> Input
    DeckForm --> Select
    DeckForm --> Button

    LoginPage --> LoginForm
    LoginForm --> PatreonButton
    PatreonButton --> Button

    AdminDashboard --> Sidebar
    AdminUsers --> UserTable
    UserTable --> Table
    UserTable --> Dialog

    AdminDecks --> DeckTable
    AdminDecks --> ImportDeckForm
    DeckTable --> Table
    DeckTable --> Badge

    ProfilePage --> ProfilePanel
    ProfilePanel --> TierDisplay
    ProfilePanel --> SubmissionHistory

    ManaSymbol -.-> |uses Mana Font| Button
    ColorPill --> Badge

    style RootLayout fill:#e3f2fd
    style QueryProvider fill:#c8e6c9
    style ThemeProvider fill:#c8e6c9
    style AuthContext fill:#c8e6c9

    style HomePage fill:#fff9c4
    style DecksPage fill:#fff9c4
    style AdminDashboard fill:#ffccbc

    style DeckGrid fill:#e1bee7
    style DeckCard fill:#e1bee7
    style DeckDetail fill:#e1bee7

    style Button fill:#f8bbd0
    style Input fill:#f8bbd0
    style Card fill:#f8bbd0
```

## Component Categories

### 1. Layout Components
**Purpose**: Application-wide structure and navigation

- **RootLayout** (`app/layout.tsx`)
  - Server Component
  - Wraps entire app
  - Provides global providers
  - Loads Mana Font

- **Navbar** (`components/layout/Navbar.tsx`)
  - Client Component (interactive)
  - Conditional rendering based on auth state
  - Mobile responsive hamburger menu

- **Footer** (`components/layout/Footer.tsx`)
  - Server Component
  - Static content

- **Sidebar** (`components/layout/Sidebar.tsx`)
  - Client Component
  - Admin-only navigation

---

### 2. Page Components
**Purpose**: Route-level components (App Router)

**Convention**:
- `page.tsx` = route component
- `loading.tsx` = loading state
- `error.tsx` = error boundary

**Types**:
- **Server Components** (default): Data fetching, SEO
- **Client Components** (`'use client'`): Interactivity

---

### 3. Feature Components
**Purpose**: Domain-specific business logic

#### Auth Components
- **LoginForm**: Patreon OAuth initiation
- **AuthGuard**: Route protection HOC
- **PatreonButton**: Branded OAuth button

#### Deck Components
- **DeckGrid**: Responsive deck card grid
- **DeckCard**: Preview card with hover effects
- **DeckDetail**: Full deck view with card list
- **DeckForm**: Multi-step submission form
- **CommanderList**: Commander card display
- **ColorIdentityBadge**: WUBRG color pills

#### Admin Components
- **UserTable**: User management with inline editing
- **DeckTable**: Deck moderation queue
- **ProductForm**: Tier configuration
- **ImportDeckForm**: Moxfield import interface
- **DatabaseQueryTool**: Raw SQL executor

#### Profile Components
- **ProfilePanel**: User info and settings
- **SubmissionHistory**: Past deck requests
- **TierDisplay**: Current Patreon tier badge

---

### 4. Magic UI Components
**Purpose**: MTG-specific visual elements

- **ManaSymbol** (`magicui/ManaSymbol.tsx`)
  - Renders `{W}{U}{B}{R}{G}` as icons
  - Uses Mana Font library
  - Props: `symbol: string, size?: 'sm' | 'md' | 'lg'`

- **CardImage** (`magicui/CardImage.tsx`)
  - Lazy-loaded card images
  - Scryfall image proxy
  - Hover zoom effect

- **ColorPill** (`magicui/ColorPill.tsx`)
  - Color identity badges
  - WUBRG color coding
  - Interactive filters

- **DeckStats** (`magicui/DeckStats.tsx`)
  - CMC curve chart
  - Color distribution pie chart
  - Card type breakdown

---

### 5. Base UI Components
**Purpose**: Reusable primitives (shadcn/ui pattern)

Built on **Radix UI** primitives:
- Accessible by default
- Keyboard navigation
- Focus management
- ARIA attributes

**Common Components**:
- Button, Input, Select, Checkbox
- Dialog, Sheet, Popover, Tooltip
- Card, Badge, Avatar, Separator
- Table, Tabs, Accordion

**Usage Pattern**:
```tsx
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

<Button variant="primary" size="lg" className={cn('custom-class')}>
  Click me
</Button>
```

---

## Component Communication Patterns

### 1. Props Drilling (Shallow Hierarchies)
```
DeckGrid → DeckCard → ColorIdentityBadge
         ↓ decks prop
```

### 2. React Context (Cross-Cutting Concerns)
```
AuthContext provides user session
  → Navbar consumes
  → ProfilePanel consumes
  → AuthGuard consumes
```

### 3. TanStack Query (Server State)
```
useQuery('decks') in DeckGrid
useQuery('deck', id) in DeckDetail
useMutation('submit-deck') in DeckForm
```

### 4. URL State (Filters & Pagination)
```
useSearchParams() in DeckGrid
  → Color filter in URL: /decks?color=WU
  → Page in URL: /decks?page=2
```

---

## Component Types by Rendering

### Server Components (Default)
- Initial page load
- SEO-optimized
- Direct database access
- No JavaScript sent to client

**Examples**:
- `app/decks/page.tsx`
- `app/admin/page.tsx`
- `components/layout/Footer.tsx`

### Client Components (`'use client'`)
- Interactive UI
- Event handlers
- Browser APIs
- React hooks (useState, useEffect)

**Examples**:
- `components/auth/LoginForm.tsx`
- `components/decks/DeckForm.tsx`
- `components/admin/UserTable.tsx`

---

## Styling Approach

### Tailwind CSS Utilities
```tsx
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">
  <Badge variant="outline">Commander</Badge>
</div>
```

### CSS Variables (Theme)
```css
:root {
  --primary: 222 47% 11%;
  --mana-white: #f0f2c0;
  --mana-blue: #0e68ab;
  --mana-black: #150b00;
  --mana-red: #d3202a;
  --mana-green: #00733e;
}
```

### Class Merging with `cn()`
```tsx
import { cn } from '@/lib/utils'

<Button className={cn(
  'base-styles',
  isActive && 'active-styles',
  props.className
)} />
```

---

## Component Testing Strategy

### Unit Tests (Vitest + React Testing Library)
```typescript
describe('DeckCard', () => {
  it('renders commander names', () => {
    render(<DeckCard deck={mockDeck} />)
    expect(screen.getByText('Atraxa')).toBeInTheDocument()
  })
})
```

### Integration Tests
```typescript
describe('DeckForm submission', () => {
  it('submits deck and shows confirmation', async () => {
    render(<DeckForm />)
    await userEvent.type(screen.getByLabelText('Deck Name'), 'My Deck')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByText('Success')).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright - Planned)
```typescript
test('user can submit deck request', async ({ page }) => {
  await page.goto('/decks/submission')
  await page.fill('[name="deckName"]', 'Test Deck')
  await page.click('button[type="submit"]')
  await expect(page.locator('.success-message')).toBeVisible()
})
```

---

## Component Performance Optimization

### 1. Code Splitting
```tsx
import dynamic from 'next/dynamic'

const DeckDetail = dynamic(() => import('./DeckDetail'), {
  loading: () => <DeckSkeleton />,
  ssr: false // Client-only component
})
```

### 2. React.memo for Expensive Components
```tsx
export const DeckCard = memo(function DeckCard({ deck }: Props) {
  // Expensive rendering logic
}, (prev, next) => prev.deck.id === next.deck.id)
```

### 3. Virtual Scrolling (Planned)
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

// For long deck lists
const virtualizer = useVirtualizer({
  count: decks.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200
})
```

### 4. Image Optimization
```tsx
import Image from 'next/image'

<Image
  src={card.image_url}
  alt={card.name}
  width={200}
  height={280}
  loading="lazy"
  placeholder="blur"
/>
```

---

## Component Documentation

Each feature component should include:
```tsx
/**
 * DeckCard - Preview card for a Commander deck
 *
 * @example
 * <DeckCard
 *   deck={deck}
 *   onClick={() => router.push(`/decks/${deck.id}`)}
 * />
 */
export function DeckCard({ deck, onClick }: DeckCardProps) {
  // Implementation
}
```

---

## Future Component Architecture

1. **Compound Components** for complex forms
2. **Headless UI** abstractions for reusability
3. **Storybook** for component documentation
4. **Chromatic** for visual regression testing
5. **Component library** package for multi-app reuse
