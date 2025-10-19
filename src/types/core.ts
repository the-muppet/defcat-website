/**
 * Core type definitions for the cEDH Decklist Database
 */

// Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
  patreon_id: string;
  patreon_tier: string;
  role: UserRole
}

export type PatreonTier = 'Citizen' | 'Knight' | 'Emissary' | 'Duke' | 'Wizard' | 'ArchMage'

export type UserRole = 'anon' | 'user' | 'admin' | 'moderator'

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
  created_at?: string | null
  updated_at?: string | null
}

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G'

export interface DeckFilters {
  commanders?: string[]
  colors?: ManaColor[]
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
  quantity: number;
  board_type: string;
  cards: {
    name: string;
    mana_cost: string | null;
    type_line: string | null;
    cmc: number | null;
    image_url: string | null;
  } | null;
}
