// hooks/useMoxfieldDeck.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import type { MoxfieldDeck } from '@/types/moxfield'

async function fetchMoxfieldDeck(publicId: string): Promise<MoxfieldDeck> {
  const response = await fetch('/api/moxfield', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicId,
      action: 'get',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch deck: ${response.statusText}`)
  }

  return response.json()
}

export function useMoxfieldDeck(publicId: string) {
  return useQuery({
    queryKey: ['moxfield-deck', publicId],
    queryFn: () => fetchMoxfieldDeck(publicId),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!publicId,
  })
}
