// lib/api/mana-analysis.ts
import { createClient } from '@/lib/supabase/client'
import type { DeckManaAnalysis } from '@/types/analysis'

export async function getDeckManaAnalysis(deckId: string): Promise<DeckManaAnalysis> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_deck_mana_analysis', {
    p_deck_id: deckId,
  })

  if (error) {
    console.error('Error fetching mana analysis:', error)
    throw error
  }

  if (!data) {
    throw new Error('No analysis data returned')
  }

  // Proper type assertion with validation
  return data as unknown as DeckManaAnalysis
}

export async function batchAnalyzeDecks(batchSize = 20) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('populate_deck_analysis_cache', {
    batch_size: batchSize,
    offset_start: 0,
  })

  if (error) throw error
  return data
}

export async function getCachedAnalysis(deckId: string): Promise<DeckManaAnalysis> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('deck_mana_analysis_cache')
    .select('analysis, analyzed_at')
    .eq('deck_id', deckId)
    .single()

  if (error) {
    // Not cached, fetch fresh
    return getDeckManaAnalysis(deckId)
  }

  // The analysis field is JSONB, so we need to cast it
  return data.analysis as unknown as DeckManaAnalysis
}

// Optional: Add a validation function if you want runtime checks
function validateDeckManaAnalysis(data: unknown): data is DeckManaAnalysis {
  const d = data as any
  return (
    typeof d?.deck_id === 'string' &&
    typeof d?.deck_name === 'string' &&
    Array.isArray(d?.commanders) &&
    Array.isArray(d?.color_identity) &&
    typeof d?.total_cards === 'number' &&
    Array.isArray(d?.mana_analysis) &&
    typeof d?.health_score === 'object'
  )
}

// Use the validator if you want stricter runtime checks
export async function getDeckManaAnalysisValidated(deckId: string): Promise<DeckManaAnalysis> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_deck_mana_analysis', {
    p_deck_id: deckId,
  })

  if (error) throw error
  if (!data) throw new Error('No analysis data returned')

  const analysis = data as unknown as DeckManaAnalysis

  if (!validateDeckManaAnalysis(analysis)) {
    throw new Error('Invalid analysis data structure')
  }

  return analysis
}
