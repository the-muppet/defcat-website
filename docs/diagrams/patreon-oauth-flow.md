# Patreon OAuth Integration Flow

This diagram shows the complete Patreon OAuth authentication flow and tier synchronization process.

## Complete OAuth Flow Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant App as Next.js App
    participant PatreonRoute as /auth/patreon
    participant Patreon as Patreon OAuth
    participant Callback as /auth/patreon-callback
    participant PatreonAPI as Patreon API
    participant AdminClient as Admin Supabase Client
    participant SupabaseAuth as Supabase Auth
    participant DB as PostgreSQL
    participant Success as /auth/callback-success

    User->>Browser: Click "Login with Patreon"
    Browser->>+PatreonRoute: GET /auth/patreon

    PatreonRoute->>PatreonRoute: Determine redirect_uri<br/>(localhost vs production)
    PatreonRoute->>PatreonRoute: Build OAuth URL<br/>scope: identity identity[email]<br/>identity.memberships

    PatreonRoute-->>-Browser: 303 Redirect to Patreon
    Browser->>+Patreon: OAuth Authorization Request

    Patreon->>User: Show Authorization Page
    User->>Patreon: Approve Access
    Patreon-->>-Browser: 302 Redirect with code<br/>?code=OAUTH_CODE

    Browser->>+Callback: GET /auth/patreon-callback<br/>?code=OAUTH_CODE

    Callback->>Callback: Validate code exists
    Callback->>Callback: Determine redirect_uri<br/>(must match initial request)

    Callback->>+PatreonAPI: POST /api/oauth2/token<br/>Exchange code for access_token
    PatreonAPI-->>-Callback: access_token

    Callback->>+PatreonAPI: GET /api/oauth2/v2/identity<br/>?include=memberships<br/>Authorization: Bearer {token}
    PatreonAPI-->>-Callback: User data + Membership data

    Callback->>Callback: Extract patreonId<br/>Extract email, full_name<br/>Find active membership

    Callback->>Callback: determineTier(pledge_amount_cents)<br/>$250+ = ArchMage<br/>$165+ = Wizard<br/>$50+ = Duke<br/>$30+ = Emissary<br/>$10+ = Knight<br/>$2+ = Citizen

    Callback->>+AdminClient: Create Admin Client<br/>(Service Role)

    Callback->>+SupabaseAuth: admin.createUser({<br/>  email,<br/>  email_confirm: true,<br/>  user_metadata: {patreon_id}<br/>})

    alt User Already Exists
        SupabaseAuth-->>Callback: Error: User exists
        Callback->>+SupabaseAuth: admin.listUsers()
        SupabaseAuth-->>-Callback: Users list
        Callback->>Callback: Find user by email
        Callback->>Callback: userId = existingUser.id
    else New User
        SupabaseAuth-->>-Callback: New user created
        Callback->>Callback: userId = newUser.id
    end

    Callback->>+DB: SELECT role FROM profiles<br/>WHERE id = userId
    DB-->>-Callback: Existing role (if any)

    Callback->>Callback: Determine final role<br/>Site owner? → admin<br/>Else → existing role or 'user'

    Callback->>+DB: UPSERT profiles<br/>  id: userId<br/>  email<br/>  patreon_id<br/>  patreon_tier<br/>  role
    DB-->>-Callback: Profile updated

    Callback->>Callback: Generate random password<br/>patreon_{userId}_{timestamp}_{random}

    Callback->>+SupabaseAuth: admin.updateUserById<br/>  userId<br/>  password: generatedPassword
    SupabaseAuth-->>-Callback: Password set

    Callback->>+SupabaseAuth: signInWithPassword<br/>  email<br/>  password: generatedPassword
    SupabaseAuth-->>-Callback: Session tokens<br/>(access_token, refresh_token)

    Callback-->>-Browser: 302 Redirect<br/>/auth/callback-success<br/>#access_token={token}&refresh_token={token}

    Browser->>+Success: GET /auth/callback-success<br/>(with hash tokens)

    Success->>Success: Parse tokens from URL hash
    Success->>Success: setSession({access_token, refresh_token})

    Success->>Success: Store session in browser
    Success-->>-Browser: Show success page<br/>Auto-redirect to /profile

    Browser->>App: Navigate to /profile
    App->>App: Session active<br/>User authenticated

    Note over User,App: User is now logged in<br/>with Patreon tier synchronized
