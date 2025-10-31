import { Database } from './generated';

export type Deck = Database['public']['Tables']['moxfield_decks']['Row']
export type DeckInfo = Database['public']['Views']['mox_decks']['Row']
export type Card = Database['public']['Tables']['cards']['Row']

export type DecklistCard = Database['public']['Tables']['decklist_cards']['Row']

export type FullCard = Database['public']['Views']['deck_list_view']['Row']

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


export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type PatreonTier = Database['public']['Enums']['patreon_tier']


export type db = Database