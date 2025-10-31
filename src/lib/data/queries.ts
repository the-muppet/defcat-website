/**
 * Common Database Queries
 * Type-safe helper functions for frequently used database operations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { db } from '@/types/supabase'

export type Database = db
export type Client = SupabaseClient<Database>

// ============================================================================
// USER & PROFILE QUERIES
// ============================================================================

/**
 * Get user profile with credit information
 */
export async function getUserProfile(supabase: Client, userId: string) {
  return await supabase
    .from('user_credit_details')
    .select('*')
    .eq('user_id', userId)
    .single()
}

/**
 * Get basic profile information
 */
export async function getProfile(supabase: Client, userId: string) {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}

/**
 * Update user profile
 */
export async function updateProfile(
  supabase: Client,
  userId: string,
  updates: {
    email?: string
    moxfield_username?: string | null
  }
) {
  return await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()
}

// ============================================================================
// DECK QUERIES
// ============================================================================

/**
 * List decks with pagination and optional filtering
 */
export async function listDecks(
  supabase: Client,
  options: {
    limit?: number
    offset?: number
    format?: string
    colorIdentity?: string[]
    sortBy?: 'view_count' | 'like_count' | 'created_at' | 'name'
    sortOrder?: 'asc' | 'desc'
  } = {}
) {
  const {
    limit = 20,
    offset = 0,
    format,
    colorIdentity,
    sortBy = 'view_count',
    sortOrder = 'desc',
  } = options

  let query = supabase
    .from('deck_list_view')
    .select('*', { count: 'exact' })

  if (format) {
    query = query.eq('format', format)
  }

  if (colorIdentity && colorIdentity.length > 0) {
    query = query.contains('color_identity', colorIdentity)
  }

  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)

  return await query
}

/**
 * Get single deck by Moxfield ID
 */
export async function getDeckByMoxfieldId(supabase: Client, moxfieldId: string) {
  return await supabase
    .from('moxfield_decks')
    .select('*')
    .eq('moxfield_id', moxfieldId)
    .single()
}

/**
 * Get deck with full details including cards
 */
export async function getDeckWithCards(supabase: Client, moxfieldId: string) {
  const [deckResult, cardsResult] = await Promise.all([
    supabase
      .from('moxfield_decks')
      .select('*')
      .eq('moxfield_id', moxfieldId)
      .single(),
    supabase
      .from('decklist_cards')
      .select('*, cards(*)')
      .eq('moxfield_deck_id', moxfieldId),
  ])

  if (deckResult.error) return deckResult
  if (cardsResult.error) return cardsResult

  return {
    data: {
      ...deckResult.data,
      cards: cardsResult.data,
    },
    error: null,
  }
}

/**
 * Search decks by name or commander
 */
export async function searchDecks(
  supabase: Client,
  searchTerm: string,
  options: {
    limit?: number
    offset?: number
  } = {}
) {
  const { limit = 20, offset = 0 } = options

  return await supabase
    .from('moxfield_decks')
    .select('*', { count: 'exact' })
    .or(`name.ilike.%${searchTerm}%,author_username.ilike.%${searchTerm}%`)
    .range(offset, offset + limit - 1)
}

// ============================================================================
// SUBMISSION QUERIES
// ============================================================================

/**
 * Get user's submissions
 */