```

## Tier Determination Logic

```mermaid
flowchart TD
    Start[Pledge Amount in Cents] --> Check250{>= 25000<br/>$250?}
    Check250 -->|Yes| ArchMage[ArchMage Tier<br/>Highest Tier]
    Check250 -->|No| Check165{>= 16500<br/>$165?}

    Check165 -->|Yes| Wizard[Wizard Tier]
    Check165 -->|No| Check50{>= 5000<br/>$50?}

    Check50 -->|Yes| Duke[Duke Tier]
    Check50 -->|No| Check30{>= 3000<br/>$30?}

    Check30 -->|Yes| Emissary[Emissary Tier]
    Check30 -->|No| Check10{>= 1000<br/>$10?}

    Check10 -->|Yes| Knight[Knight Tier]
    Check10 -->|No| Citizen[Citizen Tier<br/>Default/Minimum]

    ArchMage --> Return[Return Tier]
    Wizard --> Return
    Duke --> Return
    Emissary --> Return
    Knight --> Return
    Citizen --> Return

    %% Styling
    classDef highest fill:#ffebee,stroke:#c62828,stroke-width:3px
    classDef high fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef medium fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef low fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef base fill:#e3f2fd,stroke:#1976d2,stroke-width:2px

    class ArchMage highest
    class Wizard high
    class Duke medium
    class Emissary low
    class Knight,Citizen base
```

## Tier Benefits & Credits

```mermaid
graph LR
    subgraph "Patreon Tiers"
        Citizen[Citizen<br/>$2+/month]
        Knight[Knight<br/>$10+/month]
        Emissary[Emissary<br/>$30+/month]
        Duke[Duke<br/>$50+/month]
        Wizard[Wizard<br/>$165+/month]
        ArchMage[ArchMage<br/>$250+/month]
    end

    subgraph "Monthly Credits"
        C0[No submissions]
        C1[1 submission/month]
        C2[2 submissions/month]
        C3[3 submissions/month]
    end

    subgraph "Credit Types"
        Deck[Deck Submission Credits]
        Roast[Roast Request Credits]
    end

    Citizen --> C0
    Knight --> C0
    Emissary --> C0
    Duke --> C1
    Wizard --> C2
    ArchMage --> C3

    C1 --> Deck
    C1 --> Roast
    C2 --> Deck
    C2 --> Roast
    C3 --> Deck
    C3 --> Roast

    %% Styling
    classDef tier1 fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef tier2 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef tier3 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef tier4 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef tier5 fill:#ffebee,stroke:#c62828,stroke-width:3px

    class Citizen,Knight,Emissary tier1
    class Duke tier2
    class Wizard tier3
    class ArchMage tier4
```

## Profile Update Flow

```mermaid
flowchart TD
    Start[Patreon Data Retrieved] --> CheckExists{Profile<br/>Exists?}

    CheckExists -->|Yes| GetExistingRole[Fetch Existing Role<br/>from profiles]
    CheckExists -->|No| NewUser[New User<br/>role = 'user']

    GetExistingRole --> CheckSiteOwner{Is Site<br/>Owner Email?}
    NewUser --> CheckSiteOwner

    CheckSiteOwner -->|Yes| SetAdmin[role = 'admin'<br/>patreon_tier = 'ArchMage'<br/>patreon_id = null]
    CheckSiteOwner -->|No| KeepRole[Keep Existing Role<br/>Update Patreon Data]

    SetAdmin --> Upsert[UPSERT profiles<br/>  id<br/>  email<br/>  patreon_id<br/>  patreon_tier<br/>  role<br/>  updated_at]

    KeepRole --> Upsert

    Upsert --> InitCredits[Initialize User Credits<br/>refresh_user_credits<br/>p_user_id<br/>p_patreon_tier]

    InitCredits --> Complete[Profile Synchronized]

    %% Styling
    classDef success fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class Complete success
    class GetExistingRole,NewUser,SetAdmin,KeepRole,Upsert,InitCredits process
    class CheckExists,CheckSiteOwner decision
