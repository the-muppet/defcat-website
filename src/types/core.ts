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

export type UserRole = 'anon' | 'user' | 'admin' | 'moderator' | 'developer'

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


export type ColorMapping = {
  name: string
  className: string
  individual: string[] // For fallback rendering
}

export const COLOR_MAPPINGS: Record<string, ColorMapping> = {
  // Mono-color
  'W': { name: 'White', className: 'ms-w', individual: ['W'] },
  'U': { name: 'Blue', className: 'ms-u', individual: ['U'] },
  'B': { name: 'Black', className: 'ms-b', individual: ['B'] },
  'R': { name: 'Red', className: 'ms-r', individual: ['R'] },
  'G': { name: 'Green', className: 'ms-g', individual: ['G'] },
  'C': { name: 'Colorless', className: 'ms-c', individual: ['C'] },
  
  // 2-color guilds
  'WU': { name: 'Azorius', className: 'ms-guild-azorius', individual: ['W', 'U'] },
  'WB': { name: 'Orzhov', className: 'ms-guild-orzhov', individual: ['W', 'B'] },
  'UB': { name: 'Dimir', className: 'ms-guild-dimir', individual: ['U', 'B'] },
  'UR': { name: 'Izzet', className: 'ms-guild-izzet', individual: ['U', 'R'] },
  'BR': { name: 'Rakdos', className: 'ms-guild-rakdos', individual: ['B', 'R'] },
  'BG': { name: 'Golgari', className: 'ms-guild-golgari', individual: ['B', 'G'] },
  'RG': { name: 'Gruul', className: 'ms-guild-gruul', individual: ['R', 'G'] },
  'RW': { name: 'Boros', className: 'ms-guild-boros', individual: ['R', 'W'] },
  'GW': { name: 'Selesnya', className: 'ms-guild-selesnya', individual: ['G', 'W'] },
  'GU': { name: 'Simic', className: 'ms-guild-simic', individual: ['G', 'U'] },
  
  // 3-color shards
  'WUB': { name: 'Esper', className: 'ms-clan-esper', individual: ['W', 'U', 'B'] },
  'UBR': { name: 'Grixis', className: 'ms-clan-grixis', individual: ['U', 'B', 'R'] },
  'BRG': { name: 'Jund', className: 'ms-clan-jund', individual: ['B', 'R', 'G'] },
  'RGW': { name: 'Naya', className: 'ms-clan-naya', individual: ['R', 'G', 'W'] },
  'GWU': { name: 'Bant', className: 'ms-clan-bant', individual: ['G', 'W', 'U'] },
  
  // 3-color wedges
  'WBG': { name: 'Abzan', className: 'ms-clan-abzan', individual: ['W', 'B', 'G'] },
  'URW': { name: 'Jeskai', className: 'ms-clan-jeskai', individual: ['U', 'R', 'W'] },
  'BRW': { name: 'Mardu', className: 'ms-clan-mardu', individual: ['B', 'R', 'W'] },
  'GUB': { name: 'Sultai', className: 'ms-clan-sultai', individual: ['G', 'U', 'B'] },
  'RGU': { name: 'Temur', className: 'ms-clan-temur', individual: ['R', 'G', 'U'] },
  
  // 4-color
  'UBRG': { name: 'No White', className: 'ms-ci-ubrg', individual: ['U', 'B', 'R', 'G'] },
  'BRGW': { name: 'No Blue', className: 'ms-ci-brgw', individual: ['B', 'R', 'G', 'W'] },
  'RGWU': { name: 'No Black', className: 'ms-ci-rgwu', individual: ['R', 'G', 'W', 'U'] },
  'GWUB': { name: 'No Red', className: 'ms-ci-gwub', individual: ['G', 'W', 'U', 'B'] },
  'WUBR': { name: 'No Green', className: 'ms-ci-wubr', individual: ['W', 'U', 'B', 'R'] },
  
  // 5-color
  'WUBRG': { name: 'Five Color', className: 'watermark-colorpie', individual: ['W', 'U', 'B', 'R', 'G'] },
}

export const bracketOptions = [
    { value: 'bracket1', label: 'Bracket 1', description: 'Casual, precon level' },
    { value: 'bracket2', label: 'Bracket 2', description: 'Focused casual' },
    { value: 'bracket3', label: 'Bracket 3', description: 'Optimized casual' },
    { value: 'bracket4', label: 'Bracket 4', description: 'High power' },
    { value: 'bracket5', label: 'Bracket 5', description: 'Fringe competitive' },
    { value: 'cedh', label: 'cEDH', description: 'Perfect tournament optimized deck' },
    { value: 'wild', label: 'GO WILD', description: "I DON'T CARE GO FOR IT DEFCAT" },
];