/**
 * React Query Hooks for Deck Data
 * Replaces the old DeckProvider context with React Query for better caching and performance
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Deck } from '@/types/core';

/**
 * Hook to fetch all decks
 * Includes automatic caching and refetching
 */
export function useDecks() {
  return useQuery({
    queryKey: ['decks'],
    queryFn: async (): Promise<Deck[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('decks')
        .select('*');

      if (error) throw error;

      const decks = data || [];

      return decks.map((deck): Deck => ({
        ...deck,
        commanders: deck.commanders || [],
        color_identity: deck.color_identity || []
      }));
    },
    staleTime: Infinity, // Never refetch - data updates weekly
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Hook to fetch a single deck by ID
 * Useful for deck detail pages to avoid fetching all decks
 */
export function useDeckInfo(id: string) {
  return useQuery({
    queryKey: ['deckInfo', id],
    queryFn: async (): Promise<Deck | null> => {
      if (!id) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}

interface DeckCard {
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

/**
 * Hook to fetch deck cards (decklist)
 * Fetches all cards in a deck's mainboard
 */
export function useDecklist(id: string) {
  return useQuery({
    queryKey: ['decklist', id],
    queryFn: async (): Promise<DeckCard[]> => {
      if (!id) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from('deck_cards')
        .select(`
          quantity,
          board_type,
          cards (
            name,
            mana_cost,
            type_line,
            cmc,
            image_url
          )
        `)
        .eq('deck_id', id)
        .eq('board_type', 'mainboard');

      if (error) throw error;
      return (data as DeckCard[]) || [];
    },
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}

/**
 * Combined hook to fetch both deck info and decklist
 * Returns both the deck metadata and its cards
 */
export function useDeck(id: string) {
  const deckInfo = useDeckInfo(id);
  const decklist = useDecklist(id);

  return {
    data: deckInfo.data,
    cards: decklist.data,
    isLoading: deckInfo.isLoading || decklist.isLoading,
    error: deckInfo.error || decklist.error,
    isError: deckInfo.isError || decklist.isError,
    refetch: () => {
      deckInfo.refetch();
      decklist.refetch();
    },
  };
}

