/**
 * React Query Hooks for Deck Data
 * Replaces the old DeckProvider context with React Query for better caching and performance
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Deck } from '@/types/core'

/**
 * Hook to fetch all decks
 * Includes automatic caching and refetching
 */
export function useDecks() {
  return useQuery({
    queryKey: ['decks'],
    queryFn: async (): Promise<Deck[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.from('moxfield_decks').select('*')

      if (error) throw error

      const decks = data || []

      return decks.map(
        (deck): Deck => ({
          id: deck.moxfield_id,
          moxfield_id: deck.moxfield_id,
          moxfield_url: deck.public_url,
          name: deck.name,
          commanders: deck.raw_data?.commanders?.map((c: any) => c.name).filter(Boolean) || [],
          color_identity: deck.raw_data?.colorIdentity || [],
          format: deck.format,
          description: deck.raw_data?.description || null,
          view_count: deck.view_count,
          like_count: deck.like_count,
          comment_count: deck.comment_count,
          created_at: deck.created_at,
          updated_at: deck.last_updated_at,
        })
      )
    },
    staleTime: Infinity, // Never refetch - data updates weekly
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Hook to fetch a single deck by moxfield_id
 * Useful for deck detail pages to avoid fetching all decks
 */
export function useDeckInfo(id: string) {
  return useQuery({
    queryKey: ['deckInfo', id],
    queryFn: async (): Promise<Deck | null> => {
      if (!id) return null

      const supabase = createClient()
      const { data, error } = await supabase
        .from('moxfield_decks')
        .select('*')
        .eq('moxfield_id', id)
        .single()

      if (error) throw error

      return {
        id: data.moxfield_id,
        moxfield_id: data.moxfield_id,
        moxfield_url: data.public_url,
        name: data.name,
        commanders: data.raw_data?.commanders?.map((c: any) => c.name).filter(Boolean) || [],
        color_identity: data.raw_data?.colorIdentity || [],
        format: data.format,
        description: data.raw_data?.description || null,
        view_count: data.view_count,
        like_count: data.like_count,
        comment_count: data.comment_count,
        created_at: data.created_at,
        updated_at: data.last_updated_at,
      }
    },
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  })
}

interface DeckCard {
  quantity: number
  board: string
  cards: {
    name: string
    mana_cost: string | null
    type_line: string | null
    cmc: number | null
    image_url: string | null
    scryfall_id: string | null
  } | null
}

/**
 * Hook to fetch deck cards (decklist)
 * Fetches all cards in a deck's mainboard
 * @param id - The moxfield_id of the deck
 */
export function useDecklist(id: string) {
  return useQuery({
    queryKey: ['decklist', id],
    queryFn: async (): Promise<DeckCard[]> => {
      if (!id) return []

      const supabase = createClient()

      // Query decklist_cards directly using moxfield_id
      const { data, error } = await supabase
        .from('decklist_cards')
        .select(`
          quantity,
          board,
          cards (
            name,
            mana_cost,
            type_line,
            cmc,
            scryfall_id,
            cached_image_url
          )
        `)
        .eq('moxfield_deck_id', id)

      if (error) throw error
      return (data as DeckCard[]) || []
    },
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  })
}

/**
 * Combined hook to fetch both deck info and decklist
 * Returns both the deck metadata and its cards
 */
export function useDeck(id: string) {
  const deckInfo = useDeckInfo(id)
  const decklist = useDecklist(id)

  return {
    data: deckInfo.data,
    cards: decklist.data,
    isLoading: deckInfo.isLoading || decklist.isLoading,
    error: deckInfo.error || decklist.error,
    isError: deckInfo.isError || decklist.isError,
    refetch: () => {
      deckInfo.refetch()
      decklist.refetch()
    },
  }
}
