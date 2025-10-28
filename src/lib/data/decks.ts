'use cache'

import { createClient } from '@/lib/supabase/server'
import type { Deck } from '@/types/core'

export async function getDecks() {
  const supabase = await createClient()

  const { data: decks, error } = await supabase
    .from('decks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch decks:', error)
    return []
  }

  return decks as Deck[]
}

export async function getDeckById(id: string) {
  const supabase = await createClient()

  const { data: deck, error } = await supabase.from('decks').select('*').eq('id', id).single()

  if (error) {
    console.error('Failed to fetch deck:', error)
    return null
  }

  return deck as Deck
}

export async function getFeaturedDecks(limit = 6) {
  const supabase = await createClient()

  const { data: decks, error } = await supabase
    .from('decks')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch featured decks:', error)
    return []
  }

  return decks as Deck[]
}
