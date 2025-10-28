'use client'

import { useEffect, useState } from 'react'
import { deckCache } from '@/lib/cache/indexed-db'
import { createClient } from '@/lib/supabase/client'
import type { Deck } from '@/types/core'

interface UseCachedDeckResult {
  deck: Deck | null
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch a deck with IndexedDB caching
 * Checks cache first, then fetches from Supabase if not found
 */
export function useCachedDeck(deckId: string | null): UseCachedDeckResult {
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!deckId) {
      setDeck(null)
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchDeck() {
      try {
        setLoading(true)
        setError(null)

        // Check cache first
        const cached = await deckCache.get<Deck>(deckId!)
        if (cached && mounted) {
          setDeck(cached)
          setLoading(false)
          return
        }

        // Fetch from Supabase if not in cache
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('decks')
          .select('*')
          .eq('id', deckId!)
          .single()

        if (fetchError) throw fetchError

        if (mounted && data) {
          setDeck(data)
          // Cache the result
          await deckCache.set(deckId!, data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch deck')
          console.error('Error fetching deck:', err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchDeck()

    return () => {
      mounted = false
    }
  }, [deckId])

  return { deck, loading, error }
}
