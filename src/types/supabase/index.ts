import { Database } from './generated';

export type Deck = Database['public']['Tables']['moxfield_decks']['Row']
export type DeckInsert = Database['public']['Tables']['moxfield_decks']['Insert']
export type DeckUpdate = Database['public']['Tables']['moxfield_decks']['Update']

export type Card = Database['public']['Tables']['cards']['Row']
export type CardInsert = Database['public']['Tables']['cards']['Insert']
export type CardUpdate = Database['public']['Tables']['cards']['Update']

export type DecklistCard = Database['public']['Tables']['decklist_cards']['Row']
export type DecklistCardInsert = Database['public']['Tables']['decklist_cards']['Insert']
export type DecklistCardUpdate = Database['public']['Tables']['decklist_cards']['Update']

export type FullCard = Database['public']['Views']['deck_list_view']['Row']

export type DeckWithCards = Deck & {
  decklist_cards: (DecklistCard & {
    cards: Card | null
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


export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type PatreonTier = Database['public']['Enums']['patreon_tier']


export type db = Database