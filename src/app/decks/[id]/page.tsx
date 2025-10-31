// app/decks/[id]/page.tsx
'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { useDeck } from '@/lib/hooks/useDecks'
import { DeckDetailLayout } from '@/components/decks/detail/DeckDetailLayout'
import { DeckDetailLoading } from '@/components/decks/detail/DeckDetailLoading'
import { DeckDetailError } from '@/components/decks/detail/DeckDetailError'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DeckDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: deck, cards, isLoading, error } = useDeck(id)

  if (isLoading) {
    return <DeckDetailLoading />
  }

  if (error) {
    return <DeckDetailError error={error} />
  }

  if (!deck) {
    notFound()
  }

  return <DeckDetailLayout deck={deck} cards={cards || []} />
}