```

## Error Handling

```mermaid
flowchart TD
    Start[OAuth Callback] --> ValidateCode{Code<br/>Present?}

    ValidateCode -->|No| Error1[Redirect<br/>/auth/login?error=no_code]
    ValidateCode -->|Yes| ExchangeToken[Exchange Code for Token]

    ExchangeToken --> TokenSuccess{Token<br/>Retrieved?}
    TokenSuccess -->|No| Error2[Redirect<br/>/auth/login?error=callback_failed]
    TokenSuccess -->|Yes| FetchMembership[Fetch Patreon Membership]

    FetchMembership --> MembershipSuccess{Membership<br/>Data Valid?}
    MembershipSuccess -->|No| Error3[Redirect<br/>/auth/login?error=callback_failed]
    MembershipSuccess -->|Yes| GetEmail[Extract Email]

    GetEmail --> EmailExists{Email<br/>Present?}
    EmailExists -->|No| Error4[Redirect<br/>/auth/login?error=no_email]
    EmailExists -->|Yes| CreateUser[Create/Find User]

    CreateUser --> UserSuccess{User<br/>Found/Created?}
    UserSuccess -->|No| Error5[Redirect<br/>/auth/login?error=user_creation_failed]
    UserSuccess -->|Yes| UpdateProfile[Update Profile]

    UpdateProfile --> ProfileSuccess{Profile<br/>Updated?}
    ProfileSuccess -->|No| Error6[Redirect<br/>/auth/login?error=profile_update_failed]
    ProfileSuccess -->|Yes| SetPassword[Set Random Password]

    SetPassword --> PasswordSuccess{Password<br/>Set?}
    PasswordSuccess -->|No| Error7[Redirect<br/>/auth/login?error=password_setup_failed]
    PasswordSuccess -->|Yes| SignIn[Sign In User]

    SignIn --> SignInSuccess{Session<br/>Created?}
    SignInSuccess -->|No| Error8[Redirect<br/>/auth/login?error=signin_failed]
    SignInSuccess -->|Yes| Success[Redirect to Success Page<br/>with Tokens]

    %% Styling
    classDef success fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class Success success
    class Error1,Error2,Error3,Error4,Error5,Error6,Error7,Error8 error
    class ExchangeToken,FetchMembership,GetEmail,CreateUser,UpdateProfile,SetPassword,SignIn process
    class ValidateCode,TokenSuccess,MembershipSuccess,EmailExists,UserSuccess,ProfileSuccess,PasswordSuccess,SignInSuccess decision
```

## Key Implementation Details

### OAuth Scopes Required
- `identity`: Basic Patreon user info
- `identity[email]`: User email address
- `identity.memberships`: Active memberships and pledge amounts

### Environment Variables
```bash
PATREON_CLIENT_ID=your_client_id
PATREON_CLIENT_SECRET=your_client_secret
PATREON_REDIRECT_URI=https://yoursite.com/auth/patreon-callback
```

### Redirect URI Handling
- **Development**: Uses dynamic origin (localhost)
- **Production**: Uses configured `PATREON_REDIRECT_URI`
- **Critical**: Redirect URI must match exactly between init and callback

### Special Cases
1. **Site Owner**: Auto-assigned admin role with ArchMage tier
2. **Existing Users**: Role preserved, only Patreon data updated
3. **Failed OAuth**: All errors redirect to login with error codes

### Security Features
1. **Random Password**: Users never know their password (OAuth only)
2. **Email Confirmation**: Auto-confirmed via OAuth
3. **Admin Client**: Used to bypass RLS for user creation
4. **Session Tokens**: Passed via URL hash (not query params) for security
