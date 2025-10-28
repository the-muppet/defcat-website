// lib/api/stats.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ColorIdentity } from '@/types/colors'
import type { Database } from '@/types/supabase'

type Deck = Database['public']['Tables']['decks']['Row']

export interface TopCommanderStats {
  idx: number
  commander: string
  deckCount: number
  avgViews: string
  avgLikes: string
  totalViews: number
  totalLikes: number
  colorIdentity: string[]
}

export interface StapleCards {
  idx: number
  cardID: string
  cardName: string
  typeLine: string
  manaCost: string
  cmc: string
  colors: string[]
  rarity: string
  deckCount: number
  totalCopies: number
  avgCopiesPerDeck: string
  inclusionRate: string
}

export interface SetDistribution {
  idx: number
  setCode: string
  setName: string
  uniqueCards: number
  totalInstances: number
  deckCount: number
  avgCardsPerDeck: string
}

export interface ManaCurve {
  idx: number
  cmc: number
  cardCount: number
  uniqueCards: number
  avgPerDeck: string
  percentage: string
}

export interface DeckStats {
  totalDecks: number
  totalCommanders: number
  mostPopularCommander: {
    name: string
    count: number
    colors: string[]
  } | null
  mostCommonCard: {
    name: string
    count: number
    percentage: number
  } | null
  avgManaCurve: Array<{ cmc: number; count: number }>
  colorDistribution: Array<{
    colors: string[]
    name: string
    count: number
  }>
}

export async function getDeckStats(): Promise<DeckStats> {
  const supabase = createClient()

  // Get total decks
  const { count: totalDecks } = await supabase
    .from('decks')
    .select('*', { count: 'exact', head: true })

  // Get top commanders from materialized view
  const { data: topCommandersData } = await supabase
    .from('top_commanders_mv')
    .select('commander, deck_count, color_identity')
    .order('deck_count', { ascending: false })
    .limit(1)

  const { count: totalCommanders } = await supabase
    .from('top_commanders_mv')
    .select('*', { count: 'exact', head: true })

  const mostPopularCommander = topCommandersData?.[0]
    ? {
        name: topCommandersData[0].commander || '',
        count: topCommandersData[0].deck_count || 0,
        colors: topCommandersData[0].color_identity || [],
      }
    : null

  // Get most common card across all decks
  const { data: cardCounts } = await supabase
    .from('staple_cards_mv')
    .select('*')
    .order('deck_count', { ascending: false })
    .limit(1)

  const mostCommonCard =
    cardCounts?.[0]?.card_name && cardCounts[0]?.deck_count
      ? {
          name: cardCounts[0].card_name,
          count: cardCounts[0].deck_count,
          percentage: totalDecks ? (cardCounts[0].deck_count / totalDecks) * 100 : 0,
        }
      : null

  // Get average mana curve from materialized view
  const { data: manaCurveData } = await supabase
    .from('average_mana_curve_mv')
    .select('cmc, card_count')
    .order('cmc', { ascending: true })

  const avgManaCurve =
    manaCurveData?.map((row) => ({
      cmc: row.cmc || 0,
      count: row.card_count || 0,
    })) || []

  // Get all decks for color distribution
  const { data: decks } = await supabase.from('decks').select('color_identity')

  // Calculate color distribution
  const colorMap = new Map<string, number>()
  decks?.forEach((deck) => {
    if (deck.color_identity && deck.color_identity.length > 0) {
      const key = [...deck.color_identity].sort().join('')
      colorMap.set(key, (colorMap.get(key) || 0) + 1)
    }
  })

  const colorDistribution = Array.from(colorMap.entries())
    .map(([colors, count]) => {
      const colorArray = colors.split('')
      const name = ColorIdentity.getName(colorArray)
      return {
        colors: colorArray,
        name,
        count,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalDecks: totalDecks || 0,
    totalCommanders: totalCommanders || 0,
    mostPopularCommander,
    mostCommonCard,
    avgManaCurve,
    colorDistribution,
  }
}

export async function getLatestDeck(): Promise<Deck | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from('decks')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

/**
 * React Query hook for deck statistics
 * Caches results to prevent infinite fetching - data updates weekly
 */
export function useDeckStats() {
  return useQuery({
    queryKey: ['deckStats'],
    queryFn: getDeckStats,
    staleTime: Infinity, // Never refetch automatically - data updates weekly
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * React Query hook for latest featured deck
 * Caches results to prevent infinite fetching - data updates weekly
 */
export function useLatestDeck() {
  return useQuery({
    queryKey: ['latestDeck'],
    queryFn: getLatestDeck,
    staleTime: Infinity, // Never refetch automatically - data updates weekly
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
}
