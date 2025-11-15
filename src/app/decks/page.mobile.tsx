// app/decks/page.mobile.tsx
'use client'

import { useDecks } from '@/lib/hooks/useDecks'
import { MobileDeckList } from '@/components/mobile/MobileDeckList'

export default function MobileDecksPage() {
  const { data: decks = [], isLoading, error } = useDecks()

  return (
    <MobileDeckList 
      decks={decks} 
      isLoading={isLoading} 
      error={error ? new Error(error.message) : null}
    />
  )
}
