import { Database } from './supabase/generated'

export type Deck = Database['public']['Tables']['moxfield_decks']['Row']
export type DeckInsert = Database['public']['Tables']['moxfield_decks']['Insert']
export type DeckUpdate = Database['public']['Tables']['moxfield_decks']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Card = Database['public']['Tables']['cards']['Row']
export type CardInsert = Database['public']['Tables']['cards']['Insert']
export type CardUpdate = Database['public']['Tables']['cards']['Update']

export type DecklistCard = Database['public']['Tables']['decklist_cards']['Row']
export type DecklistCardInsert = Database['public']['Tables']['decklist_cards']['Insert']
export type DecklistCardUpdate = Database['public']['Tables']['decklist_cards']['Update']

export type CreditType = Database['public']['Tables']['credit_types']['Row']
export type Tier = Database['public']['Tables']['tiers']['Row']
export type UserCredits = Database['public']['Tables']['user_credits']['Row']

export type _DeckSubmission = Database['public']['Tables']['deck_submissions']['Row']
export type DeckSubmissionInsert = Database['public']['Tables']['deck_submissions']['Insert']
export type DeckSubmissionUpdate = Database['public']['Tables']['deck_submissions']['Update']

// Database Views
export type DeckInfo = Database['public']['Views']['mox_decks']['Row']
export type FullCard = Database['public']['Views']['deck_list_view']['Row']

// JSON type from database
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]


export type DeckWithCards = Deck & {
  decklist_cards: (DecklistCard & {
    cards: Card
  })[]
}

export type DecklistCardWithCard = DecklistCard & {
  cards: Card | null
}

export type FullDeck = Deck & {
  commanders: DecklistCardWithCard[]
  mainboard: DecklistCardWithCard[]
  sideboard: DecklistCardWithCard[]
}

// Helper for joined deck card data
export interface DeckCard {
  quantity: number
  board: string
  cards: {
    name: string
    mana_cost: string | null
    type_line: string | null
    cmc: number | null
    scryfall_id: string | null
    cached_image_url: string | null
  } | null
}

export interface User {
  id: string
  email: string
  patreonId?: string
  patreonTier?: PatreonTier
  moxfieldId?: string
  role: UserRole
}

export interface Session {
  user: User
  accessToken: string
  expiresAt: number
}

export interface DeckFilters {
  commanders?: string[]
  colors?: string[]
  archetype?: string
  search?: string
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

export const TIER_RANKS: Record<PatreonTier, number> = {
  Citizen: 0,
  Knight: 1,
  Emissary: 2,
  Duke: 3,
  Wizard: 4,
  ArchMage: 5,
}

export type UserRole = 'user' | 'member' | 'admin' | 'moderator' | 'developer'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  member: 1,
  moderator: 2,
  admin: 3,
  developer: 4,
}

export const bracketOptions = [
  { value: 'bracket1', label: 'Bracket 1', description: 'Casual, precon level' },
  { value: 'bracket2', label: 'Bracket 2', description: 'Focused casual' },
  { value: 'bracket3', label: 'Bracket 3', description: 'Optimized casual' },
  { value: 'bracket4', label: 'Bracket 4', description: 'High power' },
  { value: 'bracket5', label: 'Bracket 5', description: 'Fringe competitive' },
] as const

export const defCatBracketOptions = [
  { value: 'bracket1', label: 'Bracket 1', description: 'Casual, precon level' },
  { value: 'bracket2', label: 'Bracket 2', description: 'Focused casual' },
  { value: 'bracket3', label: 'Bracket 3', description: 'Optimized casual' },
  { value: 'bracket4', label: 'Bracket 4', description: 'High power' },
  { value: 'bracket5', label: 'Bracket 5', description: 'Fringe competitive' },
  { value: 'cedh', label: 'cEDH', description: 'Perfect tournament optimized deck' },
  { value: 'wild', label: 'GO WILD', description: "I DON'T CARE GO FOR IT DEFCAT" },
] as const

export type ScryfallImageSize = 'png' | 'art' | 'lg' | 'md' | 'sm'
export type CardFace = 'front' | 'back'

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

export interface ApiError {
  message: string
  code: string
  details?: unknown
}