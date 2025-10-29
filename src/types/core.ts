// Database Types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// User & Auth Types
export interface User {
  id: string
  email: string
  patreonId?: string
  patreonTier?: PatreonTier
  moxfieldId?: string
  role: UserRole
}

export interface Profile {
  patreon_id: string
  patreon_tier: string
  role: UserRole
}

export type CreditType = {
  id: string
  display_name: string
  description: string | null
  is_active: boolean
}

export type Tier = {
  id: string
  display_name: string
  sort_order: number
  is_active: boolean
}

export type UserCredits = {
  user_id: string
  credits: Record<string, number> // Dynamic based on credit_types
  last_granted: Record<string, string>
  created_at: string
  updated_at: string
}

export type PatreonTier = 'Citizen' | 'Knight' | 'Emissary' | 'Duke' | 'Wizard' | 'ArchMage'

export const PATREON_TIERS: PatreonTier[] = [
  'Citizen',
  'Knight',
  'Emissary',
  'Duke',
  'Wizard',
  'ArchMage',
]

export type UserRole = 'user' | 'member' | 'admin' | 'moderator' | 'developer'

export interface Session {
  user: User
  accessToken: string
  expiresAt: number
}

// Deck Types
export interface Deck {
  id: string
  moxfield_id: string
  moxfield_url: string | null
  name: string
  commanders: string[] | null
  color_identity: string[] | null
  format: string | null
  description?: string | null
  view_count?: number | null
  like_count?: number | null
  comment_count?: number | null
  set_codes?: string[] | null
  bracket?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DeckFilters {
  commanders?: string[]
  colors?: string[]
  archetype?: string
  search?: string
}

// Moxfield API Types
export interface MoxfieldDeck {
  publicId: string
  name: string
  description: string
  format: string
  commanders: MoxfieldCard[]
  mainboard: Record<string, MoxfieldCard>
  createdByUser: {
    userName: string
    profileImageUrl: string
  }
}

export interface MoxfieldCard {
  quantity: number
  boardType: string
  useCmcOverride: boolean
  useManaCostOverride: boolean
  useColorIdentityOverride: boolean
  card: {
    id: string
    name: string
    set: string
    cn: string
    image: string
    colors: string[]
    colorIdentity: string[]
    cmc: number
    type: string
    rarity: string
  }
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

export interface ApiError {
  message: string
  code: string
  details?: unknown
}

export interface DeckCard {
  quantity: number
  board: string
  cards: {
    name: string
    mana_cost: string | null
    type_line: string | null
    cmc: number | null
    image_url: string | null
    scryfall_id: string | null
    cached_image_url: string | null
  } | null
}

export const bracketOptions = [
  { value: 'bracket1', label: 'Bracket 1', description: 'Casual, precon level' },
  { value: 'bracket2', label: 'Bracket 2', description: 'Focused casual' },
  { value: 'bracket3', label: 'Bracket 3', description: 'Optimized casual' },
  { value: 'bracket4', label: 'Bracket 4', description: 'High power' },
  { value: 'bracket5', label: 'Bracket 5', description: 'Fringe competitive' },
  { value: 'cedh', label: 'cEDH', description: 'Perfect tournament optimized deck' },
  { value: 'wild', label: 'GO WILD', description: "I DON'T CARE GO FOR IT DEFCAT" },
]

export type ScryfallImageSize = 'png' | 'art' | 'lg' | 'md' | 'sm'

export type cardFace = 'front' | 'back'
