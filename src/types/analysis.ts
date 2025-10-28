// lib/types/mana-analysis.ts
export interface ManaColorAnalysis {
  color: 'W' | 'U' | 'B' | 'R' | 'G'
  pips_required: number
  sources_in_deck: number
  land_sources: number
  nonland_sources: number
  cards_needing_color: number
  prob_turn_1: number
  prob_turn_3: number
  prob_turn_5: number
  recommended_sources: number
  source_delta: number
  status: '✅ Optimal' | '⚠️ Acceptable' | '❌ Insufficient'
  recommendation: string
}

export interface ManaHealthScore {
  overall_score: number
  grade: string
  colors_optimal: number
  colors_acceptable: number
  colors_insufficient: number
  total_lands: number
  unique_mana_sources: number
  total_color_pips: number
  fixing_lands: number
  recommendations: string[] | null
}

export interface DeckManaAnalysis {
  deck_id: string
  deck_name: string
  commanders: string[]
  color_identity: string[]
  total_cards: number
  mana_analysis: ManaColorAnalysis[]
  health_score: ManaHealthScore
}
