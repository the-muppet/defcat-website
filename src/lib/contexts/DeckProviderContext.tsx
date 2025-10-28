'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Deck } from '@/types/core'

interface DeckContextType {
  decks: Deck[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const DeckContext = createContext<DeckContextType | undefined>(undefined)

export function DeckProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  const fetchDecks = async () => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    const supabase = createClient()

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('moxfield_decks')
        .select('*')
        .order('view_count', { ascending: false })

      if (error) throw error

      const mappedDecks = (data || []).map((deck) => ({
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
      }))

      setDecks(mappedDecks)
    } catch (err) {
      setError(err instanceof Error ? err.message : `An error occurred: ${err}`)
      console.error('Error fetching decks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDecks()
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ decks, loading, error, refetch: fetchDecks }),
    [decks, loading, error]
  )

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>
}

export function useDecks() {
  const context = useContext(DeckContext)
  if (context === undefined) {
    throw new Error('useDecks must be used within a DeckProvider')
  }
  return context
}
