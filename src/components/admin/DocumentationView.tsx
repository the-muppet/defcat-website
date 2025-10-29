'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Database,
  Network,
  Layers,
  GitBranch,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import mermaid from 'mermaid'

export function DocumentationView() {
  const [activeTab, setActiveTab] = useState('architecture')
  const [mermaidInitialized, setMermaidInitialized] = useState(false)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#3ecf8e',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7C0000',
        lineColor: '#F8B229',
        secondaryColor: '#006100',
        tertiaryColor: '#fff'
      }
    })
    setMermaidInitialized(true)
  }, [])

  useEffect(() => {
    if (mermaidInitialized) {
      mermaid.contentLoaded()
    }
  }, [activeTab, mermaidInitialized])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-tinted">
          <TabsTrigger value="architecture" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Architecture</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Components</span>
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Data Flows</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-6 mt-6">
          <Card className="card-tinted border-tinted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                System Architecture
              </CardTitle>
              <CardDescription>
                Complete system overview with all layers and external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  The DefCat DeckVault application follows a layered architecture pattern with
                  clear separation of concerns:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  <li>
                    <strong>Presentation Layer</strong>: Next.js App Router pages with Server and
                    Client Components
                  </li>
                  <li>
                    <strong>API Layer</strong>: RESTful API routes with type-safe responses
                  </li>
                  <li>
                    <strong>Business Logic Layer</strong>: Three-tier Supabase client architecture
                  </li>
                  <li>
                    <strong>Data Layer</strong>: PostgreSQL with Row-Level Security policies
                  </li>
                  <li>
                    <strong>External Services</strong>: Patreon OAuth, Moxfield API, Scryfall API
                  </li>
                </ul>
              </div>

              <div className="mermaid-container bg-card/50 p-6 rounded-lg border border-border overflow-x-auto">
                <pre className="mermaid">
{`graph TB
    subgraph "External Services"
        Patreon[Patreon OAuth API]
        Moxfield[Moxfield API]
        Scryfall[Scryfall API]
        Resend[Resend Email]
    end

    subgraph "Presentation Layer"
        Pages[Next.js Pages<br/>App Router]
        Components[React Components]
    end

    subgraph "API Layer"
        PublicAPI[Public APIs<br/>health, metrics]
        AuthAPI[Auth APIs<br/>OAuth]
        UserAPI[User APIs<br/>submissions]
        AdminAPI[Admin APIs<br/>management]
    end

    subgraph "Business Logic"
        AuthLib[Auth Module]
        BrowserClient[Browser Client<br/>Anon Key]
        ServerClient[Server Client<br/>Full Access]
        AdminClient[Admin Client<br/>Service Role]
        Integrations[External Integrations]
    end

    subgraph "Data Layer"
        DB[(Supabase<br/>PostgreSQL)]
        Storage[(Supabase<br/>Storage)]
    end

    Pages --> Components
    Pages --> PublicAPI
    Pages --> AuthAPI
    Components --> UserAPI

    AuthAPI --> AuthLib
    AuthLib --> Patreon
    UserAPI --> ServerClient
    AdminAPI --> AdminClient

    BrowserClient --> DB
    ServerClient --> DB
    AdminClient --> DB

    Integrations --> Moxfield
    Integrations --> Scryfall
    Integrations --> Resend

    style Patreon fill:#f96854
    style Moxfield fill:#e8711a
    style Scryfall fill:#4a90e2
    style BrowserClient fill:#3ecf8e
    style ServerClient fill:#3ecf8e
    style AdminClient fill:#e74c3c
    style DB fill:#f39c12`}
                </pre>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-tinted"
                  asChild
                >
                  <a
                    href="https://mermaid.live"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edit in Mermaid Live
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-tinted border-tinted">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Architecture Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Three-Tier Data Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Browser (public) → Server (authenticated) → Admin (privileged)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Server-First Rendering</h4>
                    <p className="text-sm text-muted-foreground">
                      Server Components for data fetching, Client Components for interactivity
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Type-Safe End-to-End</h4>
                    <p className="text-sm text-muted-foreground">
                      TypeScript from database schema to UI components
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6 mt-6">
          <Card className="card-tinted border-tinted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Schema
              </CardTitle>
              <CardDescription>
                Entity relationship diagram with all tables and relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  The database schema includes 7 core tables with Row-Level Security policies:
                </p>
              </div>

              <div className="mermaid-container bg-card/50 p-6 rounded-lg border border-border overflow-x-auto">
                <pre className="mermaid">
{`erDiagram
    profiles ||--o{ deck_submissions : "submits"
    profiles {
        uuid id PK
        string patreon_id UK
        string email
        string full_name
        uuid tier_id FK
        string role
        timestamp created_at
    }

    products ||--o{ profiles : "has tier"
    products {
        uuid id PK
        string patreon_product_id UK
        string name
        int deck_request_limit
        int priority_level
        boolean is_active
    }

    decks ||--o{ deck_cards : "contains"
    decks {
        uuid id PK
        string name
        text_array commanders
        string color_identity
        int view_count
        boolean is_public
        timestamp created_at
    }

    cards ||--o{ deck_cards : "used in"
    cards {
        uuid id PK
        string name UK
        string scryfall_id UK
        text_array color_identity
        string image_url
        timestamp created_at
    }

    deck_cards {
        uuid id PK
        uuid deck_id FK
        uuid card_id FK
        int quantity
        string category
    }

    deck_submissions {
        uuid id PK
        uuid user_id FK
        string status
        string deck_name
        text_array commanders
        timestamp submitted_at
    }

    profiles ||--o{ decks : "creates"`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-tinted border-tinted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Core Tables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• profiles - User accounts</li>
                      <li>• products - Patreon tiers</li>
                      <li>• decks - Deck metadata</li>
                      <li>• cards - MTG card cache</li>
                      <li>• deck_cards - Join table</li>
                      <li>• deck_submissions - Requests</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-tinted border-tinted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Row-Level Security (RLS)</li>
                      <li>• Foreign key constraints</li>
                      <li>• Unique constraints</li>
                      <li>• Check constraints</li>
                      <li>• Indexed columns</li>
                      <li>• Audit trails</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6 mt-6">
          <Card className="card-tinted border-tinted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Component Hierarchy
              </CardTitle>
              <CardDescription>
                React component organization and dependency graph
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  Components are organized by feature with clear separation between Server and
                  Client Components:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-tinted border-tinted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Layout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Navigation</li>
                      <li>• Header</li>
                      <li>• Footer</li>
                      <li>• Providers</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-tinted border-tinted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Auth Components</li>
                      <li>• Deck Components</li>
                      <li>• Admin Components</li>
                      <li>• Profile Components</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-tinted border-tinted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Base UI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• shadcn/ui primitives</li>
                      <li>• Radix UI</li>
                      <li>• Magic UI (MTG)</li>
                      <li>• Custom components</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mermaid-container bg-card/50 p-6 rounded-lg border border-border overflow-x-auto">
                <pre className="mermaid">
{`graph TB
    subgraph "Pages"
        Home[Home Page]
        Decks[Decks Page]
        Admin[Admin Dashboard]
    end

    subgraph "Feature Components"
        DeckGrid[DeckGrid]
        DeckCard[DeckCard]
        DeckDetail[DeckDetail]
        UserTable[UserTable]
    end

    subgraph "Base UI"
        Button[Button]
        Card[Card]
        Table[Table]
        Dialog[Dialog]
    end

    subgraph "Magic UI"
        ManaSymbol[ManaSymbol]
        ColorPill[ColorPill]
        CardImage[CardImage]
    end

    Home --> DeckGrid
    Decks --> DeckGrid
    DeckGrid --> DeckCard
    DeckCard --> Card
    DeckCard --> ManaSymbol
    DeckCard --> ColorPill
    DeckDetail --> CardImage
    Admin --> UserTable
    UserTable --> Table
    UserTable --> Dialog

    style Home fill:#e3f2fd
    style Decks fill:#e3f2fd
    style Admin fill:#ffebee
    style DeckGrid fill:#e1bee7
    style DeckCard fill:#e1bee7
    style Button fill:#f8bbd0
    style Card fill:#f8bbd0`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6 mt-6">
          <Card className="card-tinted border-tinted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Data Flow Diagrams
              </CardTitle>
              <CardDescription>
                Key user journeys and sequence diagrams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Authentication Flow</h3>
                <div className="mermaid-container bg-card/50 p-6 rounded-lg border border-border overflow-x-auto">
                  <pre className="mermaid">
{`sequenceDiagram
    participant User
    participant App
    participant Patreon
    participant DB

    User->>App: Click "Login"
    App->>Patreon: OAuth Request
    Patreon->>User: Login Prompt
    User->>Patreon: Approve
    Patreon->>App: Callback + Code
    App->>Patreon: Exchange Token
    Patreon->>App: Access Token
    App->>Patreon: Get User Data
    Patreon->>App: User + Tier
    App->>DB: Upsert Profile
    DB->>App: Profile Saved
    App->>User: Redirect to Dashboard`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Deck Submission Flow</h3>
                <div className="mermaid-container bg-card/50 p-6 rounded-lg border border-border overflow-x-auto">
                  <pre className="mermaid">
{`sequenceDiagram
    participant User
    participant Form
    participant API
    participant DB
    participant Email

    User->>Form: Fill Form
    Form->>API: POST /api/submit-deck
    API->>DB: Check Tier Limit
    DB->>API: Within Limit
    API->>DB: Create Submission
    DB->>API: Created
    API->>Email: Send Confirmation
    Email-->>User: Email Delivered
    API->>Form: Success Response
    Form->>User: Show Success`}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-tinted border-tinted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Caching Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• TanStack Query</li>
                      <li>• 5-minute stale time</li>
                      <li>• 10-minute gc time</li>
                      <li>• Optimistic updates</li>
                      <li>• Smart invalidation</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-tinted border-tinted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Error Handling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Type-safe errors</li>
                      <li>• Automatic retries</li>
                      <li>• Exponential backoff</li>
                      <li>• User feedback</li>
                      <li>• Error boundaries</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="card-tinted border-tinted">
        <CardHeader>
          <CardTitle className="text-sm">Full Documentation</CardTitle>
          <CardDescription>
            Detailed markdown files available in the repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <span>docs/diagrams/system-architecture.md</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <span>docs/diagrams/database-schema.md</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <span>docs/diagrams/component-hierarchy.md</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <span>docs/diagrams/data-flows.md</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
