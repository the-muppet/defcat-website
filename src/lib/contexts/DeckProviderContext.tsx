'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useMemo } from 'react'
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
      // returning deck contents now requires a table join - we can use "*" here
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('view_count', { ascending: false })
      if (error) throw error
      setDecks(data || [])
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
