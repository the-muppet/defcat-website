// lib/api/stats.ts
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { getColorIdentity } from '@/lib/utility/color-identity'

type Deck = Database['public']['Tables']['decks']['Row']

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

  // Get all decks with commanders and color identity
  const { data: decks } = await supabase
    .from('decks')
    .select('commanders, color_identity')

  // Calculate unique commanders
  const commanderSet = new Set<string>()
  const commanderCounts = new Map<string, { count: number; colors: string[] }>()

  decks?.forEach(deck => {
    deck.commanders?.forEach(commander => {
      commanderSet.add(commander)
      const existing = commanderCounts.get(commander)
      if (existing) {
        existing.count++
      } else {
        commanderCounts.set(commander, {
          count: 1,
          colors: deck.color_identity || []
        })
      }
    })
  })

  // Find most popular commander
  let mostPopularCommander = null
  let maxCount = 0
  commanderCounts.forEach((data, name) => {
    if (data.count > maxCount) {
      maxCount = data.count
      mostPopularCommander = { name, count: data.count, colors: data.colors }
    }
  })

  // Get most common card across all decks
  const { data: cardCounts } = await supabase.rpc('')

  const mostCommonCard = cardCounts?.[0]
    ? {
      name: cardCounts[0].card_name,
      count: cardCounts[0].deck_count,
      percentage: totalDecks ? (cardCounts[0].deck_count / totalDecks) * 100 : 0
    }
    : null

  // Calculate average mana curve
  const { data: deckCards } = await supabase
    .from('deck_cards')
    .select('deck_id, quantity, cards(cmc)')
    .eq('board_type', 'mainboard')

  // Group cards by deck and calculate CMC distribution per deck
  const deckCurves = new Map<string, Map<number, number>>()

  deckCards?.forEach(dc => {
    const cmc = (dc.cards as any)?.cmc
    if (typeof cmc === 'number' && dc.deck_id) {
      const bucket = cmc > 7 ? 7 : cmc

      if (!deckCurves.has(dc.deck_id)) {
        deckCurves.set(dc.deck_id, new Map<number, number>())
      }

      const deckCurve = deckCurves.get(dc.deck_id)!
      deckCurve.set(bucket, (deckCurve.get(bucket) || 0) + (dc.quantity || 1))
    }
  })

  // Calculate average across all decks
  const avgManaCurve = Array.from({ length: 8 }, (_, cmc) => {
    const totalForCmc = Array.from(deckCurves.values()).reduce(
      (sum, curve) => sum + (curve.get(cmc) || 0),
      0
    )
    return {
      cmc,
      count: deckCurves.size > 0 ? Math.round(totalForCmc / deckCurves.size) : 0
    }
  })

  // Calculate color distribution
  const colorMap = new Map<string, number>()
  decks?.forEach(deck => {
    if (deck.color_identity && deck.color_identity.length > 0) {
      const key = [...deck.color_identity].sort().join('')
      colorMap.set(key, (colorMap.get(key) || 0) + 1)
    }
  })

  const colorDistribution = Array.from(colorMap.entries())
    .map(([colors, count]) => {
      const colorArray = colors.split('')
      const identity = getColorIdentity(colorArray)
      return {
        colors: colorArray,
        name: identity?.name || `${colorArray.length}-Color`,
        count
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalDecks: totalDecks || 0,
    totalCommanders: commanderSet.size,
    mostPopularCommander,
    mostCommonCard,
    avgManaCurve,
    colorDistribution
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