export async function getUserSubmissions(supabase: Client, userId: string) {
  return await supabase
    .from('deck_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

/**
 * Get submissions by status
 */
export async function getSubmissionsByStatus(
  supabase: Client,
  status: 'pending' | 'in_progress' | 'completed'
) {
  return await supabase
    .from('deck_submissions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true })
}

/**
 * Create deck submission
 */
export async function createDeckSubmission(
  supabase: Client,
  submission: {
    user_id: string
    patreon_id: string | null
    patreon_username: string
    patreon_tier: string | null
    email: string
    discord_username: string
    moxfield_username?: string | null
    submission_type: 'deck' | 'roast'
    mystery_deck?: boolean
    commander?: string | null
    color_preference?: string | null
    theme?: string | null
    bracket?: string | null
    budget?: string | null
    ideal_date?: string | null
    deck_list_url?: string | null
    coffee_preference?: string | null
    notes?: string | null
  }
) {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  return await supabase
    .from('deck_submissions')
    .insert({
      ...submission,
      submission_month: currentMonth,
      status: 'pending',
    })
    .select()
    .single()
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
  supabase: Client,
  submissionId: string,
  status: 'pending' | 'in_progress' | 'completed'
) {
  return await supabase
    .from('deck_submissions')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single()
}

// ============================================================================
// CREDIT QUERIES
// ============================================================================

/**
 * Get user's current credit balance
 */
export async function getUserCredits(supabase: Client, userId: string) {
  return await supabase
    .from('user_credits')
    .select('credits, last_granted')
    .eq('user_id', userId)
    .single()
}

/**
 * Check if user has sufficient credits
 */
export async function hasCredits(
  supabase: Client,
  userId: string,
  creditType: 'deck' | 'roast',
  amount: number = 1
) {
  const { data, error } = await getUserCredits(supabase, userId)

  if (error || !data) return false

  const credits = data.credits as { deck?: number; roast?: number }
  return (credits[creditType] || 0) >= amount
}

/**
 * Use a credit (via RPC function)
 */
export async function useCredit(
  supabase: Client,
  userId: string,
  submissionType: 'deck' | 'roast'
) {
  return await supabase.rpc('use_credit', {
    p_user_id: userId,
    p_submission_type: submissionType,
  })
}

/**
 * Refund a credit (via RPC function)
 */
export async function refundCredit(
  supabase: Client,
  userId: string,
  submissionType: 'deck' | 'roast',
  submissionMonth: string
) {
  return await supabase.rpc('refund_credit', {
    p_user_id: userId,
    p_submission_type: submissionType,
    p_submission_month: submissionMonth,
  })
}

// ============================================================================
// CARD QUERIES
// ============================================================================

/**
 * Get card by ID
 */
export async function getCard(supabase: Client, cardId: string) {
  return await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()
}

/**
 * Search cards by name
 */
export async function searchCards(
  supabase: Client,
  searchTerm: string,
  options: {
    limit?: number
    colorIdentity?: string[]
  } = {}
) {
  const { limit = 20, colorIdentity } = options

  let query = supabase
    .from('cards')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .limit(limit)

  if (colorIdentity && colorIdentity.length > 0) {
    query = query.contains('color_identity', colorIdentity)
  }

  return await query
}

/**
 * Get cards by color identity
 */
export async function getCardsByColorIdentity(
  supabase: Client,
  colorIdentity: string[],
  limit: number = 50
) {
  return await supabase
    .from('cards')
    .select('*')
    .contains('color_identity', colorIdentity)
    .limit(limit)
}

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

/**
 * Get all active products
 */
export async function getActiveProducts(supabase: Client) {
  return await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  supabase: Client,
  category: string
) {
  return await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
}

// ============================================================================
// ADMIN QUERIES
// ============================================================================

/**
 * Get all users with pagination
 */
export async function getAllUsers(
  supabase: Client,
  options: {
    limit?: number
    offset?: number
  } = {}
) {
  const { limit = 50, offset = 0 } = options

  return await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
}

/**
 * Get submission statistics
 */
export async function getSubmissionStats(supabase: Client) {
  return await supabase
    .from('submission_stats')
    .select('*')
    .single()
}

/**
 * Get update logs
 */
export async function getUpdateLogs(
  supabase: Client,
  options: {
    limit?: number
    operationType?: string
  } = {}
) {
  const { limit = 20, operationType } = options

  let query = supabase
    .from('update_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (operationType) {
    query = query.eq('operation_type', operationType)
  }

  return await query
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a Moxfield deck exists in database
 */
export async function deckExists(supabase: Client, moxfieldId: string) {
  const { count, error } = await supabase
    .from('moxfield_decks')
    .select('*', { count: 'exact', head: true })
    .eq('moxfield_id', moxfieldId)

  return !error && (count || 0) > 0
}

/**
 * Get tier benefits
 */
export async function getTierBenefits(supabase: Client) {
  return await supabase
    .from('tier_benefit_matrix')
    .select('*')
    .order('sort_order', { ascending: true })
}

/**
 * Batch operation: Refresh all user credits
 */
export async function distributeMonthlyCredits(supabase: Client) {
  return await supabase.rpc('distribute_monthly_credits')
}
